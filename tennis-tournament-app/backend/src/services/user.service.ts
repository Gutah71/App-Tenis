import prisma from '../lib/prisma';
import { ServiceError } from '../lib/errors';

export async function updateProfile(userId: string, data: { name?: string }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new ServiceError(404, 'Usuario no encontrado');
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      createdAt: true,
    },
  });
}

export async function deleteAccount(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new ServiceError(404, 'Usuario no encontrado');
  }

  await prisma.user.delete({ where: { id: userId } });
}

export async function getMyLeagues(userId: string) {
  return prisma.leagueMember.findMany({
    where: { userId },
    include: {
      league: {
        include: {
          createdBy: { select: { id: true, name: true } },
          _count: { select: { members: true, tournaments: true } },
        },
      },
    },
    orderBy: { joinedAt: 'desc' },
  });
}

export async function getMyTournaments(userId: string) {
  return prisma.registration.findMany({
    where: { userId },
    include: {
      tournament: {
        select: {
          id: true,
          name: true,
          date: true,
          location: true,
          status: true,
          maxParticipants: true,
          modality: true,
          isPublic: true,
          leagueId: true,
          createdBy: { select: { id: true, name: true } },
          league: { select: { id: true, name: true } },
          _count: { select: { registrations: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getPlayerStats(userId: string) {
  const [matchesAsP1, matchesAsP2, matchesWon] = await Promise.all([
    prisma.match.count({ where: { player1Id: userId, status: 'CONFIRMED' } }),
    prisma.match.count({ where: { player2Id: userId, status: 'CONFIRMED' } }),
    prisma.match.count({ where: { winnerId: userId, status: 'CONFIRMED' } }),
  ]);

  const totalPlayed = matchesAsP1 + matchesAsP2;
  const totalLost = totalPlayed - matchesWon;

  const tournamentsPlayed = await prisma.registration.count({ where: { userId } });
  const tournamentsWon = await prisma.match.count({
    where: {
      winnerId: userId,
      nextMatchId: null,
      status: 'CONFIRMED',
    },
  });

  const recentMatches = await prisma.match.findMany({
    where: {
      status: 'CONFIRMED',
      OR: [{ player1Id: userId }, { player2Id: userId }],
    },
    include: {
      player1: { select: { id: true, name: true } },
      player2: { select: { id: true, name: true } },
      winner: { select: { id: true, name: true } },
      tournament: { select: { id: true, name: true } },
    },
    orderBy: { updatedAt: 'desc' },
    take: 10,
  });

  return {
    totalPlayed,
    matchesWon,
    matchesLost: totalLost,
    winRate: totalPlayed > 0 ? Math.round((matchesWon / totalPlayed) * 100) : 0,
    tournamentsPlayed,
    tournamentsWon,
    recentMatches,
  };
}
