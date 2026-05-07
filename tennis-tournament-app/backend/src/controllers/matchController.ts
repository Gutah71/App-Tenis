import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import * as matchService from '../services/matchService';

export async function generateBracket(req: AuthRequest, res: Response): Promise<void> {
  try {
    const matches = await matchService.generateBracket(req.params.tournamentId, req.userId!);
    res.status(201).json(matches);
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Error interno' });
  }
}

export async function getMatches(req: AuthRequest, res: Response): Promise<void> {
  const matches = await matchService.getMatches(req.params.tournamentId);
  res.json(matches);
}

export async function scheduleMatch(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { scheduledDate } = req.body;
    if (!scheduledDate) { res.status(400).json({ error: 'scheduledDate es requerido' }); return; }
    const match = await matchService.scheduleMatch(
      req.params.tournamentId,
      req.params.matchId,
      scheduledDate as string,
      req.userId!
    );
    res.json(match);
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Error interno' });
  }
}

export async function reportResult(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { winnerId, score } = req.body;
    if (!winnerId) { res.status(400).json({ error: 'winnerId es requerido' }); return; }
    const match = await matchService.reportResult(req.params.matchId, winnerId, req.userId!, score as string | undefined);
    res.json(match);
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Error interno' });
  }
}

export async function confirmResult(req: AuthRequest, res: Response): Promise<void> {
  try {
    const match = await matchService.confirmResult(req.params.matchId, req.userId!);
    res.json(match);
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Error interno' });
  }
}

export async function disputeResult(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { winnerId, score } = req.body;
    // winnerId/score required only for first dispute (PENDING_CONFIRMATION → DISPUTED)
    // For second dispute (DISPUTED → ORGANIZER_REVIEW) the service ignores them
    const match = await matchService.disputeResult(
      req.params.matchId,
      req.userId!,
      (winnerId as string) ?? '',
      (score as string) ?? ''
    );
    res.json(match);
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Error interno' });
  }
}

export async function organizerResolve(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { winnerId } = req.body;
    if (!winnerId) { res.status(400).json({ error: 'winnerId es requerido' }); return; }
    const match = await matchService.organizerResolve(req.params.matchId, winnerId, req.userId!);
    res.json(match);
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Error interno' });
  }
}