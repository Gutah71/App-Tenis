export interface User {
  id: string;
  name: string;
  email: string;
  role: 'PLAYER' | 'ORGANIZER';
  avatarUrl: string | null;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ── League types ──────────────────────────────────────────────────────────────

export interface LeagueSummary {
  id: string;
  name: string;
  description: string | null;
  location: string;
  isPublic: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy: { id: string; name: string };
  _count: { members: number; tournaments: number };
}

export interface LeagueMember {
  id: string;
  leagueId: string;
  userId: string;
  joinedAt: string;
  user: { id: string; name: string; avatarUrl: string | null };
}

export interface LeagueTournament {
  id: string;
  name: string;
  date: string;
  status: string;
  maxParticipants: number;
  isPublic: boolean;
}

export interface LeagueDetail {
  id: string;
  name: string;
  description: string | null;
  location: string;
  isPublic: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy: { id: string; name: string };
  members: LeagueMember[];
  tournaments: LeagueTournament[];
}

// ── Tournament types ──────────────────────────────────────────────────────────

export interface TournamentSummary {
  id: string;
  name: string;
  description: string | null;
  date: string;
  location: string;
  maxParticipants: number;
  modality: string;
  status: string;
  prize: string | null;
  isPublic: boolean;
  leagueId: string | null;
  createdById: string;
  createdAt: string;
  createdBy: { id: string; name: string };
  league: { id: string; name: string } | null;
  _count: { registrations: number };
}

// ── User pages types ──────────────────────────────────────────────────────────

export interface MyLeague extends LeagueSummary {
  joinedAt: string;
}

export interface MyTournament {
  id: string;
  name: string;
  date: string;
  location: string;
  status: string;
  maxParticipants: number;
  modality: string;
  isPublic: boolean;
  leagueId: string | null;
  createdBy: { id: string; name: string };
  league: { id: string; name: string } | null;
  _count: { registrations: number };
  registeredAt: string;
}

export interface TournamentRegistration {
  id: string;
  tournamentId: string;
  userId: string;
  createdAt: string;
  user: { id: string; name: string; avatarUrl: string | null };
}

export interface TournamentDetail {
  id: string;
  name: string;
  description: string | null;
  date: string;
  location: string;
  maxParticipants: number;
  modality: string;
  status: string;
  prize: string | null;
  rulesPdfUrl: string | null;
  isPublic: boolean;
  leagueId: string | null;
  createdById: string;
  createdAt: string;
  createdBy: { id: string; name: string };
  league: { id: string; name: string } | null;
  registrations: TournamentRegistration[];
}

// ── Match / Bracket types ─────────────────────────────────────────────────────

export interface MatchData {
  id: string;
  tournamentId: string;
  round: number;
  status: string;
  player1: { id: string; name: string } | null;
  player2: { id: string; name: string } | null;
  winner: { id: string; name: string } | null;
  result: string | null;
  nextMatchId: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Stats types ───────────────────────────────────────────────────────────────

export interface RecentMatch {
  id: string;
  tournamentId: string;
  round: number;
  result: string | null;
  player1: { id: string; name: string } | null;
  player2: { id: string; name: string } | null;
  winner: { id: string; name: string } | null;
  tournament: { id: string; name: string };
}

export interface PlayerStats {
  totalPlayed: number;
  matchesWon: number;
  matchesLost: number;
  winRate: number;
  tournamentsPlayed: number;
  tournamentsWon: number;
  recentMatches: RecentMatch[];
}
