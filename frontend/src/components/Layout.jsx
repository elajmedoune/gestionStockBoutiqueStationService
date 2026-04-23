import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import appConfig from '../config/app'
import { useCommandes, useLivraisons, useUtilisateurs, useProduits, useStocks, useNotifications } from '../hooks'
import {
  Bell, User, LogOut, Settings,
  LayoutDashboard, ShoppingCart, Package, Truck,
  Menu, X, ChevronRight, ChevronLeft,
  BarChart2, Archive, AlertTriangle, Users, Tag,
  TrendingUp, Building2, Boxes,  ClipboardList,
  ClipboardCheck
} from 'lucide-react'

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { data: commandes }    = useCommandes()
  const { data: livraisons }   = useLivraisons()
  const { data: utilisateurs } = useUtilisateurs()
  const { data: produits }     = useProduits()
  const { data: stocks }       = useStocks()

  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const notifications = useNotifications(user, { commandes, livraisons, utilisateurs, produits, stocks })

const [luues, setLuues] = useState(() => JSON.parse(localStorage.getItem('notifs_lues') || '[]'))
const [supprimees, setSupprimees] = useState(() => JSON.parse(localStorage.getItem('notifs_supprimees') || '[]'))

const notifsVisibles = notifications.filter(n => !supprimees.includes(n.id))
const notifsNonLues  = notifsVisibles.filter(n => !luues.includes(n.id))

const marquerLue = (id) => {
  const updated = [...luues, id]
  setLuues(updated)
  localStorage.setItem('notifs_lues', JSON.stringify(updated))
}

const marquerToutLu = () => {
  const updated = notifsVisibles.map(n => n.id)
  setLuues(updated)
  localStorage.setItem('notifs_lues', JSON.stringify(updated))
}

const supprimer = (id) => {
  const updated = [...supprimees, id]
  setSupprimees(updated)
  localStorage.setItem('notifs_supprimees', JSON.stringify(updated))
}

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

