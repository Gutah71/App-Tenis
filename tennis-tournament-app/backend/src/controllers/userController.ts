import { Request, Response } from 'express';
import * as userService from '../services/userService';
import { AuthRequest } from '../middlewares/auth';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ error: 'name, email y password son requeridos' });
      return;
    }
    const result = await userService.register(name, email, password, role ?? 'PLAYER');
    res.status(201).json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    res.status(400).json({ error: message });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'email y password son requeridos' });
      return;
    }
    const result = await userService.login(email, password);
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    res.status(401).json({ error: message });
  }
}

export async function getProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = await userService.getProfile(req.userId!);
    res.json(user);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    res.status(404).json({ error: message });
  }
}

export async function updateName(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string') {
      res.status(400).json({ error: 'name es requerido' });
      return;
    }
    const user = await userService.updateName(req.userId!, name);
    res.json(user);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    res.status(400).json({ error: message });
  }
}

export async function getMyTournaments(req: AuthRequest, res: Response): Promise<void> {
  const tournaments = await userService.getMyTournaments(req.userId!);
  res.json(tournaments);
}

export async function getStats(req: AuthRequest, res: Response): Promise<void> {
  const stats = await userService.getUserStats(req.userId!);
  res.json(stats);
}
