import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { ServiceError } from '../lib/errors';
import type { Modality } from '../types/enums';

// Fields returned in tournament responses (passwordHash always excluded)
const TOURNAMENT_PUBLIC_SELECT = {
  id: true,
  name: true,
  description: true,
  date: true,
  location: true,
  maxParticipants: true,
  modality: true,
  status: true,
  prize: true,
  rulesPdfUrl: true,
  isPublic: true,
  leagueId: true,
  createdById: true,
  createdAt: true,
  updatedAt: true,
} as const;

function isPowerOfTwo(n: number): boolean {
  return n >= 2 && (n & (n - 1)) === 0;
}

interface CreateTournamentData {
  name: string;
  description?: string;
  date: string;
  location: string;
  maxParticipants: number;
  modality?: Modality;
  prize?: string;
  isPublic?: boolean;
  password?: string;
  leagueId?: string;
}

export async function createTournament(data: CreateTournamentData, createdById: string) {
  if (!isPowerOfTwo(data.maxParticipants)) {
    throw new ServiceError(400, 'El máximo de participantes debe ser potencia de 2 (4, 8, 16, 32...)');
  }

  if (data.leagueId) {
    const league = await prisma.league.findUnique({ where: { id: data.leagueId } });
    if (!league) {
      throw new ServiceError(404, 'Liga no encontrada');
    }
    if (league.createdById !== createdById) {
      throw new ServiceError(403, 'No tienes permisos para crear torneos en esta liga');
    }
  }

  let hashedPassword: string | null = null;
  if (data.isPublic === false) {
    if (!data.password) {
      throw new ServiceError(400, 'Los torneos privados requieren una contraseña');
    }
    hashedPassword = await bcrypt.hash(data.password, 10);
  }

  // Tournaments are created directly as OPEN so players can register immediately
  return prisma.tournament.create({
    data: {
      name: data.name,
      description: data.description,
      date: new Date(data.date),
      location: data.location,
      maxParticipants: data.maxParticipants,
      modality: data.modality ?? 'SINGLES',
      prize: data.prize,
      isPublic: data.isPublic ?? true,
      passwordHash: hashedPassword,
      leagueId: data.leagueId,
      createdById,
    },
    select: TOURNAMENT_PUBLIC_SELECT,
  });
}

export async function getAllTournaments() {
  return prisma.tournament.findMany({
    select: {
      ...TOURNAMENT_PUBLIC_SELECT,
      createdBy: { select: { id: true, name: true } },
      league: { select: { id: true, name: true } },
      _count: { select: { registrations: true } },
    },
    orderBy: { date: 'desc' },
  });
}

export async function getTournamentById(id: string) {
  const tournament = await prisma.tournament.findUnique({
    where: { id },
    select: {
      ...TOURNAMENT_PUBLIC_SELECT,
      createdBy: { select: { id: true, name: true } },
      league: { select: { id: true, name: true } },
      registrations: {
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!tournament) {
    throw new ServiceError(404, 'Torneo no encontrado');
  }

  return tournament;
}

export async function joinTournament(tournamentId: string, userId: string, password?: string) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { _count: { select: { registrations: true } } },
  });

  if (!tournament) {
    throw new ServiceError(404, 'Torneo no encontrado');
  }

  if (tournament.status !== 'OPEN') {
    throw new ServiceError(400, 'El torneo no está abierto para inscripciones');
  }

  // Check real registration count even if status is still OPEN
  if (tournament._count.registrations >= tournament.maxParticipants) {
    throw new ServiceError(400, 'El torneo ya está completo');
  }

  if (!tournament.isPublic) {
    if (!password) {
      throw new ServiceError(400, 'Este torneo es privado. Debes proporcionar la contraseña');
    }
    const valid = await bcrypt.compare(password, tournament.passwordHash!);
    if (!valid) {
      throw new ServiceError(401, 'Contraseña del torneo incorrecta');
    }
  }

  const existing = await prisma.registration.findUnique({
    where: { tournamentId_userId: { tournamentId, userId } },
  });
  if (existing) {
    throw new ServiceError(409, 'Ya estás inscrito en este torneo');
  }

  const registration = await prisma.registration.create({
    data: { tournamentId, userId },
  });

  // Update status to FULL if tournament has reached max participants
  const newCount = tournament._count.registrations + 1;
  if (newCount >= tournament.maxParticipants) {
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: 'FULL' },
    });
  }

  return registration;
}

export async function getTournamentsByOrganizer(userId: string) {
  return prisma.tournament.findMany({
    where: { createdById: userId },
    select: {
      ...TOURNAMENT_PUBLIC_SELECT,
      createdBy: { select: { id: true, name: true } },
      league: { select: { id: true, name: true } },
      _count: { select: { registrations: true } },
    },
    orderBy: { date: 'desc' },
  });
}

export async function updateTournament(
  id: string,
  data: { name?: string; description?: string; location?: string; date?: string; prize?: string },
  userId: string,
) {
  const tournament = await prisma.tournament.findUnique({ where: { id } });
  if (!tournament) throw new ServiceError(404, 'Torneo no encontrado');
  if (tournament.createdById !== userId) throw new ServiceError(403, 'No tienes permisos para editar este torneo');

  if (tournament.status === 'IN_PROGRESS' || tournament.status === 'FINISHED') {
    throw new ServiceError(400, 'No se puede editar un torneo en curso o finalizado');
  }

  return prisma.tournament.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.location !== undefined && { location: data.location }),
      ...(data.date !== undefined && { date: new Date(data.date) }),
      ...(data.prize !== undefined && { prize: data.prize }),
    },
    select: TOURNAMENT_PUBLIC_SELECT,
  });
}

export async function deleteTournament(id: string, userId: string) {
  const tournament = await prisma.tournament.findUnique({ where: { id } });
  if (!tournament) throw new ServiceError(404, 'Torneo no encontrado');
  if (tournament.createdById !== userId) throw new ServiceError(403, 'No tienes permisos para eliminar este torneo');

  if (tournament.status === 'IN_PROGRESS') {
    throw new ServiceError(400, 'No se puede eliminar un torneo en curso');
  }

  await prisma.tournament.delete({ where: { id } });
}

export async function leaveTournament(tournamentId: string, userId: string) {
  const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
  if (!tournament) throw new ServiceError(404, 'Torneo no encontrado');

  if (tournament.status !== 'OPEN' && tournament.status !== 'FULL') {
    throw new ServiceError(400, 'No puedes abandonar un torneo en curso o finalizado');
  }

  const registration = await prisma.registration.findUnique({
    where: { tournamentId_userId: { tournamentId, userId } },
  });
  if (!registration) throw new ServiceError(404, 'No estás inscrito en este torneo');

  await prisma.registration.delete({ where: { id: registration.id } });

  // If tournament was FULL, change back to OPEN
  if (tournament.status === 'FULL') {
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: 'OPEN' },
    });
  }
}
