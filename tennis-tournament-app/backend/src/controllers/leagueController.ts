import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import * as leagueService from '../services/leagueService';

export async function createLeague(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name } = req.body;
    if (!name) { res.status(400).json({ error: 'name es requerido' }); return; }
    const league = await leagueService.createLeague(name, req.userId!);
    res.status(201).json(league);
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Error interno' });
  }
}

export async function listLeagues(_req: AuthRequest, res: Response): Promise<void> {
  const leagues = await leagueService.listLeagues();
  res.json(leagues);
}

export async function getLeague(req: AuthRequest, res: Response): Promise<void> {
  try {
    const league = await leagueService.getLeague(req.params.id);
    res.json(league);
  } catch (err: unknown) {
    res.status(404).json({ error: err instanceof Error ? err.message : 'Error interno' });
  }
}

export async function joinLeague(req: AuthRequest, res: Response): Promise<void> {
  try {
    const member = await leagueService.joinLeague(req.params.id, req.userId!);
    res.status(201).json(member);
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Error interno' });
  }
}
