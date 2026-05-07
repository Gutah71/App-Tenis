import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { TournamentStatus } from '../types/enums';
import { sendNewTournamentInLeagueEmail } from './emailService';

const PASSWORD_SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 4;

function validatePassword(password: string): void {
  const trimmed = password.trim();
  if (trimmed.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`);
  }
}

export async function createTournament(data: {
  name: string;
  maxPlayers: number;
  location?: string;
  startDate?: string;
  endDate?: string;
  leagueId?: string;
  status?: TournamentStatus;
  isPrivate?: boolean;
  password?: string;
  createdById: string;
}) {
  if (data.isPrivate) {
    if (!data.password) throw new Error('Los torneos privados requieren una contraseña');
    validatePassword(data.password);
  }
  if (data.maxPlayers < 2) throw new Error('maxPlayers debe ser al menos 2');
  if ((data.maxPlayers & (data.maxPlayers - 1)) !== 0)
    throw new Error('maxPlayers debe ser potencia de 2 (2, 4, 8, 16...)');

  const start = data.startDate ? new Date(data.startDate) : undefined;
  const end = data.endDate ? new Date(data.endDate) : undefined;
  if (start && end && end <= start) throw new Error('La fecha de fin debe ser posterior al inicio');

  const passwordHash = data.isPrivate && data.password
    ? await bcrypt.hash(data.password, PASSWORD_SALT_ROUNDS)
    : null;

  const tournament = await prisma.tournament.create({
    data: {
      name: data.name,
      maxPlayers: data.maxPlayers,
      location: data.location ?? null,
      startDate: start ?? null,
      endDate: end ?? null,
      leagueId: data.leagueId ?? null,
      isPrivate: data.isPrivate ?? false,
      password: passwordHash,
      status: data.status ?? 'OPEN',
      createdById: data.createdById,
    },
  });

  // Notify league members if the tournament belongs to a league (non-blocking)
  if (data.leagueId) {
    const members = await prisma.leagueMember.findMany({
      where: { leagueId: data.leagueId },
      include: { user: { select: { email: true, name: true } } },
    });
    const league = await prisma.league.findUnique({ where: { id: data.leagueId }, select: { name: true } });
    if (league) {
      for (const m of members) {
        sendNewTournamentInLeagueEmail(
          m.user.email,
          m.user.name,
          league.name,
          tournament.name,
          tournament.id,
          tournament.maxPlayers,
          tournament.location,
          tournament.startDate
        ).catch(() => undefined);
      }
    }
  }

  const { password: _, ...rest } = tournament;
  return rest;
}

export async function listTournaments(leagueId?: string, requesterId?: string) {
  const tournaments = await prisma.tournament.findMany({
    where: { deletedAt: null, ...(leagueId ? { leagueId } : {}) },
    include: {
      createdBy: { select: { id: true, name: true } },
      league: { select: { id: true, name: true } },
      _count: { select: { registrations: true } },
      ...(requesterId
        ? { registrations: { where: { userId: requesterId }, select: { userId: true } } }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
  });
  return tournaments.map(({ password: _, registrations, ...rest }) => ({
    ...rest,
    viewerIsRegistered: !!requesterId && Array.isArray(registrations) && registrations.length > 0,
  }));
}

export async function getTournament(id: string, requesterId?: string) {
  const t = await prisma.tournament.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, name: true } },
      league: { select: { id: true, name: true } },
      registrations: { include: { user: { select: { id: true, name: true } } } },
      matches: {
        orderBy: [{ round: 'asc' }, { position: 'asc' }],
        include: {
          player1: { select: { id: true, name: true } },
          player2: { select: { id: true, name: true } },
          winner: { select: { id: true, name: true } },
        },
      },
      _count: { select: { registrations: true } },
    },
  });
  if (!t || t.deletedAt) throw new Error('Torneo no encontrado');

  const isRegistered = !!requesterId && t.registrations.some((r) => r.userId === requesterId);
  const isOrganizer = !!requesterId && t.createdById === requesterId;

  // For private tournaments, hide details from non-registered, non-organizer users.
  if (t.isPrivate && !isRegistered && !isOrganizer) {
    return {
      id: t.id,
      name: t.name,
      isPrivate: t.isPrivate,
      status: t.status,
      maxPlayers: t.maxPlayers,
      location: t.location,
      startDate: t.startDate,
      endDate: t.endDate,
      leagueId: t.leagueId,
      createdById: t.createdById,
      createdBy: t.createdBy,
      league: t.league,
      createdAt: t.createdAt,
      _count: t._count,
      registrations: [],
      matches: [],
      restricted: true as const,
    };
  }

  const { password: _, ...tournamentWithoutPassword } = t;
  return { ...tournamentWithoutPassword, restricted: false as const };
}

export async function registerPlayer(tournamentId: string, userId: string, password?: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user) throw new Error('Usuario no encontrado');
  if (user.role === 'ORGANIZER') {
    throw new Error('Los organizadores no pueden inscribirse en torneos. Crea una cuenta de jugador para participar.');
  }
  const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
  if (!tournament) throw new Error('Torneo no encontrado');
  if (tournament.status !== 'OPEN') throw new Error('El torneo no esta abierto para inscripciones');

  const existing = await prisma.registration.findUnique({
    where: { userId_tournamentId: { userId, tournamentId } },
  });
  if (existing) throw new Error('Ya estas inscrito en este torneo');

  if (tournament.isPrivate) {
    if (!password) throw new Error('Este torneo es privado. Se requiere contraseña');
    if (!tournament.password) throw new Error('El torneo está mal configurado (sin contraseña). Contacta al organizador');
    const valid = await bcrypt.compare(password, tournament.password);
    if (!valid) throw new Error('Contraseña incorrecta');
  }

  const count = await prisma.registration.count({ where: { tournamentId } });
  if (count >= tournament.maxPlayers) throw new Error('El torneo ya esta lleno');

  const reg = await prisma.registration.create({ data: { userId, tournamentId } });
  if (count + 1 >= tournament.maxPlayers) {
    await prisma.tournament.update({ where: { id: tournamentId }, data: { status: 'FULL' } });
  }
  return reg;
}

export async function cancelRegistration(tournamentId: string, userId: string) {
  const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
  if (!tournament) throw new Error('Torneo no encontrado');
  if (tournament.status === 'IN_PROGRESS' || tournament.status === 'FINISHED')
    throw new Error('No puedes cancelar la inscripcion cuando el torneo ya ha comenzado');

  const reg = await prisma.registration.findUnique({
    where: { userId_tournamentId: { userId, tournamentId } },
  });
  if (!reg) throw new Error('No estas inscrito en este torneo');

  await prisma.registration.delete({ where: { userId_tournamentId: { userId, tournamentId } } });
  if (tournament.status === 'FULL') {
    await prisma.tournament.update({ where: { id: tournamentId }, data: { status: 'OPEN' } });
  }
}

export async function kickPlayer(tournamentId: string, targetUserId: string, requesterId: string) {
  const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
  if (!tournament) throw new Error('Torneo no encontrado');
  if (tournament.createdById !== requesterId) throw new Error('Solo el organizador puede expulsar jugadores');
  if (tournament.status !== 'OPEN' && tournament.status !== 'FULL')
    throw new Error('Solo se pueden expulsar jugadores antes de generar el cuadro (estados OPEN o FULL)');
  if (targetUserId === tournament.createdById) throw new Error('El organizador no puede expulsarse a si mismo');

  const reg = await prisma.registration.findUnique({
    where: { userId_tournamentId: { userId: targetUserId, tournamentId } },
  });
  if (!reg) throw new Error('Ese jugador no esta inscrito en el torneo');

  await prisma.registration.delete({ where: { userId_tournamentId: { userId: targetUserId, tournamentId } } });
  if (tournament.status === 'FULL') {
    await prisma.tournament.update({ where: { id: tournamentId }, data: { status: 'OPEN' } });
  }
}

export async function updateTournament(
  id: string,
  data: { name?: string; location?: string; startDate?: string | null; endDate?: string | null; maxPlayers?: number },
  requesterId: string,
) {
  const tournament = await prisma.tournament.findUnique({ where: { id } });
  if (!tournament || tournament.deletedAt) throw new Error('Torneo no encontrado');
  if (tournament.createdById !== requesterId) throw new Error('Sin permisos');

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) {
    const trimmed = data.name.trim();
    if (!trimmed) throw new Error('El nombre no puede estar vacío');
    updateData.name = trimmed;
  }
  if (data.location !== undefined) updateData.location = data.location?.trim() || null;
  if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null;
  if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
  if (data.maxPlayers !== undefined) {
    const n = Number(data.maxPlayers);
    if (n < 2) throw new Error('maxPlayers debe ser al menos 2');
    if ((n & (n - 1)) !== 0) throw new Error('maxPlayers debe ser potencia de 2');
    if (tournament.status !== 'OPEN') throw new Error('Solo se puede cambiar el número de plazas con el torneo en estado OPEN');
    updateData.maxPlayers = n;
  }

  const updated = await prisma.tournament.update({ where: { id }, data: updateData });
  const { password: _, ...rest } = updated;
  return rest;
}

export async function updateTournamentStatus(id: string, status: TournamentStatus, requesterId: string) {
  const tournament = await prisma.tournament.findUnique({ where: { id } });
  if (!tournament || tournament.deletedAt) throw new Error('Torneo no encontrado');
  if (tournament.createdById !== requesterId) throw new Error('Sin permisos');
  const updated = await prisma.tournament.update({ where: { id }, data: { status } });
  const { password: _, ...rest } = updated;
  return rest;
}

export async function updateTournamentPrivacy(
  id: string,
  data: { isPrivate?: boolean; password?: string },
  requesterId: string,
) {
  const tournament = await prisma.tournament.findUnique({ where: { id } });
  if (!tournament || tournament.deletedAt) throw new Error('Torneo no encontrado');
  if (tournament.createdById !== requesterId) throw new Error('Sin permisos');

  const updateData: { isPrivate?: boolean; password?: string | null } = {};

  if (typeof data.isPrivate === 'boolean') {
    if (data.isPrivate) {
      if (data.password) {
        validatePassword(data.password);
        updateData.password = await bcrypt.hash(data.password, PASSWORD_SALT_ROUNDS);
      } else if (!tournament.password) {
        throw new Error('Para hacer el torneo privado se requiere una contraseña');
      }
      updateData.isPrivate = true;
    } else {
      updateData.isPrivate = false;
      updateData.password = null;
    }
  } else if (data.password) {
    if (!tournament.isPrivate) throw new Error('No se puede establecer contraseña en un torneo público');
    validatePassword(data.password);
    updateData.password = await bcrypt.hash(data.password, PASSWORD_SALT_ROUNDS);
  } else {
    throw new Error('No hay cambios que aplicar');
  }

  const updated = await prisma.tournament.update({ where: { id }, data: updateData });
  const { password: _, ...rest } = updated;
  return rest;
}

export async function deleteTournament(id: string, requesterId: string) {
  const tournament = await prisma.tournament.findUnique({ where: { id } });
  if (!tournament || tournament.deletedAt) throw new Error('Torneo no encontrado');
  if (tournament.createdById !== requesterId) throw new Error('Sin permisos');
  if (tournament.status !== 'FINISHED' && tournament.status !== 'CANCELLED')
    throw new Error('Solo se pueden eliminar torneos FINISHED o CANCELLED');
  // Soft delete: preservamos Match y Registration para que las stats de los jugadores se mantengan.
  await prisma.tournament.update({ where: { id }, data: { deletedAt: new Date() } });
}