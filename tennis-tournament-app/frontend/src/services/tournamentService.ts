import request from './api';
import type { Tournament, Match } from '../types';

export async function listTournaments(leagueId?: string): Promise<Tournament[]> {
  const qs = leagueId ? `?leagueId=${leagueId}` : '';
  return request<Tournament[]>(`/tournaments${qs}`);
}

export async function getTournament(id: string): Promise<Tournament> {
  return request<Tournament>(`/tournaments/${id}`);
}

export async function createTournament(data: {
  name: string;
  maxPlayers: number;
  leagueId?: string;
  status?: string;
}): Promise<Tournament> {
  return request<Tournament>('/tournaments', { method: 'POST', body: JSON.stringify(data) });
}

export async function registerForTournament(id: string): Promise<void> {
  return request<void>(`/tournaments/${id}/register`, { method: 'POST' });
}

export async function cancelRegistration(id: string): Promise<void> {
  return request<void>(`/tournaments/${id}/register`, { method: 'DELETE' });
}

export async function updateTournamentStatus(id: string, status: string): Promise<Tournament> {
  return request<Tournament>(`/tournaments/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
}

export async function getMatches(tournamentId: string): Promise<Match[]> {
  return request<Match[]>(`/tournaments/${tournamentId}/matches`);
}

export async function generateBracket(tournamentId: string): Promise<Match[]> {
  return request<Match[]>(`/tournaments/${tournamentId}/matches/bracket`, { method: 'POST' });
}

export async function reportResult(tournamentId: string, matchId: string, winnerId: string): Promise<Match> {
  return request<Match>(`/tournaments/${tournamentId}/matches/${matchId}/report`, {
    method: 'POST',
    body: JSON.stringify({ winnerId }),
  });
}

export async function confirmResult(tournamentId: string, matchId: string): Promise<Match> {
  return request<Match>(`/tournaments/${tournamentId}/matches/${matchId}/confirm`, { method: 'POST' });
}

export async function disputeResult(tournamentId: string, matchId: string): Promise<Match> {
  return request<Match>(`/tournaments/${tournamentId}/matches/${matchId}/dispute`, { method: 'POST' });
}
