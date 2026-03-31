import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

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
