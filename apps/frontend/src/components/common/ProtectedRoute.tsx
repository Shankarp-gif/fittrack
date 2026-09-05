import { Navigate } from 'react-router-dom'
import type { PropsWithChildren } from 'react'
import { useAuth } from '../../context/AuthContext'
import { PageLoader } from './PageLoader'

export function ProtectedRoute({ children }: PropsWithChildren) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <PageLoader />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

