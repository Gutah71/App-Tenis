import prisma from '../lib/prisma';
import { TournamentStatus } from '../types/enums';

export async function createTournament(data: {
  name: string;
  maxPlayers: number;
  leagueId?: string;
  status?: TournamentStatus;
  createdById: string;
}) {
  if (data.maxPlayers < 2) throw new Error('maxPlayers debe ser al menos 2');
  // Must be a power of 2
  if ((data.maxPlayers & (data.maxPlayers - 1)) !== 0)
    throw new Error('maxPlayers debe ser potencia de 2 (2, 4, 8, 16...)');

  return prisma.tournament.create({
    data: {
      name: data.name,
      maxPlayers: data.maxPlayers,
      leagueId: data.leagueId ?? null,
      status: data.status ?? 'OPEN',
      createdById: data.createdById,
    },
  });
}

export async function listTournaments(leagueId?: string) {
  return prisma.tournament.findMany({
    where: leagueId ? { leagueId } : undefined,
    include: {
      createdBy: { select: { id: true, name: true } },
      league: { select: { id: true, name: true } },
      _count: { select: { registrations: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getTournament(id: string) {
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
    },
  });
  if (!t) throw new Error('Torneo no encontrado');
  return t;
}

export async function registerPlayer(tournamentId: string, userId: string) {
  const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
  if (!tournament) throw new Error('Torneo no encontrado');
  if (tournament.status !== 'OPEN') throw new Error('El torneo no está abierto para inscripciones');

  const existing = await prisma.registration.findUnique({
    where: { userId_tournamentId: { userId, tournamentId } },
  });
  if (existing) throw new Error('Ya estás inscrito en este torneo');

  const count = await prisma.registration.count({ where: { tournamentId } });
  if (count >= tournament.maxPlayers) throw new Error('El torneo ya está lleno');

  const reg = await prisma.registration.create({ data: { userId, tournamentId } });

  // If now full, update status
  if (count + 1 >= tournament.maxPlayers) {
    await prisma.tournament.update({ where: { id: tournamentId }, data: { status: 'FULL' } });
  }

  return reg;
}

export async function cancelRegistration(tournamentId: string, userId: string) {
  const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
  if (!tournament) throw new Error('Torneo no encontrado');
  if (tournament.status === 'IN_PROGRESS' || tournament.status === 'FINISHED')
    throw new Error('No puedes cancelar la inscripción cuando el torneo ya ha comenzado');

  const reg = await prisma.registration.findUnique({
    where: { userId_tournamentId: { userId, tournamentId } },
  });
  if (!reg) throw new Error('No estás inscrito en este torneo');

  await prisma.registration.delete({ where: { userId_tournamentId: { userId, tournamentId } } });

  // If was FULL, revert to OPEN
  if (tournament.status === 'FULL') {
    await prisma.tournament.update({ where: { id: tournamentId }, data: { status: 'OPEN' } });
  }
}

export async function updateTournamentStatus(id: string, status: TournamentStatus, requesterId: string) {
  const tournament = await prisma.tournament.findUnique({ where: { id } });
  if (!tournament) throw new Error('Torneo no encontrado');
  if (tournament.createdById !== requesterId) throw new Error('Sin permisos');

  return prisma.tournament.update({ where: { id }, data: { status } });
}
