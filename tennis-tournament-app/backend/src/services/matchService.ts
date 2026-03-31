import prisma from '../lib/prisma';

/**
 * Generates a single-elimination bracket for a tournament.
 * Players count must be a power of 2.
 * Creates Match records linked via nextMatchId to form the bracket tree.
 */
export async function generateBracket(tournamentId: string, requesterId: string) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { registrations: { include: { user: true } } },
  });
  if (!tournament) throw new Error('Torneo no encontrado');
  if (tournament.createdById !== requesterId) throw new Error('Sin permisos');
  if (tournament.status !== 'FULL' && tournament.status !== 'OPEN')
    throw new Error('El torneo debe estar OPEN o FULL para generar el bracket');

  const players = tournament.registrations.map((r) => r.user);
  const n = players.length;

  if (n < 2) throw new Error('Se necesitan al menos 2 jugadores');
  if ((n & (n - 1)) !== 0) throw new Error('El número de jugadores debe ser potencia de 2');

  // Delete any existing matches
  await prisma.match.deleteMany({ where: { tournamentId } });

  const totalRounds = Math.log2(n);

  // We'll build matches from the LAST round (final) backwards so we can set nextMatchId.
  // Round numbering: 1 = first round, totalRounds = final.
  // Positions per round: round r → n / 2^r matches.

  // First pass: create all matches without nextMatchId, store ids by round/position.
  const matchIdMap: Record<string, string> = {}; // key: `${round}-${position}`

  for (let round = 1; round <= totalRounds; round++) {
    const matchesInRound = n / Math.pow(2, round);
    for (let pos = 1; pos <= matchesInRound; pos++) {
      const match = await prisma.match.create({
        data: {
          tournamentId,
          round,
          position: pos,
          status: 'PENDING',
        },
      });
      matchIdMap[`${round}-${pos}`] = match.id;
    }
  }

  // Second pass: set nextMatchId for all matches except the final.
  // Winner of match at (round, pos) advances to (round+1, ceil(pos/2)).
  for (let round = 1; round < totalRounds; round++) {
    const matchesInRound = n / Math.pow(2, round);
    for (let pos = 1; pos <= matchesInRound; pos++) {
      const nextPos = Math.ceil(pos / 2);
      const nextMatchId = matchIdMap[`${round + 1}-${nextPos}`];
      await prisma.match.update({
        where: { id: matchIdMap[`${round}-${pos}`] },
        data: { nextMatchId },
      });
    }
  }

  // Third pass: assign players to round 1 matches.
  // Shuffle for random seeding.
  const shuffled = [...players].sort(() => Math.random() - 0.5);
  for (let pos = 1; pos <= n / 2; pos++) {
    const p1 = shuffled[(pos - 1) * 2];
    const p2 = shuffled[(pos - 1) * 2 + 1];
    await prisma.match.update({
      where: { id: matchIdMap[`1-${pos}`] },
      data: { player1Id: p1.id, player2Id: p2.id },
    });
  }

  // Update tournament status to IN_PROGRESS
  await prisma.tournament.update({ where: { id: tournamentId }, data: { status: 'IN_PROGRESS' } });

  return prisma.match.findMany({
    where: { tournamentId },
    orderBy: [{ round: 'asc' }, { position: 'asc' }],
    include: {
      player1: { select: { id: true, name: true } },
      player2: { select: { id: true, name: true } },
      winner: { select: { id: true, name: true } },
    },
  });
}

export async function getMatches(tournamentId: string) {
  return prisma.match.findMany({
    where: { tournamentId },
    orderBy: [{ round: 'asc' }, { position: 'asc' }],
    include: {
      player1: { select: { id: true, name: true } },
      player2: { select: { id: true, name: true } },
      winner: { select: { id: true, name: true } },
    },
  });
}

/**
 * Report match result. The reporter (player1 or player2) nominates a winner.
 * Status goes to PENDING_CONFIRMATION.
 */
export async function reportResult(matchId: string, winnerId: string, reporterId: string) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) throw new Error('Partido no encontrado');
  if (match.status !== 'PENDING')
    throw new Error('Solo se puede reportar el resultado de partidos PENDING');

  if (match.player1Id !== reporterId && match.player2Id !== reporterId)
    throw new Error('Solo los jugadores del partido pueden reportar el resultado');

  if (winnerId !== match.player1Id && winnerId !== match.player2Id)
    throw new Error('El ganador debe ser uno de los jugadores del partido');

  return prisma.match.update({
    where: { id: matchId },
    data: { winnerId, reportedById: reporterId, status: 'PENDING_CONFIRMATION' },
  });
}

/**
 * Confirm result. The OTHER player (not the reporter) confirms.
 * Status → CONFIRMED. Winner advances to the next match.
 */
export async function confirmResult(matchId: string, confirmerId: string) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) throw new Error('Partido no encontrado');
  if (match.status !== 'PENDING_CONFIRMATION')
    throw new Error('El partido no está en estado PENDING_CONFIRMATION');

  if (match.reportedById === confirmerId)
    throw new Error('El jugador que reportó no puede confirmar el resultado');

  if (match.player1Id !== confirmerId && match.player2Id !== confirmerId)
    throw new Error('Solo los jugadores del partido pueden confirmar el resultado');

  const confirmed = await prisma.match.update({
    where: { id: matchId },
    data: { status: 'CONFIRMED' },
  });

  // Advance winner to next match
  if (match.nextMatchId && match.winnerId) {
    const nextMatch = await prisma.match.findUnique({ where: { id: match.nextMatchId } });
    if (nextMatch) {
      // Place winner in the first available slot
      if (!nextMatch.player1Id) {
        await prisma.match.update({ where: { id: match.nextMatchId }, data: { player1Id: match.winnerId } });
      } else if (!nextMatch.player2Id) {
        await prisma.match.update({ where: { id: match.nextMatchId }, data: { player2Id: match.winnerId } });
      }
    }
  }

  // Check if this was the final (no nextMatchId) → tournament FINISHED
  if (!match.nextMatchId) {
    await prisma.tournament.update({
      where: { id: match.tournamentId },
      data: { status: 'FINISHED' },
    });
  }

  return confirmed;
}

/**
 * Dispute result. Sets status → DISPUTED for organizer review.
 */
export async function disputeResult(matchId: string, userId: string) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) throw new Error('Partido no encontrado');
  if (match.status !== 'PENDING_CONFIRMATION')
    throw new Error('Solo se puede disputar un resultado PENDING_CONFIRMATION');
  if (match.player1Id !== userId && match.player2Id !== userId)
    throw new Error('Solo los jugadores del partido pueden disputar el resultado');

  return prisma.match.update({
    where: { id: matchId },
    data: { status: 'DISPUTED', winnerId: null },
  });
}
