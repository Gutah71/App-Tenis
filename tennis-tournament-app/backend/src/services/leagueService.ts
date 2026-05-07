import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { sendLeagueAnnouncementEmail } from './emailService';

const PASSWORD_SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 4;

function validatePassword(password: string): void {
  const trimmed = password.trim();
  if (trimmed.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`);
  }
}

export async function createLeague(name: string, userId: string, isPrivate = false, password?: string) {
  if (isPrivate) {
    if (!password) throw new Error('Las ligas privadas requieren una contraseña');
    validatePassword(password);
  }
  const passwordHash = isPrivate && password ? await bcrypt.hash(password, PASSWORD_SALT_ROUNDS) : null;
  const league = await prisma.league.create({
    data: {
      name,
      isPrivate,
      password: passwordHash,
      createdById: userId,
      members: { create: { userId, role: 'ADMIN' } },
    },
    include: { members: true },
  });
  const { password: _, ...rest } = league;
  return rest;
}

export async function listLeagues(requesterId?: string) {
  const leagues = await prisma.league.findMany({
    include: {
      createdBy: { select: { id: true, name: true } },
      _count: { select: { members: true, tournaments: { where: { deletedAt: null } } } },
      ...(requesterId
        ? { members: { where: { userId: requesterId }, select: { userId: true, role: true } } }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
  });
  return leagues.map(({ password: _, members, ...rest }) => ({
    ...rest,
    viewerIsMember: !!requesterId && Array.isArray(members) && members.length > 0,
  }));
}

export async function getLeague(id: string, requesterId?: string) {
  const league = await prisma.league.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, name: true } },
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
      tournaments: {
        where: { deletedAt: null },
        select: {
          id: true, name: true, status: true, maxPlayers: true,
          location: true, startDate: true, endDate: true,
          _count: { select: { registrations: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
      announcements: {
        include: { createdBy: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      },
      _count: { select: { members: true, tournaments: { where: { deletedAt: null } } } },
    },
  });
  if (!league) throw new Error('Liga no encontrada');

  const isMember = !!requesterId && league.members.some((m) => m.userId === requesterId);

  // For private leagues, non-members only see basic info (so they can request access).
  if (league.isPrivate && !isMember) {
    return {
      id: league.id,
      name: league.name,
      isPrivate: league.isPrivate,
      createdById: league.createdById,
      createdBy: league.createdBy,
      createdAt: league.createdAt,
      _count: league._count,
      members: [],
      tournaments: [],
      announcements: [],
      restricted: true as const,
    };
  }

  const { password: _, ...leagueWithoutPassword } = league;
  return { ...leagueWithoutPassword, restricted: false as const };
}

export async function joinLeague(leagueId: string, userId: string, password?: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user) throw new Error('Usuario no encontrado');
  if (user.role === 'ORGANIZER') {
    throw new Error('Los organizadores no pueden unirse a ligas. Crea una cuenta de jugador para participar.');
  }
  const league = await prisma.league.findUnique({ where: { id: leagueId } });
  if (!league) throw new Error('Liga no encontrada');
  if (league.isPrivate) {
    if (!password) throw new Error('Esta liga es privada. Se requiere contraseña');
    if (!league.password) throw new Error('La liga está mal configurada (sin contraseña). Contacta al organizador');
    const valid = await bcrypt.compare(password, league.password);
    if (!valid) throw new Error('Contraseña incorrecta');
  }
  const already = await prisma.leagueMember.findUnique({ where: { userId_leagueId: { userId, leagueId } } });
  if (already) throw new Error('Ya eres miembro de esta liga');
  return prisma.leagueMember.create({ data: { userId, leagueId, role: 'MEMBER' } });
}

export async function leaveLeague(leagueId: string, userId: string) {
  const league = await prisma.league.findUnique({ where: { id: leagueId } });
  if (!league) throw new Error('Liga no encontrada');
  if (league.createdById === userId) {
    throw new Error('El creador no puede abandonar la liga. Elimínala si ya no la necesitas.');
  }
  const member = await prisma.leagueMember.findUnique({ where: { userId_leagueId: { userId, leagueId } } });
  if (!member) throw new Error('No eres miembro de esta liga');
  await prisma.leagueMember.delete({ where: { userId_leagueId: { userId, leagueId } } });
}

export async function kickMember(leagueId: string, targetUserId: string, requesterId: string) {
  const league = await prisma.league.findUnique({ where: { id: leagueId } });
  if (!league) throw new Error('Liga no encontrada');
  if (league.createdById !== requesterId) throw new Error('Solo el creador puede expulsar miembros');
  if (targetUserId === league.createdById) throw new Error('El creador no puede ser expulsado');
  const member = await prisma.leagueMember.findUnique({ where: { userId_leagueId: { userId: targetUserId, leagueId } } });
  if (!member) throw new Error('El usuario no es miembro de esta liga');
  await prisma.leagueMember.delete({ where: { userId_leagueId: { userId: targetUserId, leagueId } } });
}

export async function updateLeague(
  id: string,
  data: { name?: string; isPrivate?: boolean; password?: string },
  requesterId: string,
) {
  const league = await prisma.league.findUnique({ where: { id } });
  if (!league) throw new Error('Liga no encontrada');
  if (league.createdById !== requesterId) throw new Error('Sin permisos');

  const updateData: { name?: string; isPrivate?: boolean; password?: string | null } = {};
  if (typeof data.name === 'string') {
    const trimmed = data.name.trim();
    if (!trimmed) throw new Error('El nombre no puede estar vacío');
    updateData.name = trimmed;
  }

  if (typeof data.isPrivate === 'boolean') {
    if (data.isPrivate) {
      // Becoming/staying private: need a password (new one provided OR existing one already set).
      if (data.password) {
        validatePassword(data.password);
        updateData.password = await bcrypt.hash(data.password, PASSWORD_SALT_ROUNDS);
      } else if (!league.password) {
        throw new Error('Para hacer la liga privada se requiere una contraseña');
      }
      updateData.isPrivate = true;
    } else {
      // Becoming public: clear password.
      updateData.isPrivate = false;
      updateData.password = null;
    }
  } else if (data.password) {
    // Just rotating the password (must already be private).
    if (!league.isPrivate) throw new Error('No se puede establecer contraseña en una liga pública');
    validatePassword(data.password);
    updateData.password = await bcrypt.hash(data.password, PASSWORD_SALT_ROUNDS);
  }

  const updated = await prisma.league.update({ where: { id }, data: updateData });
  const { password: _, ...rest } = updated;
  return rest;
}

export async function deleteLeague(id: string, requesterId: string) {
  const league = await prisma.league.findUnique({ where: { id } });
  if (!league) throw new Error('Liga no encontrada');
  if (league.createdById !== requesterId) throw new Error('Sin permisos');
  await prisma.league.delete({ where: { id } });
}

export async function addAnnouncement(leagueId: string, content: string, userId: string) {
  const league = await prisma.league.findUnique({ where: { id: leagueId } });
  if (!league) throw new Error('Liga no encontrada');
  if (league.createdById !== userId) throw new Error('Solo el creador puede publicar anuncios');

  const announcement = await prisma.announcement.create({
    data: { leagueId, content, createdById: userId },
    include: { createdBy: { select: { id: true, name: true } } },
  });

  // Notify all league members (non-blocking)
  const members = await prisma.leagueMember.findMany({
    where: { leagueId },
    include: { user: { select: { email: true, name: true } } },
  });
  for (const m of members) {
    sendLeagueAnnouncementEmail(
      m.user.email,
      m.user.name,
      league.name,
      content,
      announcement.createdBy.name
    ).catch(() => undefined);
  }

  return announcement;
}

export async function deleteAnnouncement(announcementId: string, userId: string) {
  const ann = await prisma.announcement.findUnique({ where: { id: announcementId } });
  if (!ann) throw new Error('Anuncio no encontrado');
  const league = await prisma.league.findUnique({ where: { id: ann.leagueId } });
  if (!league || league.createdById !== userId) throw new Error('Sin permisos');
  await prisma.announcement.delete({ where: { id: announcementId } });
}

function parseSets(score: string | null, isPlayer1: boolean): { won: number; lost: number } {
  if (!score) return { won: 0, lost: 0 };
  let won = 0, lost = 0;
  for (const set of score.split(' ')) {
    const parts = set.split('-').map(Number);
    if (parts.length !== 2) continue;
    const [p1, p2] = parts;
    if (isPlayer1) { if (p1 > p2) won++; else lost++; }
    else { if (p2 > p1) won++; else lost++; }
  }
  return { won, lost };
}

export async function getLeagueStats(leagueId: string) {
  const [members, leagueTournaments] = await Promise.all([
    prisma.leagueMember.findMany({
      where: { leagueId },
      include: { user: { select: { id: true, name: true } } },
    }),
    prisma.tournament.findMany({
      where: { leagueId, deletedAt: null },
      select: { id: true, status: true },
    }),
  ]);

  const tournamentIds = leagueTournaments.map((t) => t.id);
  const finishedIds = leagueTournaments.filter((t) => t.status === 'FINISHED').map((t) => t.id);

  const stats = await Promise.all(
    members.map(async ({ userId, user }) => {
      const [registrations, matches, tournamentsWon] = await Promise.all([
        prisma.registration.count({ where: { userId, tournamentId: { in: tournamentIds } } }),
        prisma.match.findMany({
          where: {
            tournamentId: { in: tournamentIds },
            status: 'CONFIRMED',
            OR: [{ player1Id: userId }, { player2Id: userId }],
          },
          select: { player1Id: true, winnerId: true, score: true, nextMatchId: true },
        }),
        prisma.match.count({
          where: {
            tournamentId: { in: finishedIds },
            status: 'CONFIRMED',
            winnerId: userId,
            nextMatchId: null,
          },
        }),
      ]);

      let setsWon = 0, setsLost = 0;
      const matchesWon = matches.filter((m) => m.winnerId === userId).length;
      for (const m of matches) {
        const isP1 = m.player1Id === userId;
        const s = parseSets(m.score, isP1);
        setsWon += s.won;
        setsLost += s.lost;
      }

      return {
        userId,
        name: user.name,
        tournamentsPlayed: registrations,
        tournamentsWon,
        matchesPlayed: matches.length,
        matchesWon,
        matchesLost: matches.length - matchesWon,
        setsWon,
        setsLost,
      };
    })
  );

  return stats
    .sort((a, b) =>
      b.tournamentsWon - a.tournamentsWon ||
      b.matchesWon - a.matchesWon ||
      b.setsWon - a.setsWon ||
      b.matchesPlayed - a.matchesPlayed
    )
    .slice(0, 10);
}