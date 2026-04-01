import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { sendWelcomeEmail } from './emailService';

const JWT_SECRET = process.env.JWT_SECRET ?? 'changeme-in-production';
const SALT_ROUNDS = 10;

export async function register(name: string, email: string, password: string, role: string) {
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new Error('El email ya está registrado');

  if (role !== 'PLAYER' && role !== 'ORGANIZER') throw new Error('Rol inválido');

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role },
  });

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

  // Send welcome email (non-blocking)
  sendWelcomeEmail(user.email, user.name).catch(() => undefined);

  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Credenciales incorrectas');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error('Credenciales incorrectas');

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  if (!user) throw new Error('Usuario no encontrado');
  return user;
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

export async function getUserStats(userId: string) {
  const [registrations, matches, tournamentsWon] = await Promise.all([
    prisma.registration.count({ where: { userId } }),
    prisma.match.findMany({
      where: {
        status: 'CONFIRMED',
        OR: [{ player1Id: userId }, { player2Id: userId }],
      },
      select: { player1Id: true, winnerId: true, score: true, nextMatchId: true },
    }),
    prisma.match.count({
      where: {
        status: 'CONFIRMED',
        winnerId: userId,
        nextMatchId: null,
        tournament: { status: 'FINISHED' },
      },
    }),
  ]);

  let setsWon = 0, setsLost = 0;
  const matchesWon = matches.filter((m) => m.winnerId === userId).length;
  for (const m of matches) {
    const s = parseSets(m.score, m.player1Id === userId);
    setsWon += s.won;
    setsLost += s.lost;
  }

  return {
    tournamentsPlayed: registrations,
    tournamentsWon,
    matchesPlayed: matches.length,
    matchesWon,
    matchesLost: matches.length - matchesWon,
    setsWon,
    setsLost,
  };
}