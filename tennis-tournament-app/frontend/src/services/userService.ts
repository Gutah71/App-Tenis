import request from './api';
import type { AuthResponse, User, UserStats, Tournament } from '../types';

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

export async function getUserStats(): Promise<UserStats> {
  return request<UserStats>('/users/me/stats');
}

export async function getMyTournaments(): Promise<Tournament[]> {
  return request<Tournament[]>('/users/me/tournaments');
}
