import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Profil from './pages/Profil'
import Ventes from './pages/Ventes'
import Rapport from './pages/Rapport'


// Route protégée — redirige vers login si pas connecté
function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

// Route publique — redirige vers dashboard si déjà connecté
function PublicRoute({ children }) {
  const { user } = useAuth()
  return !user ? children : <Navigate to="/dashboard" />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />

      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />

      <Route path="/ventes" element={
        <ProtectedRoute>
        <Ventes />
      </ProtectedRoute>
      } />

      {/* Route par défaut */}
      <Route path="/rapport" element={
        <ProtectedRoute>
        <Rapport />
      </ProtectedRoute>
      } />
        
      {/* Route par défaut */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/profil" element={
        <ProtectedRoute>
          <Profil />
          </ProtectedRoute>
        } />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}