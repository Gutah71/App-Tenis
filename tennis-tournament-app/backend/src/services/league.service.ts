import prisma from '../lib/prisma';
import { ServiceError } from '../lib/errors';

interface CreateLeagueData {
  name: string;
  description?: string;
  location: string;
  isPublic?: boolean;
}

export async function createLeague(data: CreateLeagueData, createdById: string) {
  return prisma.league.create({
    data: {
      name: data.name,
      description: data.description,
      location: data.location,
      isPublic: data.isPublic ?? true,
      createdById,
    },
  });
}

export async function getAllLeagues() {
  return prisma.league.findMany({
    include: {
      createdBy: { select: { id: true, name: true } },
      _count: { select: { members: true, tournaments: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getLeagueById(id: string) {
  const league = await prisma.league.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, name: true } },
      members: {
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
        orderBy: { joinedAt: 'desc' },
      },
      tournaments: {
        select: {
          id: true,
          name: true,
          date: true,
          status: true,
          maxParticipants: true,
          isPublic: true,
        },
        orderBy: { date: 'desc' },
      },
    },
  });

  if (!league) {
    throw new ServiceError(404, 'Liga no encontrada');
  }

  return league;
}

export async function joinLeague(leagueId: string, userId: string) {
  const league = await prisma.league.findUnique({ where: { id: leagueId } });
  if (!league) {
    throw new ServiceError(404, 'Liga no encontrada');
  }

  const existing = await prisma.leagueMember.findUnique({
    where: { leagueId_userId: { leagueId, userId } },
  });
  if (existing) {
    throw new ServiceError(409, 'Ya eres miembro de esta liga');
  }

  return prisma.leagueMember.create({
    data: { leagueId, userId },
  });
}

export async function getLeaguesByOrganizer(userId: string) {
  return prisma.league.findMany({
    where: { createdById: userId },
    include: {
      createdBy: { select: { id: true, name: true } },
      _count: { select: { members: true, tournaments: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateLeague(
  id: string,
  data: { name?: string; description?: string; location?: string },
  userId: string,
) {
  const league = await prisma.league.findUnique({ where: { id } });
  if (!league) throw new ServiceError(404, 'Liga no encontrada');
  if (league.createdById !== userId) throw new ServiceError(403, 'No tienes permisos para editar esta liga');

  return prisma.league.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.location !== undefined && { location: data.location }),
    },
  });
}

export async function deleteLeague(id: string, userId: string) {
  const league = await prisma.league.findUnique({ where: { id } });
  if (!league) throw new ServiceError(404, 'Liga no encontrada');
  if (league.createdById !== userId) throw new ServiceError(403, 'No tienes permisos para eliminar esta liga');

  await prisma.league.delete({ where: { id } });
}

export async function leaveLeague(leagueId: string, userId: string) {
  const membership = await prisma.leagueMember.findUnique({
    where: { leagueId_userId: { leagueId, userId } },
  });
  if (!membership) throw new ServiceError(404, 'No eres miembro de esta liga');

  await prisma.leagueMember.delete({ where: { id: membership.id } });
}
