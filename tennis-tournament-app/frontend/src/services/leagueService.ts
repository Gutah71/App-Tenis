import request from './api';
import type { League, Announcement, PlayerStats } from '../types';

export async function listLeagues(): Promise<League[]> {
  return request<League[]>('/leagues');
}

export async function getLeague(id: string): Promise<League> {
  return request<League>(`/leagues/${id}`);
}

export async function createLeague(name: string): Promise<League> {
  return request<League>('/leagues', { method: 'POST', body: JSON.stringify({ name }) });
}

export async function joinLeague(id: string): Promise<void> {
  return request<void>(`/leagues/${id}/join`, { method: 'POST' });
}

export async function updateLeague(id: string, name: string): Promise<League> {
  return request<League>(`/leagues/${id}`, { method: 'PATCH', body: JSON.stringify({ name }) });
}

export async function deleteLeague(id: string): Promise<void> {
  return request<void>(`/leagues/${id}`, { method: 'DELETE' });
}

export async function addAnnouncement(leagueId: string, content: string): Promise<Announcement> {
  return request<Announcement>(`/leagues/${leagueId}/announcements`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export async function deleteAnnouncement(leagueId: string, announcementId: string): Promise<void> {
  return request<void>(`/leagues/${leagueId}/announcements/${announcementId}`, { method: 'DELETE' });
}

export async function getLeagueStats(leagueId: string): Promise<PlayerStats[]> {
  return request<PlayerStats[]>(`/leagues/${leagueId}/stats`);
}
