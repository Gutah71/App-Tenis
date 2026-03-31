import { Request, Response } from 'express';
import { ServiceError } from '../lib/errors';
import * as bracketService from '../services/bracket.service';

interface ReportResultBody {
  winnerId: string;
  result: string;
}

export async function generate(req: Request<{ id: string }>, res: Response) {
  try {
    const matches = await bracketService.generateBracket(req.params.id, req.user!.userId);
    return res.status(201).json({ matches });
  } catch (err) {
    if (err instanceof ServiceError) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error('Generate bracket error:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function getMatches(req: Request<{ id: string }>, res: Response) {
  try {
    const matches = await bracketService.getMatchesByTournament(req.params.id);
    return res.json({ matches });
  } catch (err) {
    if (err instanceof ServiceError) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error('Get matches error:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function reportResult(req: Request<{ matchId: string }, unknown, ReportResultBody>, res: Response) {
  try {
    const { winnerId, result } = req.body;

    if (!winnerId || !result) {
      return res.status(400).json({ error: 'winnerId y result son obligatorios' });
    }

    if (typeof winnerId !== 'string' || typeof result !== 'string') {
      return res.status(400).json({ error: 'winnerId y result deben ser texto' });
    }

    const match = await bracketService.reportResult(
      req.params.matchId,
      winnerId,
      result.trim(),
      req.user!.userId,
    );

    return res.json({ match });
  } catch (err) {
    if (err instanceof ServiceError) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error('Report result error:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
