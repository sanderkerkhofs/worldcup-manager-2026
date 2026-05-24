import { apiPost, apiGet } from '@lib/api';
import { AuthSession, LoginInput, RegisterInput } from '@types';

export async function login(input: LoginInput): Promise<AuthSession> {
    return apiPost<AuthSession>('/auth/login', input);
}

export async function register(input: RegisterInput): Promise<AuthSession> {
    return apiPost<AuthSession>('/auth/register', input);
}

export async function readCurrentUser() {
    return apiGet<AuthSession['user']>('/auth/me');
}