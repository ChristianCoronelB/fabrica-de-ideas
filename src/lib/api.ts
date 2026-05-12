const TOKEN_KEY = 'fabrica_token'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
}

export interface ApiError {
  error: string
  details?: unknown
}

export async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const token = getToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    removeToken()
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
    throw new Error('Sesión expirada')
  }

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as ApiError | null
    throw new Error(data?.error || `Error ${response.status}`)
  }

  return response.json() as Promise<T>
}
