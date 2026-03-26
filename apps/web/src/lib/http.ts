import { useAuthStore } from '@/stores/auth.store'

const BASE = '/api/v1'

class HttpError extends Error {
  constructor(
    public status: number,
    public data: { message?: string | string[] },
  ) {
    super(typeof data.message === 'string' ? data.message : (data.message?.[0] ?? 'Error'))
    this.name = 'HttpError'
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { accessToken, setToken, clearAuth } = useAuthStore.getState()

  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)

  const res = await fetch(`${BASE}${path}`, { ...init, headers, credentials: 'include' })

  // Token expirado → intentar refresh una vez
  if (res.status === 401 && path !== '/auth/refresh' && path !== '/auth/login') {
    const refreshRes = await fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })

    if (refreshRes.ok) {
      const body = (await refreshRes.json()) as { data: { accessToken: string } }
      setToken(body.data.accessToken)
      headers.set('Authorization', `Bearer ${body.data.accessToken}`)
      const retryRes = await fetch(`${BASE}${path}`, { ...init, headers, credentials: 'include' })
      if (!retryRes.ok) {
        const err = await retryRes.json().catch(() => ({})) as { message?: string }
        throw new HttpError(retryRes.status, err)
      }
      return (retryRes.json() as Promise<{ data: T }>).then((b) => b.data)
    } else {
      clearAuth()
      window.location.replace('/login')
      throw new HttpError(401, { message: 'Sesión expirada' })
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string }
    throw new HttpError(res.status, err)
  }

  const json = await res.json() as { data: T }
  return json.data
}

export const http = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}

export { HttpError }
