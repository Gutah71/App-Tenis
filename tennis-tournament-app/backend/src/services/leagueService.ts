import prisma from '../lib/prisma';

export async function createLeague(name: string, userId: string) {
  const league = await prisma.league.create({
    data: {
      name,
      createdById: userId,
      members: {
        create: { userId, role: 'ADMIN' },
      },
    },
    include: { members: true },
  });
  return league;
}

export async function listLeagues() {
  return prisma.league.findMany({
    include: { createdBy: { select: { id: true, name: true } }, _count: { select: { members: true, tournaments: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getLeague(id: string) {
  const league = await prisma.league.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, name: true } },
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
      tournaments: { select: { id: true, name: true, status: true, maxPlayers: true } },
    },
  });
  if (!league) throw new Error('Liga no encontrada');
  return league;
}

export async function joinLeague(leagueId: string, userId: string) {
  const exists = await prisma.leagueMember.findUnique({ where: { userId_leagueId: { userId, leagueId } } });
  if (exists) throw new Error('Ya eres miembro de esta liga');
  return prisma.leagueMember.create({ data: { userId, leagueId, role: 'MEMBER' } });
}
