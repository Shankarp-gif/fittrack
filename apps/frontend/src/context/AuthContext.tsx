import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { authService } from '../services/authService'
import { tokenStorage } from '../utils/storage'
import type { LoginRequest, RegisterRequest, UserMe } from '../types/auth'

interface AuthContextType {
  user: UserMe | null
  loading: boolean
  isAuthenticated: boolean
  login: (payload: LoginRequest) => Promise<void>
  register: (payload: RegisterRequest) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<UserMe | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const refreshToken = tokenStorage.getRefreshToken()
    if (!refreshToken) {
      setLoading(false)
      return
    }

    authService
      .refresh(refreshToken)
      .then((response) => {
        tokenStorage.setTokens(response.accessToken, response.refreshToken)
        setUser(response.user)
      })
      .catch(() => {
        tokenStorage.clear()
      })
      .finally(() => setLoading(false))
  }, [])

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login: async (payload) => {
        const response = await authService.login(payload)
        tokenStorage.setTokens(response.accessToken, response.refreshToken)
        setUser(response.user)
      },
      register: async (payload) => {
        const response = await authService.register(payload)
        tokenStorage.setTokens(response.accessToken, response.refreshToken)
        setUser(response.user)
      },
      logout: () => {
        tokenStorage.clear()
        setUser(null)
      },
    }),
    [loading, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return ctx
}

