import prisma from '../lib/prisma';
import { ServiceError } from '../lib/errors';

/**
 * Generate a single-elimination bracket for a tournament.
 * Creates all Match records with nextMatchId links.
 */
export async function generateBracket(tournamentId: string, organizerId: string) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      registrations: { include: { user: { select: { id: true, name: true } } } },
    },
  });

  if (!tournament) {
    throw new ServiceError(404, 'Torneo no encontrado');
  }

  if (tournament.createdById !== organizerId) {
    throw new ServiceError(403, 'Solo el organizador del torneo puede iniciar el cuadro');
  }

  if (tournament.status !== 'FULL') {
    throw new ServiceError(400, 'El torneo debe estar completo (FULL) para generar el cuadro');
  }

  // Check if bracket already generated
  const existingMatches = await prisma.match.count({ where: { tournamentId } });
  if (existingMatches > 0) {
    throw new ServiceError(409, 'El cuadro ya ha sido generado');
  }

  // Shuffle participants
  const players = tournament.registrations
    .map((r) => r.user)
    .sort(() => Math.random() - 0.5);

  const n = players.length; // must be power of 2
  const totalRounds = Math.log2(n);

  // Build bracket bottom-up: create all matches per round starting from the final
  // We need to create matches round by round from final to first,
  // then assign players to round 1 matches.

  // Total matches = n - 1
  // Round 1 has n/2 matches, round 2 has n/4, ..., final has 1

  // Create matches bottom-up for nextMatchId linking
  // matchesByRound[round] = array of match IDs
  const matchesByRound: string[][] = [];

  // Create from final (round = totalRounds) down to round 1
  for (let round = totalRounds; round >= 1; round--) {
    const matchesInRound = Math.pow(2, totalRounds - round);
    const roundMatches: string[] = [];

    for (let i = 0; i < matchesInRound; i++) {
      // nextMatchId: the match in the next round that this match feeds into
      let nextMatchId: string | null = null;
      if (round < totalRounds) {
        // This match feeds into match floor(i/2) of the next round
        const nextRoundMatches = matchesByRound[matchesByRound.length - 1];
        nextMatchId = nextRoundMatches[Math.floor(i / 2)];
      }

      const match = await prisma.match.create({
        data: {
          tournamentId,
          round,
          nextMatchId,
          status: 'PENDING',
        },
      });

      roundMatches.push(match.id);
    }

    matchesByRound.push(roundMatches);
  }

  // matchesByRound is in reverse order: [final], [semi1, semi2], ..., [round1 matches]
  // Round 1 matches are the last array
  const round1MatchIds = matchesByRound[matchesByRound.length - 1];

  // Assign players to round 1 matches
  for (let i = 0; i < round1MatchIds.length; i++) {
    await prisma.match.update({
      where: { id: round1MatchIds[i] },
      data: {
        player1Id: players[i * 2].id,
        player2Id: players[i * 2 + 1].id,
      },
    });
  }

  // Update tournament status to IN_PROGRESS
  await prisma.tournament.update({
    where: { id: tournamentId },
    data: { status: 'IN_PROGRESS' },
  });

  return getMatchesByTournament(tournamentId);
}

/**
 * Get all matches for a tournament, ordered by round.
 */
export async function getMatchesByTournament(tournamentId: string) {
  const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
  if (!tournament) {
    throw new ServiceError(404, 'Torneo no encontrado');
  }

  return prisma.match.findMany({
    where: { tournamentId },
    include: {
      player1: { select: { id: true, name: true } },
      player2: { select: { id: true, name: true } },
      winner: { select: { id: true, name: true } },
    },
    orderBy: [{ round: 'asc' }, { createdAt: 'asc' }],
  });
}

/**
 * Report the result of a match.
 * The organizer selects the winner; the winner advances to the next match.
 */
export async function reportResult(
  matchId: string,
  winnerId: string,
  result: string,
  reportedById: string,
) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { tournament: true },
  });

  if (!match) {
    throw new ServiceError(404, 'Partido no encontrado');
  }

  if (match.tournament.createdById !== reportedById) {
    throw new ServiceError(403, 'Solo el organizador puede reportar resultados');
  }

  if (match.status === 'CONFIRMED') {
    throw new ServiceError(400, 'Este partido ya tiene un resultado confirmado');
  }

  if (!match.player1Id || !match.player2Id) {
    throw new ServiceError(400, 'Este partido aún no tiene ambos jugadores asignados');
  }

  if (winnerId !== match.player1Id && winnerId !== match.player2Id) {
    throw new ServiceError(400, 'El ganador debe ser uno de los jugadores del partido');
  }

  // Update match with result
  const updatedMatch = await prisma.match.update({
    where: { id: matchId },
    data: {
      winnerId,
      result,
      reportedById,
      status: 'CONFIRMED',
    },
    include: {
      player1: { select: { id: true, name: true } },
      player2: { select: { id: true, name: true } },
      winner: { select: { id: true, name: true } },
    },
  });

  // Advance winner to next match if there is one
  if (match.nextMatchId) {
    const nextMatch = await prisma.match.findUnique({
      where: { id: match.nextMatchId },
    });

    if (nextMatch) {
      // Assign winner as player1 or player2 of next match
      const updateData = !nextMatch.player1Id
        ? { player1Id: winnerId }
        : { player2Id: winnerId };

      await prisma.match.update({
        where: { id: match.nextMatchId },
        data: updateData,
      });
    }
  } else {
    // This was the final match — mark tournament as FINISHED
    await prisma.tournament.update({
      where: { id: match.tournamentId },
      data: { status: 'FINISHED' },
    });
  }

  return updatedMatch;
}
