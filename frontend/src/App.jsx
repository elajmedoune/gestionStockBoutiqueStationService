import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Ventes from './pages/Ventes'
import Rapport from './pages/Rapport'
import RapportStock from './pages/RapportStock'
import MonProfil from './pages/MonProfil'
import Parametres from './pages/Parametres'
import Alertes from './pages/Alertes'
import Inventaires from './pages/Inventaires'
import Livraisons from './pages/Livraisons'
import Utilisateurs from './pages/Utilisateurs'
import TicketCaisse from './pages/TicketCaisse'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

function PublicRoute({ children }) {
  const { user } = useAuth()
  return !user ? children : <Navigate to="/dashboard" />
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />

      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/ventes" element={<ProtectedRoute><Ventes /></ProtectedRoute>} />
      <Route path="/rapport" element={<ProtectedRoute><Rapport /></ProtectedRoute>} />
      <Route path="/profil" element={<ProtectedRoute><MonProfil /></ProtectedRoute>} />
       <Route path="/parametres" element={<ProtectedRoute><Parametres /></ProtectedRoute>} />
      <Route path="/ticket-caisse" element={<ProtectedRoute><TicketCaisse /></ProtectedRoute>} />
       <Route path="/livraisons" element={<ProtectedRoute roles={['gerant','gestionnaire_stock','magasinier']}><Livraisons /></ProtectedRoute>} />
      <Route path="/alertes" element={<ProtectedRoute roles={['gerant','gestionnaire_stock','magasinier']}><Alertes /></ProtectedRoute>} />
      <Route path="/inventaire" element={<ProtectedRoute roles={['gerant','gestionnaire_stock','magasinier']}><Inventaires /></ProtectedRoute>} />
       <Route path="/utilisateurs" element={<ProtectedRoute roles={['gerant']}><Utilisateurs /></ProtectedRoute>} />
       
      {/* Rapport stock — gestionnaire + magasinier uniquement */}
      <Route path="/rapport-stock" element={
        <ProtectedRoute>
          {user && ['gestionnaire_stock', 'magasinier', 'gérant'].includes(user.role)
            ? <RapportStock />
            : <Navigate to="/dashboard" />
          }
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/dashboard" />} />
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