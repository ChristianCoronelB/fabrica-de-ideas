import { create } from 'zustand'
import { apiFetch, setToken, removeToken, getToken } from '@/lib/api'

export interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'PARTICIPANT' | 'EVALUATOR'
  phone: string | null
  avatar: string | null
  active: boolean
  createdAt: string
  updatedAt: string
  projects?: Array<{ id: string; name: string; status: string }>
  assignedProjects?: Array<{ projectId: string }>
  _count?: { projects: number; evaluations: number }
}

export interface RegisterData {
  name: string
  email: string
  password: string
  role: 'PARTICIPANT' | 'EVALUATOR'
  phone?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, password: string) => {
    const data = await apiFetch<{ user: User; token: string }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    )
    setToken(data.token)
    set({
      user: data.user,
      token: data.token,
      isAuthenticated: true,
      isLoading: false,
    })
  },

  register: async (data: RegisterData) => {
    const result = await apiFetch<{ user: User; token: string }>(
      '/api/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    )
    setToken(result.token)
    set({
      user: result.user,
      token: result.token,
      isAuthenticated: true,
      isLoading: false,
    })
  },

  logout: () => {
    removeToken()
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    })
  },

  checkAuth: async () => {
    const token = getToken()
    if (!token) {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false })
      return
    }

    try {
      const data = await apiFetch<{ user: User }>('/api/auth/me')
      set({
        user: data.user,
        token,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch {
      removeToken()
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  },
}))
