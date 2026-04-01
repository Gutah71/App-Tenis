import prisma from '../lib/prisma';
import {
  sendMatchAssignedEmail,
  sendMatchScheduledEmail,
  sendConfirmResultEmail,
} from './emailService';

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
  if ((n & (n - 1)) !== 0) throw new Error('El numero de jugadores debe ser potencia de 2');

  await prisma.match.deleteMany({ where: { tournamentId } });

  const totalRounds = Math.log2(n);
  const matchIdMap: Record<string, string> = {};

  for (let round = 1; round <= totalRounds; round++) {
    const count = n / Math.pow(2, round);
    for (let pos = 1; pos <= count; pos++) {
      const match = await prisma.match.create({
        data: { tournamentId, round, position: pos, status: 'PENDING' },
      });
      matchIdMap[`${round}-${pos}`] = match.id;
    }
  }

  for (let round = 1; round < totalRounds; round++) {
    const count = n / Math.pow(2, round);
    for (let pos = 1; pos <= count; pos++) {
      const nextPos = Math.ceil(pos / 2);
      await prisma.match.update({
        where: { id: matchIdMap[`${round}-${pos}`] },
        data: { nextMatchId: matchIdMap[`${round + 1}-${nextPos}`] },
      });
    }
  }

  const shuffled = [...players].sort(() => Math.random() - 0.5);
  for (let pos = 1; pos <= n / 2; pos++) {
    const p1 = shuffled[(pos - 1) * 2];
    const p2 = shuffled[(pos - 1) * 2 + 1];
    await prisma.match.update({
      where: { id: matchIdMap[`1-${pos}`] },
      data: { player1Id: p1.id, player2Id: p2.id },
    });

    // Notify both players (non-blocking)
    const p1Full = await prisma.user.findUnique({ where: { id: p1.id }, select: { email: true, name: true } });
    const p2Full = await prisma.user.findUnique({ where: { id: p2.id }, select: { email: true, name: true } });
    if (p1Full) sendMatchAssignedEmail(p1Full.email, p1Full.name, p2.name, tournament.name, 1).catch(() => undefined);
    if (p2Full) sendMatchAssignedEmail(p2Full.email, p2Full.name, p1.name, tournament.name, 1).catch(() => undefined);
  }

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

export async function scheduleMatch(
  tournamentId: string,
  matchId: string,
  scheduledDate: string,
  requesterId: string
) {
  const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
  if (!tournament) throw new Error('Torneo no encontrado');
  if (tournament.createdById !== requesterId) throw new Error('Sin permisos');

  const date = new Date(scheduledDate);
  if (isNaN(date.getTime())) throw new Error('Fecha invalida');
  if (tournament.startDate && date < tournament.startDate)
    throw new Error('La fecha es anterior al inicio del torneo');
  if (tournament.endDate && date > tournament.endDate)
    throw new Error('La fecha es posterior al fin del torneo');

  const updated = await prisma.match.update({
    where: { id: matchId },
    data: { scheduledDate: date },
    include: {
      player1: { select: { id: true, name: true, email: true } },
      player2: { select: { id: true, name: true, email: true } },
    },
  });

  // Notify both players (non-blocking)
  if (updated.player1) {
    const p2Name = updated.player2?.name ?? 'tu rival';
    sendMatchScheduledEmail(
      (updated.player1 as { email: string; name: string }).email,
      updated.player1.name,
      p2Name,
      tournament.name,
      date
    ).catch(() => undefined);
  }
  if (updated.player2) {
    const p1Name = updated.player1?.name ?? 'tu rival';
    sendMatchScheduledEmail(
      (updated.player2 as { email: string; name: string }).email,
      updated.player2.name,
      p1Name,
      tournament.name,
      date
    ).catch(() => undefined);
  }

  return updated;
}

export async function reportResult(
  matchId: string,
  winnerId: string,
  reporterId: string,
  score?: string
) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) throw new Error('Partido no encontrado');
  if (match.status !== 'PENDING')
    throw new Error('Solo se puede reportar el resultado de partidos PENDING');
  if (match.player1Id !== reporterId && match.player2Id !== reporterId)
    throw new Error('Solo los jugadores del partido pueden reportar el resultado');
  if (winnerId !== match.player1Id && winnerId !== match.player2Id)
    throw new Error('El ganador debe ser uno de los jugadores del partido');

  const updated = await prisma.match.update({
    where: { id: matchId },
    data: {
      winnerId,
      reportedById: reporterId,
      status: 'PENDING_CONFIRMATION',
      ...(score ? { score } : {}),
    },
  });

  // Notify opponent to confirm (non-blocking, run after DB write)
  setImmediate(() => notifyConfirmResult(matchId, reporterId, score).catch(() => undefined));

  return updated;
}

