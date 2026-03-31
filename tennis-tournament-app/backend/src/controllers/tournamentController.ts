import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import * as tournamentService from '../services/tournamentService';

export async function createTournament(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, maxPlayers, leagueId, status } = req.body;
    if (!name || !maxPlayers) {
      res.status(400).json({ error: 'name y maxPlayers son requeridos' });
      return;
    }
    const tournament = await tournamentService.createTournament({
      name,
      maxPlayers: Number(maxPlayers),
      leagueId,
      status,
      createdById: req.userId!,
    });
    res.status(201).json(tournament);
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Error interno' });
  }
}

export async function listTournaments(req: AuthRequest, res: Response): Promise<void> {
  const { leagueId } = req.query;
  const tournaments = await tournamentService.listTournaments(leagueId as string | undefined);
  res.json(tournaments);
}

export async function getTournament(req: AuthRequest, res: Response): Promise<void> {
  try {
    const tournament = await tournamentService.getTournament(req.params.id);
    res.json(tournament);
  } catch (err: unknown) {
    res.status(404).json({ error: err instanceof Error ? err.message : 'Error interno' });
  }
}

export async function registerPlayer(req: AuthRequest, res: Response): Promise<void> {
  try {
    const reg = await tournamentService.registerPlayer(req.params.id, req.userId!);
    res.status(201).json(reg);
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Error interno' });
  }
}

export async function cancelRegistration(req: AuthRequest, res: Response): Promise<void> {
  try {
    await tournamentService.cancelRegistration(req.params.id, req.userId!);
    res.status(204).send();
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Error interno' });
  }
}

export async function updateStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { status } = req.body;
    if (!status) { res.status(400).json({ error: 'status es requerido' }); return; }
    const tournament = await tournamentService.updateTournamentStatus(req.params.id, status, req.userId!);
    res.json(tournament);
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Error interno' });
  }
}
