import { lazy, Suspense, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'

// Spinner de chargement
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <span className="loading loading-spinner loading-lg text-primary" />
  </div>
)

// Transition entre pages
function PageTransition({ children }) {
  const location = useLocation()
  const [show, setShow] = useState(false)

  useEffect(() => {
    setShow(false)
    const t = setTimeout(() => setShow(true), 50)
    return () => clearTimeout(t)
  }, [location.pathname])

  return (
<div style={{
  transition: 'opacity 0.3s ease, transform 0.3s ease',
  opacity: show ? 1 : 0,
  transform: show ? 'translateY(0)' : 'translateY(8px)'
}}>
        {children}
    </div>
  )
}

// Lazy imports — chaque page se charge uniquement quand on y navigue
const Login          = lazy(() => import('./pages/Login'))
const Accueil        = lazy(() => import('./pages/Accueil'))
const Dashboard      = lazy(() => import('./pages/Dashboard'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword  = lazy(() => import('./pages/ResetPassword'))
const Ventes         = lazy(() => import('./pages/Ventes'))
const Rapport        = lazy(() => import('./pages/Rapport'))
const RapportStock   = lazy(() => import('./pages/RapportStock'))
const MonProfil      = lazy(() => import('./pages/MonProfil'))
const Parametres     = lazy(() => import('./pages/Parametres'))
const Alertes        = lazy(() => import('./pages/Alertes'))
const Inventaires    = lazy(() => import('./pages/Inventaires'))
const Livraisons     = lazy(() => import('./pages/Livraisons'))
const Utilisateurs   = lazy(() => import('./pages/Utilisateurs'))
const TicketCaisse   = lazy(() => import('./pages/TicketCaisse'))
const Categories     = lazy(() => import('./pages/Categories'))
const Produits       = lazy(() => import('./pages/Produits'))
const Stock          = lazy(() => import('./pages/Stock'))
const Fournisseurs   = lazy(() => import('./pages/Fournisseurs'))
const Commandes      = lazy(() => import('./pages/Commandes'))

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

function ProtectedRouteWithLayout({ children }) {
  const { user } = useAuth()
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />
}

function PublicRoute({ children }) {
  const { user } = useAuth()
  return !user ? children : <Navigate to="/dashboard" />
}

function RoleRoute({ children, allowedRoles }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" />
  if (!allowedRoles.includes(user.role)) return <Navigate to="/inventaire" />
  return children
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Suspense fallback={<PageLoader />}>
      <PageTransition>
        <Routes>
          <Route path="/" element={<Accueil />} />

          <Route path="/login"           element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password"  element={<ResetPassword />} />

          {/* Pages avec Layout intégré */}
          <Route path="/dashboard"     element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/rapport"       element={<ProtectedRoute><Rapport /></ProtectedRoute>} />
          <Route path="/profil"        element={<ProtectedRoute><MonProfil /></ProtectedRoute>} />
          <Route path="/ticket-caisse" element={<ProtectedRoute><TicketCaisse /></ProtectedRoute>} />

          {/* Pages avec Layout ajouté ici */}
          <Route path="/parametres"   element={<ProtectedRouteWithLayout><Parametres /></ProtectedRouteWithLayout>} />
          <Route path="/utilisateurs" element={<ProtectedRouteWithLayout><Utilisateurs /></ProtectedRouteWithLayout>} />
          <Route path="/produits"     element={<ProtectedRouteWithLayout><Produits /></ProtectedRouteWithLayout>} />
          <Route path="/stock"        element={<ProtectedRouteWithLayout><Stock /></ProtectedRouteWithLayout>} />
          <Route path="/categories"   element={<ProtectedRouteWithLayout><Categories /></ProtectedRouteWithLayout>} />
          <Route path="/fournisseurs" element={<ProtectedRouteWithLayout><Fournisseurs /></ProtectedRouteWithLayout>} />
          <Route path="/commandes" element={
            <RoleRoute allowedRoles={['gerant', 'gestionnaire_stock']}>
              <ProtectedRouteWithLayout><Commandes /></ProtectedRouteWithLayout>
            </RoleRoute>
          } />
          <Route path="/livraisons" element={
            <RoleRoute allowedRoles={['gerant', 'gestionnaire_stock']}>
              <ProtectedRouteWithLayout><Livraisons /></ProtectedRouteWithLayout>
            </RoleRoute>
          } />
          <Route path="/ventes" element={
            <RoleRoute allowedRoles={['gerant', 'caissier']}>
              <ProtectedRouteWithLayout><Ventes /></ProtectedRouteWithLayout>
            </RoleRoute>
          } />
          <Route path="/alertes"      element={<ProtectedRouteWithLayout><Alertes /></ProtectedRouteWithLayout>} />
          <Route path="/inventaire"   element={<ProtectedRouteWithLayout><Inventaires /></ProtectedRouteWithLayout>} />

          <Route path="/rapport-stock" element={
            <ProtectedRoute>
              {user && ['gestionnaire_stock', 'magasinier', 'gerant'].includes(user.role)
                ? <RapportStock />
                : <Navigate to="/dashboard" />
              }
            </ProtectedRoute>
          } />

          <Route path="*" element={
            <Navigate to={user?.role === 'magasinier' ? '/inventaire' : '/dashboard'} />
          } />
        </Routes>
      </PageTransition>
    </Suspense>
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