const menuGroups = [
  {
    label: 'Principal',
    items: [
      { label: 'Dashboard',     icon: <LayoutDashboard size={18} />, path: '/dashboard',     roles: ['gerant', 'caissier', 'magasinier', 'gestionnaire_stock'] },
      { label: 'Rapport',       icon: <TrendingUp size={18} />,      path: '/rapport',       roles: ['gerant'] },
      { label: 'Rapport Stock', icon: <ClipboardList size={18} />,   path: '/rapport-stock', roles: ['gestionnaire_stock', 'magasinier'] },
    ]
  },
  {
    label: 'Opérations',
    items: [
      { label: 'Ventes',        icon: <ShoppingCart size={18} />,    path: '/ventes',        roles: ['gerant', 'caissier'] },
      { label: 'Commandes',     icon: <Package size={18} />,         path: '/commandes',     roles: ['gerant', 'gestionnaire_stock', 'magasinier'] },
      { label: 'Livraisons',    icon: <Truck size={18} />,           path: '/livraisons',    roles: ['gerant', 'gestionnaire_stock', 'magasinier'] },
    ]
  },
  {
    label: 'Stock',
    items: [
      { label: 'Produits',      icon: <Archive size={18} />,         path: '/produits',      roles: ['gerant', 'gestionnaire_stock', 'magasinier', 'caissier'] },
      { label: 'Stock',         icon: <BarChart2 size={18} />,       path: '/stock',         roles: ['gerant', 'gestionnaire_stock', 'magasinier'] },
      { label: 'Catégories',    icon: <Tag size={18} />,             path: '/categories',    roles: ['gerant', 'gestionnaire_stock'] },
      { label: 'Fournisseurs',  icon: <Users size={18} />,           path: '/fournisseurs',  roles: ['gerant', 'gestionnaire_stock'] },
    ]
  },
  {
    label: 'Gestion',
    items: [
      { label: 'Inventaire',    icon: <ClipboardCheck size={18} />,  path: '/inventaire',    roles: ['gerant', 'gestionnaire_stock', 'magasinier'] },
      { label: 'Alertes',       icon: <AlertTriangle size={18} />,   path: '/alertes',       roles: ['gerant', 'gestionnaire_stock', 'magasinier'] },
      { label: 'Utilisateurs',  icon: <Users size={18} />,           path: '/utilisateurs',  roles: ['gerant'] },
    ]
  },
]

  const SidebarContent = ({ isCollapsed = false, onNavigate, showToggle = false }) => (
    <div className="flex flex-col h-full">
      
      {/* Logo + bouton toggle */}
      <div className={`flex items-center border-b border-base-200 h-16 shrink-0 ${isCollapsed ? 'justify-center px-3' : 'justify-between px-4'}`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-primary-content text-lg shadow shrink-0">
            {appConfig.company.logo
            ? <img src={appConfig.company.logo} alt={appConfig.company.name} className="w-full h-full object-contain rounded-xl" />
            : <span>⛽</span>
            }
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="font-bold text-base-content leading-tight truncate">{appConfig.appName}</p>
                <p className="text-xs text-base-content/40">{appConfig.company.slogan}</p>
                </div>
              )}
              </div>
        
        {showToggle && (
          <button
          onClick={() => setCollapsed(!isCollapsed)}
          className="absolute top-13 -right-3 btn btn-ghost btn-circle btn-xs text-base-content/40 hover:text-base-content z-50 bg-base-100 shadow-md border border-base-200"          title={isCollapsed ? 'Ouvrir le menu' : 'Réduire le menu'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          )}
          </div>

{/* Menu */}
<nav className="flex-1 overflow-y-auto py-4 px-2 space-y-4">
  {menuGroups
    .map(group => ({
      ...group,
      items: group.items.filter(item => item.roles.includes(user?.role))
    }))
    .filter(group => group.items.length > 0) 
    .map((group) => (
      <div key={group.label}>
        {!isCollapsed && (
          <p className="text-xs font-semibold uppercase tracking-widest text-base-content/30 px-3 mb-1">
            {group.label}
          </p>
        )}
        {isCollapsed && <div className="border-t border-base-200 mx-2 mb-2" />}

        <ul className="flex flex-col gap-0.5">
          {group.items.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <li key={item.path}>
                <button
                  onClick={() => onNavigate(item.path)}
                  title={isCollapsed ? item.label : undefined}
                  className={`
                    flex items-center w-full rounded-lg text-sm font-medium
                    transition-all duration-150
                    ${isCollapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5'}
                    ${isActive
                      ? 'bg-primary text-primary-content shadow-sm'
                      : 'text-base-content/70 hover:bg-base-200 hover:text-base-content'
                    }
                  `}
                >
                  <span className={isActive ? 'text-primary-content' : 'text-base-content/50'}>
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {isActive && <ChevronRight size={14} className="opacity-60" />}
                    </>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    ))
  }
</nav>
    </div>
  )

  return (
    <div className="min-h-screen bg-base-200 flex">

      {/* ── SIDEBAR DESKTOP ── */}
      <aside
        className={`
          hidden lg:flex flex-col bg-base-100 border-r border-base-200
          sticky top-0 h-screen shrink-0 overflow-visible z-40
          transition-all duration-300 ease-in-out
          ${collapsed ? 'w-16' : 'w-64'}
          `}
      >
        <SidebarContent
          isCollapsed={collapsed}
          onNavigate={(path) => navigate(path)}
          showToggle={true}
        />
      </aside>

      {/* ── SIDEBAR MOBILE (drawer) ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-base-100 z-50 shadow-2xl
        transition-transform duration-300 ease-in-out lg:hidden
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <button
          className="absolute top-3 right-3 btn btn-ghost btn-circle btn-sm z-10"
          onClick={() => setMobileOpen(false)}
        >
          <X size={18} />
        </button>
        <SidebarContent
          isCollapsed={false}
          onNavigate={(path) => { navigate(path); setMobileOpen(false) }}
          showToggle={false}
        />
      </aside>

      {/* ── ZONE DROITE ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* NAVBAR */}
        <header className="navbar bg-base-100 border-b border-base-200 px-4 sticky top-0 z-30 h-16 min-h-0">

          {/* Hamburger mobile */}
          <div className="flex-none lg:hidden">
            <button
              className="btn btn-ghost btn-circle btn-sm"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={20} />
            </button>
          </div>

          <div className="flex-1" />

          <div className="flex-none flex items-center gap-1">

           <div className="dropdown dropdown-end">
  <button tabIndex={0} className="btn btn-ghost btn-circle btn-sm relative">
    <Bell size={18} />
    {notifsNonLues.length > 0 && (
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-error text-white text-xs rounded-full flex items-center justify-center font-bold leading-none">
        {notifsNonLues.length > 9 ? '9+' : notifsNonLues.length}
      </span>
    )}
  </button>

  <ul tabIndex={0} className="dropdown-content z-50 bg-base-100 rounded-xl shadow-lg border border-base-200 w-80 p-0 mt-2">

    {/* Header */}
    <div className="flex items-center justify-between px-4 py-3 border-b border-base-200">
      <p className="font-bold text-sm">Notifications</p>
      {notifsNonLues.length > 0 && (
        <button onClick={marquerToutLu} className="text-xs text-primary font-semibold hover:underline">
          Tout marquer lu
        </button>
      )}
    </div>

    {/* Liste */}
    {notifsVisibles.length === 0
      ? <div className="py-8 text-center">
          <Bell size={24} className="mx-auto text-base-content/20 mb-2" />
          <p className="text-sm text-base-content/40">Aucune notification</p>
        </div>
      : notifsVisibles.slice(0, 6).map(n => {
          const estLue = luues.includes(n.id)
          return (
            <div key={n.id}
              onClick={() => marquerLue(n.id)}
              className={`flex items-start gap-3 px-4 py-3 border-b border-base-200/50 hover:bg-base-200/40 transition-colors cursor-pointer ${estLue ? 'opacity-50' : ''}`}>

              {/* Icone */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                n.niveau === 'error'   ? 'bg-error/10 text-error' :
                n.niveau === 'warning' ? 'bg-warning/10 text-warning' :
                n.niveau === 'success' ? 'bg-success/10 text-success' :
                                         'bg-info/10 text-info'
              }`}>
                {n.niveau === 'error'   ? <AlertTriangle size={14} /> :
                 n.niveau === 'warning' ? <Bell size={14} /> :
                 n.niveau === 'success' ? <Truck size={14} /> :
                                          <Package size={14} />}
              </div>

              {/* Texte */}
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold ${estLue ? 'text-base-content/50' : 'text-base-content'}`}>{n.label}</p>
                <p className="text-xs text-base-content/60 mt-0.5 truncate">{n.message}</p>
                {n.date && (
                  <p className="text-xs text-base-content/30 mt-1">
                    {new Date(n.date).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>

              {/* Point + supprimer */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                {!estLue && <span className={`w-2 h-2 rounded-full ${
                  n.niveau === 'error'   ? 'bg-error' :
                  n.niveau === 'warning' ? 'bg-warning' :
                  n.niveau === 'success' ? 'bg-success' : 'bg-info'
                }`} />}
                <button
                  onClick={e => { e.stopPropagation(); supprimer(n.id) }}
                  className="text-base-content/20 hover:text-error transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          )
        })
    }

    {/* Footer */}
    {notifsVisibles.length > 6 && (
      <div className="px-4 py-3 border-t border-base-200 text-center">
        <p className="text-xs text-base-content/40">+{notifsVisibles.length - 6} autres</p>
      </div>
    )}
  </ul>
</div>

            <div className="dropdown dropdown-end">
              <div tabIndex={0} className="btn btn-ghost btn-sm gap-2 px-2">
                <div className="w-7 h-7 rounded-full overflow-hidden bg-primary text-primary-content flex items-center justify-center">
                  {user?.photo ? (
                    <img
                    src={`http://localhost:8000/storage/${user.photo}`}
                    alt="avatar"
                    className="w-full h-full object-cover"
                    />
                  ) : (
                  <User size={14} />
                  )}
                  </div>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-semibold leading-tight">{user?.prenom}</span>
                  <span className="text-xs text-base-content/40 capitalize">{user?.role}</span>
                  </div>
                  </div>
                  <ul tabIndex={0} className="dropdown-content bg-base-100 rounded-box shadow-lg w-56 mt-2 p-0 z-50 border border-base-200 overflow-hidden">
                    
                    {/* Header profil */}
                    <div className="flex items-center gap-3 p-4 bg-base-200/50 border-b border-base-200">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-primary text-primary-content flex items-center justify-center shrink-0">
                      {user?.photo ? (
                        <img src={`http://localhost:8000/storage/${user.photo}`} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                      <User size={16} />
                      )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-base-content truncate">{user?.prenom} {user?.nom}</p>
                        <span className="badge badge-primary badge-xs capitalize">{user?.role}</span>
                        </div>
                        </div>
                        
                        {/* Menu items */}
                        <div className="p-2">
                          <button onClick={() => navigate('/profil')} className="flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg hover:bg-base-200 transition">
                            <User size={14} /> Mon profil
                          </button>
                          <button onClick={() => navigate('/parametres')} className="flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg hover:bg-base-200 transition">
                            <Settings size={14} /> Paramètres
                          </button>
                            <div className="divider my-1"></div>
                          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg hover:bg-error/10 text-error transition">
                            <LogOut size={14} /> Déconnexion
                          </button>
                      </div>
                  </ul>
                </div>
              </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>

      </div>
    </div>
  )
}