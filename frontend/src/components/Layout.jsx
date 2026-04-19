import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import appConfig from '../config/app'
import {
  Bell, User, LogOut, Settings,
  LayoutDashboard, ShoppingCart, Package, Truck,
  Menu, X, ChevronRight, ChevronLeft,
  BarChart2, Archive, AlertTriangle, Users, Tag
} from 'lucide-react'

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const menuGroups = [
    {
      label: 'Principal',
      items: [
        { label: 'Dashboard',    icon: <LayoutDashboard size={18} />, path: '/dashboard' },
        { label: 'Ventes',       icon: <ShoppingCart size={18} />,    path: '/ventes' },
        { label: 'Commandes',    icon: <Package size={18} />,         path: '/commandes' },
        { label: 'Livraisons',   icon: <Truck size={18} />,           path: '/livraisons' },
      ]
    },
    {
      label: 'Stock',
      items: [
        { label: 'Produits',     icon: <Archive size={18} />,         path: '/produits' },
        { label: 'Stock',        icon: <BarChart2 size={18} />,       path: '/stock' },
        { label: 'Catégories',   icon: <Tag size={18} />,             path: '/categories' },
        { label: 'Fournisseurs', icon: <Truck size={18} />,           path: '/fournisseurs' },
      ]
    },
    {
      label: 'Gestion',
      items: [
        { label: 'Inventaire',   icon: <Package size={18} />,         path: '/inventaire' },
        { label: 'Alertes',      icon: <AlertTriangle size={18} />,   path: '/alertes' },
        { label: 'Utilisateurs', icon: <Users size={18} />,           path: '/utilisateurs' },
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
        {menuGroups.map((group) => (
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
        ))}
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

            <button className="btn btn-ghost btn-circle btn-sm">
              <div className="indicator">
                <Bell size={18} />
                <span className="badge badge-xs badge-primary indicator-item"></span>
              </div>
            </button>

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