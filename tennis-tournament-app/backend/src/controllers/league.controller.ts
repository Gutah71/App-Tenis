import { Request, Response } from 'express';
import { ServiceError } from '../lib/errors';
import * as leagueService from '../services/league.service';

interface CreateLeagueBody {
  name: string;
  description?: string;
  location: string;
  isPublic?: boolean;
}

export async function create(req: Request<unknown, unknown, CreateLeagueBody>, res: Response) {
  try {
    const { name, location, description, isPublic } = req.body;

    if (!name || !location) {
      return res.status(400).json({ error: 'Nombre y ubicación son obligatorios' });
    }

    if (typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'El nombre debe tener al menos 2 caracteres' });
    }

    if (typeof location !== 'string' || location.trim().length < 2) {
      return res.status(400).json({ error: 'La ubicación debe tener al menos 2 caracteres' });
    }

    const league = await leagueService.createLeague(
      { name: name.trim(), description, location: location.trim(), isPublic },
      req.user!.userId,
    );

    return res.status(201).json({ league });
  } catch (err) {
    if (err instanceof ServiceError) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error('Create league error:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function getAll(_req: Request, res: Response) {
  try {
    const leagues = await leagueService.getAllLeagues();
    return res.json({ leagues });
  } catch (err) {
    console.error('Get leagues error:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function getById(req: Request<{ id: string }>, res: Response) {
  try {
    const league = await leagueService.getLeagueById(req.params.id);
    return res.json({ league });
  } catch (err) {
    if (err instanceof ServiceError) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error('Get league error:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function join(req: Request<{ id: string }>, res: Response) {
  try {
    const membership = await leagueService.joinLeague(req.params.id, req.user!.userId);
    return res.status(201).json({ membership });
  } catch (err) {
    if (err instanceof ServiceError) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error('Join league error:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function getMine(req: Request, res: Response) {
  try {
    const leagues = await leagueService.getLeaguesByOrganizer(req.user!.userId);
    return res.json({ leagues });
  } catch (err) {
    console.error('Get my leagues error:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function update(req: Request<{ id: string }>, res: Response) {
  try {
    const { name, description, location } = req.body;

    if (name !== undefined && (typeof name !== 'string' || name.trim().length < 2)) {
      return res.status(400).json({ error: 'El nombre debe tener al menos 2 caracteres' });
    }
    if (location !== undefined && (typeof location !== 'string' || location.trim().length < 2)) {
      return res.status(400).json({ error: 'La ubicación debe tener al menos 2 caracteres' });
    }

    const league = await leagueService.updateLeague(
      req.params.id,
      { name: name?.trim(), description, location: location?.trim() },
      req.user!.userId,
    );
    return res.json({ league });
  } catch (err) {
    if (err instanceof ServiceError) return res.status(err.status).json({ error: err.message });
    console.error('Update league error:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function remove(req: Request<{ id: string }>, res: Response) {
  try {
    await leagueService.deleteLeague(req.params.id, req.user!.userId);
    return res.json({ message: 'Liga eliminada correctamente' });
  } catch (err) {
    if (err instanceof ServiceError) return res.status(err.status).json({ error: err.message });
    console.error('Delete league error:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function leave(req: Request<{ id: string }>, res: Response) {
  try {
    await leagueService.leaveLeague(req.params.id, req.user!.userId);
    return res.json({ message: 'Has abandonado la liga' });
  } catch (err) {
    if (err instanceof ServiceError) return res.status(err.status).json({ error: err.message });
    console.error('Leave league error:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
