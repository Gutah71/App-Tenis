import { Request, Response } from 'express';
import { ServiceError } from '../lib/errors';
import { VALID_MODALITIES } from '../types/enums';
import type { Modality } from '../types/enums';
import * as tournamentService from '../services/tournament.service';

interface CreateTournamentBody {
  name: string;
  description?: string;
  date: string;
  location: string;
  maxParticipants: number;
  modality?: string;
  prize?: string;
  isPublic?: boolean;
  password?: string;
  leagueId?: string;
}

interface JoinTournamentBody {
  password?: string;
}

export async function create(req: Request<unknown, unknown, CreateTournamentBody>, res: Response) {
  try {
    const { name, date, location, maxParticipants, modality, description, prize, isPublic, password, leagueId } = req.body;

    if (!name || !date || !location || !maxParticipants) {
      return res.status(400).json({ error: 'Nombre, fecha, ubicación y máximo de participantes son obligatorios' });
    }

    if (typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'El nombre debe tener al menos 2 caracteres' });
    }

    if (isNaN(Date.parse(date))) {
      return res.status(400).json({ error: 'Fecha no válida' });
    }

    if (typeof location !== 'string' || location.trim().length < 2) {
      return res.status(400).json({ error: 'La ubicación debe tener al menos 2 caracteres' });
    }

    if (typeof maxParticipants !== 'number' || !Number.isInteger(maxParticipants) || maxParticipants < 2) {
      return res.status(400).json({ error: 'El máximo de participantes debe ser un número entero mayor o igual a 2' });
    }

    if (modality !== undefined && !VALID_MODALITIES.includes(modality as Modality)) {
      return res.status(400).json({ error: `Modalidad no válida. Valores permitidos: ${VALID_MODALITIES.join(', ')}` });
    }

    if (description !== undefined && typeof description !== 'string') {
      return res.status(400).json({ error: 'La descripción debe ser un texto' });
    }

    if (prize !== undefined && typeof prize !== 'string') {
      return res.status(400).json({ error: 'El premio debe ser un texto' });
    }

    if (password !== undefined && typeof password !== 'string') {
      return res.status(400).json({ error: 'La contraseña debe ser un texto' });
    }

    if (leagueId !== undefined && (typeof leagueId !== 'string' || leagueId.trim().length === 0)) {
      return res.status(400).json({ error: 'El ID de liga no es válido' });
    }

    const tournament = await tournamentService.createTournament(
      {
        name: name.trim(),
        description,
        date,
        location: location.trim(),
        maxParticipants,
        modality: modality as Modality | undefined,
        prize,
        isPublic,
        password,
        leagueId,
      },
      req.user!.userId,
    );

    return res.status(201).json({ tournament });
  } catch (err) {
    if (err instanceof ServiceError) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error('Create tournament error:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function getAll(_req: Request, res: Response) {
  try {
    const tournaments = await tournamentService.getAllTournaments();
    return res.json({ tournaments });
  } catch (err) {
    console.error('Get tournaments error:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function getById(req: Request<{ id: string }>, res: Response) {
  try {
    const tournament = await tournamentService.getTournamentById(req.params.id);
    return res.json({ tournament });
  } catch (err) {
    if (err instanceof ServiceError) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error('Get tournament error:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function join(req: Request<{ id: string }, unknown, JoinTournamentBody>, res: Response) {
  try {
    const registration = await tournamentService.joinTournament(
      req.params.id,
      req.user!.userId,
      req.body.password,
    );
    return res.status(201).json({ registration });
  } catch (err) {
    if (err instanceof ServiceError) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error('Join tournament error:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function getMine(req: Request, res: Response) {
  try {
    const tournaments = await tournamentService.getTournamentsByOrganizer(req.user!.userId);
    return res.json({ tournaments });
  } catch (err) {
    console.error('Get my tournaments error:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function update(req: Request<{ id: string }>, res: Response) {
  try {
    const { name, description, location, date, prize } = req.body;

    if (name !== undefined && (typeof name !== 'string' || name.trim().length < 2)) {
      return res.status(400).json({ error: 'El nombre debe tener al menos 2 caracteres' });
    }
    if (location !== undefined && (typeof location !== 'string' || location.trim().length < 2)) {
      return res.status(400).json({ error: 'La ubicación debe tener al menos 2 caracteres' });
    }
    if (date !== undefined && isNaN(Date.parse(date))) {
      return res.status(400).json({ error: 'Fecha no válida' });
    }

    const tournament = await tournamentService.updateTournament(
      req.params.id,
      { name: name?.trim(), description, location: location?.trim(), date, prize },
      req.user!.userId,
    );
    return res.json({ tournament });
  } catch (err) {
    if (err instanceof ServiceError) return res.status(err.status).json({ error: err.message });
    console.error('Update tournament error:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function remove(req: Request<{ id: string }>, res: Response) {
  try {
    await tournamentService.deleteTournament(req.params.id, req.user!.userId);
    return res.json({ message: 'Torneo eliminado correctamente' });
  } catch (err) {
    if (err instanceof ServiceError) return res.status(err.status).json({ error: err.message });
    console.error('Delete tournament error:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function leave(req: Request<{ id: string }>, res: Response) {
  try {
    await tournamentService.leaveTournament(req.params.id, req.user!.userId);
    return res.json({ message: 'Has abandonado el torneo' });
  } catch (err) {
    if (err instanceof ServiceError) return res.status(err.status).json({ error: err.message });
    console.error('Leave tournament error:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
