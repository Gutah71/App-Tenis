export type Role = 'PLAYER' | 'ORGANIZER';

export type TournamentStatus =
  | 'DRAFT'
  | 'OPEN'
  | 'FULL'
  | 'IN_PROGRESS'
  | 'FINISHED'
  | 'CANCELLED';

export type MatchStatus =
  | 'PENDING'
  | 'PENDING_CONFIRMATION'
  | 'CONFIRMED'
  | 'DISPUTED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
}

export interface League {
  id: string;
  name: string;
  createdById: string;
  createdBy?: { id: string; name: string };
  createdAt?: string;
  _count?: { members: number; tournaments: number };
  members?: { userId: string; role: string; user: { id: string; name: string; email: string } }[];
  tournaments?: { id: string; name: string; status: TournamentStatus; maxPlayers: number }[];
}

export interface Tournament {
  id: string;
  name: string;
  maxPlayers: number;
  status: TournamentStatus;
  leagueId?: string | null;
  createdById: string;
  createdAt?: string;
  createdBy?: { id: string; name: string };
  league?: { id: string; name: string } | null;
  registrations?: { userId: string; user: { id: string; name: string } }[];
  matches?: Match[];
  _count?: { registrations: number };
}

export interface Match {
  id: string;
  tournamentId: string;
  round: number;
  position: number;
  status: MatchStatus;
  player1Id?: string | null;
  player2Id?: string | null;
  winnerId?: string | null;
  reportedById?: string | null;
  nextMatchId?: string | null;
  player1?: { id: string; name: string } | null;
  player2?: { id: string; name: string } | null;
  winner?: { id: string; name: string } | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}
