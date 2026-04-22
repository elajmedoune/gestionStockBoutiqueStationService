// src/components/PrivateRoute.jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PrivateRoute({ children, roles }) {
  const { user, token } = useAuth()

  // Pas connecté → redirect login
  if (!token) return <Navigate to="/login" replace />

  // Rôle non autorisé → redirect dashboard
  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}