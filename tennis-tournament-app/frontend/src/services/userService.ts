import request from './api';
import type { AuthResponse, User, UserStats, PublicProfile, Tournament, League, Match } from '../types';

export async function register(name: string, email: string, password: string, role: string): Promise<AuthResponse> {
  return request<AuthResponse>('/users/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, role }),
  });
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/users/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getProfile(): Promise<User> {
  return request<User>('/users/me');
}

export async function updateName(name: string): Promise<User> {
  return request<User>('/users/me', { method: 'PATCH', body: JSON.stringify({ name }) });
}

export async function updateEmail(email: string): Promise<User> {
  return request<User>('/users/me/email', { method: 'PATCH', body: JSON.stringify({ email }) });
}

export async function updateNotifications(enabled: boolean): Promise<User> {
  return request<User>('/users/me/notifications', { method: 'PATCH', body: JSON.stringify({ enabled }) });
}

export async function getUserStats(): Promise<UserStats> {
  return request<UserStats>('/users/me/stats');
}

export async function getMyTournaments(): Promise<Tournament[]> {
  return request<Tournament[]>('/users/me/tournaments');
}

export async function getMyLeagues(): Promise<League[]> {
  return request<League[]>('/users/me/leagues');
}

export async function getMyMatches(): Promise<(Match & { tournament: { id: string; name: string } })[]> {
  return request<(Match & { tournament: { id: string; name: string } })[]>('/users/me/matches');
}

export async function getPublicProfile(id: string): Promise<PublicProfile> {
  return request<PublicProfile>(`/users/${id}`);
}
