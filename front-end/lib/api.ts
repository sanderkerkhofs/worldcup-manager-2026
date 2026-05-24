type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
  public readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(method: HttpMethod, path: string, token?: string | null, body?: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new ApiError(payload?.error ?? 'Request failed', response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const api = {
  get: <T>(path: string, token?: string | null) => request<T>('GET', path, token),
  post: <T>(path: string, body?: unknown, token?: string | null) => request<T>('POST', path, token, body),
  put: <T>(path: string, body?: unknown, token?: string | null) => request<T>('PUT', path, token, body),
  patch: <T>(path: string, body?: unknown, token?: string | null) => request<T>('PATCH', path, token, body),
  del: <T>(path: string, token?: string | null) => request<T>('DELETE', path, token),
};
