const ACCESS_TOKEN_KEY = 'fittrack_access_token'
const REFRESH_TOKEN_KEY = 'fittrack_refresh_token'

function normalizeToken(value: string | null) {
  if (!value) return null
  const normalized = value.trim()
  if (!normalized || normalized === 'null' || normalized === 'undefined') return null
  return normalized
}

export const tokenStorage = {
  getAccessToken: () => normalizeToken(localStorage.getItem(ACCESS_TOKEN_KEY)),
  getRefreshToken: () => normalizeToken(localStorage.getItem(REFRESH_TOKEN_KEY)),
  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  },
}