async function notifyConfirmResult(matchId: string, reporterId: string, score?: string | null) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      player1: { select: { id: true, name: true, email: true } },
      player2: { select: { id: true, name: true, email: true } },
      winner: { select: { id: true, name: true } },
      tournament: { select: { name: true } },
    },
  });
  if (!match || !match.player1 || !match.player2 || !match.winner) return;

  const opponent = match.player1.id === reporterId ? match.player2 : match.player1;
  const reporter = match.player1.id === reporterId ? match.player1 : match.player2;

  sendConfirmResultEmail(
    (opponent as { email: string; name: string }).email,
    opponent.name,
    reporter.name,
    match.tournament.name,
    match.winner.name,
    score ?? null
  ).catch(() => undefined);
}

async function advanceWinner(match: { id: string; tournamentId: string; nextMatchId: string | null; winnerId: string | null }) {
  if (match.nextMatchId && match.winnerId) {
    const nextMatch = await prisma.match.findUnique({ where: { id: match.nextMatchId } });
    if (nextMatch) {
      if (!nextMatch.player1Id) {
        await prisma.match.update({ where: { id: match.nextMatchId }, data: { player1Id: match.winnerId } });
      } else if (!nextMatch.player2Id) {
        await prisma.match.update({ where: { id: match.nextMatchId }, data: { player2Id: match.winnerId } });
      }
    }
  }
  if (!match.nextMatchId) {
    await prisma.tournament.update({ where: { id: match.tournamentId }, data: { status: 'FINISHED' } });
  }
}

export async function confirmResult(matchId: string, confirmerId: string) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) throw new Error('Partido no encontrado');
  if (match.status !== 'PENDING_CONFIRMATION' && match.status !== 'DISPUTED')
    throw new Error('El partido no esta en estado confirmable');
  if (match.reportedById === confirmerId)
    throw new Error('El jugador que reporto no puede confirmar el resultado');
  if (match.player1Id !== confirmerId && match.player2Id !== confirmerId)
    throw new Error('Solo los jugadores del partido pueden confirmar');

  const confirmed = await prisma.match.update({ where: { id: matchId }, data: { status: 'CONFIRMED' } });
  await advanceWinner(match);
  return confirmed;
}

/**
 * Dispute: the non-reporter submits their version.
 * - PENDING_CONFIRMATION -> DISPUTED (counter-report, now original reporter must respond)
 * - DISPUTED -> ORGANIZER_REVIEW (both disputed, organizer resolves)
 */
export async function disputeResult(
  matchId: string,
  userId: string,
  winnerId: string,
  score: string
) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) throw new Error('Partido no encontrado');

  if (match.status !== 'PENDING_CONFIRMATION' && match.status !== 'DISPUTED')
    throw new Error('No se puede disputar en este estado');
  if (match.player1Id !== userId && match.player2Id !== userId)
    throw new Error('Solo los jugadores del partido pueden disputar');
  if (match.reportedById === userId)
    throw new Error('No puedes disputar tu propio resultado; espera a que el otro jugador responda');

  // Second dispute -> escalate to organizer
  if (match.status === 'DISPUTED') {
    return prisma.match.update({
      where: { id: matchId },
      data: { status: 'ORGANIZER_REVIEW', winnerId: null, score: null },
    });
  }

  // First dispute: counter-report (winnerId and score required)
  if (!winnerId || !score)
    throw new Error('debes indicar un ganador y el marcador al disputar');
  if (winnerId !== match.player1Id && winnerId !== match.player2Id)
    throw new Error('El ganador debe ser uno de los jugadores del partido');

  return prisma.match.update({
    where: { id: matchId },
    data: { winnerId, score, reportedById: userId, status: 'DISPUTED' },
  });
}

export async function organizerResolve(
  matchId: string,
  winnerId: string,
  organizerId: string
) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { tournament: true },
  });
  if (!match) throw new Error('Partido no encontrado');
  if (match.status !== 'ORGANIZER_REVIEW')
    throw new Error('Solo se puede resolver en estado ORGANIZER_REVIEW');
  if (match.tournament.createdById !== organizerId) throw new Error('Sin permisos');
  if (winnerId !== match.player1Id && winnerId !== match.player2Id)
    throw new Error('Ganador invalido');

  const resolved = await prisma.match.update({
    where: { id: matchId },
    data: { winnerId, status: 'CONFIRMED' },
  });
  await advanceWinner({ ...match, winnerId });
  return resolved;
}