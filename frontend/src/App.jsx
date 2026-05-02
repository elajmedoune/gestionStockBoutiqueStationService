import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
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

// Pages qui ont déjà Layout intégré
function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

// Pages qui n'ont pas Layout
function ProtectedRouteWithLayout({ children }) {
  const { user } = useAuth()
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />
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

      {/* Pages avec Layout intégré */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/ventes" element={<ProtectedRoute><Ventes /></ProtectedRoute>} />
      <Route path="/rapport" element={<ProtectedRoute><Rapport /></ProtectedRoute>} />
      <Route path="/profil" element={<ProtectedRoute><MonProfil /></ProtectedRoute>} />
      <Route path="/parametres" element={<ProtectedRoute><Parametres /></ProtectedRoute>} />
      <Route path="/ticket-caisse" element={<ProtectedRoute><TicketCaisse /></ProtectedRoute>} />
      <Route path="/utilisateurs" element={<ProtectedRoute><Utilisateurs /></ProtectedRoute>} />

      {/* Pages sans Layout — on l'ajoute ici */}
      <Route path="/livraisons" element={<ProtectedRouteWithLayout><Livraisons /></ProtectedRouteWithLayout>} />
      <Route path="/alertes" element={<ProtectedRouteWithLayout><Alertes /></ProtectedRouteWithLayout>} />
      <Route path="/inventaire" element={<ProtectedRouteWithLayout><Inventaires /></ProtectedRouteWithLayout>} />

      <Route path="/rapport-stock" element={
        <ProtectedRoute>
          {user && ['gestionnaire_stock', 'magasinier', 'gerant'].includes(user.role)
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