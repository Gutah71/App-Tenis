import request from './api';
import type { League } from '../types';

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
