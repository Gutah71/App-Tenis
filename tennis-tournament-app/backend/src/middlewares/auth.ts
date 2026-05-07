import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

const JWT_SECRET = process.env.JWT_SECRET ?? 'changeme-in-production';

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token requerido' });
    return;
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    req.userId = payload.userId;
    req.userRole = payload.role;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

/** Same as authenticate, but does not fail when there is no/invalid token. */
export function optionalAuthenticate(req: AuthRequest, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      const payload = jwt.verify(header.slice(7), JWT_SECRET) as { userId: string; role: string };
      req.userId = payload.userId;
      req.userRole = payload.role;
    } catch {
      // ignore – treat as anonymous
    }
  }
  next();
}

export function requireOrganizer(req: AuthRequest, res: Response, next: NextFunction): void {
  if (req.userRole !== 'ORGANIZER') {
    res.status(403).json({ error: 'Se requiere rol ORGANIZER' });
    return;
  }
  next();
}
