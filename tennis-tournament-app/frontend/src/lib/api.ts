const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  body?: unknown;
  token?: string;
}

async function request<T>(method: Method, path: string, options?: RequestOptions): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options?.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new ApiError(res.status, data.error ?? 'Error desconocido');
  }

  return data as T;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export const api = {
  get: <T>(path: string, token?: string) => request<T>('GET', path, { token }),
  post: <T>(path: string, body?: unknown, token?: string) => request<T>('POST', path, { body, token }),
  put: <T>(path: string, body?: unknown, token?: string) => request<T>('PUT', path, { body, token }),
  patch: <T>(path: string, body?: unknown, token?: string) => request<T>('PATCH', path, { body, token }),
  delete: <T>(path: string, token?: string) => request<T>('DELETE', path, { token }),
};
