import { Request, Response } from 'express';
import { ServiceError } from '../lib/errors';
import * as userService from '../services/user.service';

interface UpdateProfileBody {
  name?: string;
}

export async function updateProfile(req: Request<unknown, unknown, UpdateProfileBody>, res: Response) {
  try {
    const { name } = req.body;

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 2) {
        return res.status(400).json({ error: 'El nombre debe tener al menos 2 caracteres' });
      }
    }

    const user = await userService.updateProfile(req.user!.userId, {
      name: name?.trim(),
    });

    return res.json({ user });
  } catch (err) {
    if (err instanceof ServiceError) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error('Update profile error:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function deleteAccount(req: Request, res: Response) {
  try {
    await userService.deleteAccount(req.user!.userId);
    return res.json({ message: 'Cuenta eliminada correctamente' });
  } catch (err) {
    if (err instanceof ServiceError) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error('Delete account error:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function getMyLeagues(req: Request, res: Response) {
  try {
    const memberships = await userService.getMyLeagues(req.user!.userId);
    const leagues = memberships.map((m) => ({
      ...m.league,
      joinedAt: m.joinedAt,
    }));
    return res.json({ leagues });
  } catch (err) {
    console.error('Get my leagues error:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function getMyTournaments(req: Request, res: Response) {
  try {
    const registrations = await userService.getMyTournaments(req.user!.userId);
    const tournaments = registrations.map((r) => ({
      ...r.tournament,
      registeredAt: r.createdAt,
    }));
    return res.json({ tournaments });
  } catch (err) {
    console.error('Get my tournaments error:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function getStats(req: Request, res: Response) {
  try {
    const stats = await userService.getPlayerStats(req.user!.userId);
    return res.json({ stats });
  } catch (err) {
    console.error('Get stats error:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
