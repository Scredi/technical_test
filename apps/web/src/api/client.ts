const API_BASE = '/api';

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

export async function fetchApi<T>(path: string, options?: RequestOptions): Promise<T> {
  const headers = new Headers(options?.headers);
  const hasBody = options?.body !== undefined;

  if (hasBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body: hasBody ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? 'Request failed');
  }
  return res.json();
}
