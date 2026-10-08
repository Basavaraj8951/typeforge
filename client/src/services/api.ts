export class ApiError extends Error {}
export async function api<T>(path: string, body?: unknown, method = body ? 'POST' : 'GET'): Promise<T> {
  let res: Response;
  try {
    res = await fetch('/api' + path, { method, credentials: 'include', headers: body ? { 'Content-Type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined });
  } catch { throw new ApiError('Network error. Check your connection and try again.'); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || 'Request failed.');
  return data as T;
}
