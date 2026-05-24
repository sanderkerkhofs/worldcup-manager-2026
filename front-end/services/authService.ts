import { api } from '../lib/api';
import { AuthResponse, AuthUser } from '../types';

export async function login(username: string, password: string): Promise<AuthResponse> {
  return api.post<AuthResponse>('/api/auth/login', { username, password });
}

export async function register(username: string, password: string): Promise<AuthResponse> {
  return api.post<AuthResponse>('/api/auth/register', { username, password });
}

export async function me(token: string): Promise<AuthUser> {
  return api.get<AuthUser>('/api/auth/me', token);
}

export async function listUsers(token: string): Promise<AuthUser[]> {
  return api.get<AuthUser[]>('/api/users', token);
}

export async function deleteUser(userId: string, token: string): Promise<void> {
  return api.del<void>(`/api/users/${userId}`, token);
}
