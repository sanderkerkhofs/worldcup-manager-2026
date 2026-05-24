import { ApiEnvelope } from '@types';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api';

function readStoredToken(): string | null {
    if (typeof window === 'undefined') {
        return null;
    }

    return window.localStorage.getItem('tm-token');
}

async function parseError(response: Response): Promise<string> {
    try {
        const body = await response.json();
        return body.error ?? body.message ?? 'Request failed.';
    } catch {
        return 'Request failed.';
    }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const headers = new Headers(init?.headers);
    headers.set('Content-Type', 'application/json');

    const token = readStoredToken();
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${apiBaseUrl}${path}`, {
        ...init,
        headers,
    });

    if (!response.ok) {
        throw new Error(await parseError(response));
    }

    if (response.status === 204) {
        return undefined as T;
    }

    const body = (await response.json()) as ApiEnvelope<T> | T;
    if (body && typeof body === 'object' && 'data' in body) {
        return (body as ApiEnvelope<T>).data;
    }

    return body as T;
}

export function getApiBaseUrl(): string {
    return apiBaseUrl;
}

export function apiGet<T>(path: string): Promise<T> {
    return request<T>(path, { method: 'GET' });
}

export function apiPost<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, {
        method: 'POST',
        body: JSON.stringify(body),
    });
}

export function apiPut<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, {
        method: 'PUT',
        body: JSON.stringify(body),
    });
}

export function apiDelete<T>(path: string): Promise<T> {
    return request<T>(path, { method: 'DELETE' });
}