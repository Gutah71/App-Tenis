import prisma from '../lib/prisma';

export async function createLeague(name: string, userId: string) {
  return prisma.league.create({
    data: {
      name,
      createdById: userId,
      members: { create: { userId, role: 'ADMIN' } },
    },
    include: { members: true },
  });
}

export async function listLeagues() {
  return prisma.league.findMany({
    include: {
      createdBy: { select: { id: true, name: true } },
      _count: { select: { members: true, tournaments: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getLeague(id: string) {
  const league = await prisma.league.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, name: true } },
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
      tournaments: {
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
    },
  });
  if (!league) throw new Error('Liga no encontrada');
  return league;
}

export async function joinLeague(leagueId: string, userId: string) {
  const already = await prisma.leagueMember.findUnique({ where: { userId_leagueId: { userId, leagueId } } });
  if (already) throw new Error('Ya eres miembro de esta liga');
  return prisma.leagueMember.create({ data: { userId, leagueId, role: 'MEMBER' } });
}

export async function updateLeague(id: string, name: string, requesterId: string) {
  const league = await prisma.league.findUnique({ where: { id } });
  if (!league) throw new Error('Liga no encontrada');
  if (league.createdById !== requesterId) throw new Error('Sin permisos');
  return prisma.league.update({ where: { id }, data: { name } });
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
  return prisma.announcement.create({
    data: { leagueId, content, createdById: userId },
    include: { createdBy: { select: { id: true, name: true } } },
  });
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
      where: { leagueId },
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
    .sort((a, b) => b.tournamentsWon - a.tournamentsWon || b.matchesWon - a.matchesWon)
    .slice(0, 10);
}