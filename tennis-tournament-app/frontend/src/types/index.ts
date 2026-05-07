export type Role = 'PLAYER' | 'ORGANIZER';

export type TournamentStatus =
  | 'OPEN'
  | 'FULL'
  | 'IN_PROGRESS'
  | 'FINISHED'
  | 'CANCELLED';

export type MatchStatus =
  | 'PENDING'
  | 'PENDING_CONFIRMATION'
  | 'CONFIRMED'
  | 'DISPUTED'
  | 'ORGANIZER_REVIEW';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  notificationsEnabled?: boolean;
  createdAt?: string;
}

export interface Announcement {
  id: string;
  leagueId: string;
  content: string;
  createdAt: string;
  createdBy: { id: string; name: string };
}

export interface PlayerStats {
  userId: string;
  name: string;
  tournamentsPlayed: number;
  tournamentsWon: number;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  setsWon: number;
  setsLost: number;
}

export interface UserStats {
  tournamentsPlayed: number;
  tournamentsWon: number;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  setsWon: number;
  setsLost: number;
}

export interface PublicProfile extends User {
  stats: UserStats;
}

export interface League {
  id: string;
  name: string;
  isPrivate?: boolean;
  restricted?: boolean;
  viewerIsMember?: boolean;
  createdById: string;
  createdBy?: { id: string; name: string };
  createdAt?: string;
  _count?: { members: number; tournaments: number };
  members?: { userId: string; role: string; user: { id: string; name: string; email: string } }[];
  tournaments?: {
    id: string; name: string; status: TournamentStatus; maxPlayers: number;
    location?: string | null; startDate?: string | null; endDate?: string | null;
    _count?: { registrations: number };
  }[];
  announcements?: Announcement[];
}

export interface Tournament {
  id: string;
  name: string;
  maxPlayers: number;
  isPrivate?: boolean;
  restricted?: boolean;
  viewerIsRegistered?: boolean;
  status: TournamentStatus;
  leagueId?: string | null;
  location?: string | null;
  startDate?: string | null;
  endDate?: string | null;
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
  score?: string | null;
  scheduledDate?: string | null;
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
