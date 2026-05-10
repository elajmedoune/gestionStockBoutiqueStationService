import { useNavigate } from 'react-router-dom'
import { Fuel, ArrowRight, Package, ShoppingCart, TrendingUp, Shield } from 'lucide-react'
import appConfig from '../config/app'

export default function Accueil() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-base-200 flex flex-col">

      {/* Bulles décoratives */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-primary/10 -translate-x-1/2 -translate-y-1/2 pointer-events-none blur-3xl" />
      <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-secondary/10 translate-x-1/3 translate-y-1/3 pointer-events-none blur-3xl" />
      <div className="absolute top-1/2 right-0 w-48 h-48 rounded-full bg-accent/10 translate-x-1/2 pointer-events-none blur-2xl" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow">
            {appConfig.company.logo
              ? <img src={appConfig.company.logo} alt="" className="w-full h-full object-contain rounded-xl" />
              : <Fuel size={20} className="text-primary-content" />
            }
          </div>
          <span className="font-extrabold text-base-content">{appConfig.company.name}</span>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="btn btn-primary btn-sm gap-2 rounded-xl"
        >
          Se connecter <ArrowRight size={14} />
        </button>
      </nav>

      {/* Hero */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-16">

        {/* Badge */}
        <div className="badge badge-primary badge-lg mb-6 gap-2 px-4 py-3 font-semibold">
          <span className="w-2 h-2 rounded-full bg-primary-content animate-pulse" />
          Système de gestion de stock
        </div>

        {/* Titre */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-base-content leading-tight mb-4 max-w-2xl">
          Gérez votre boutique{' '}
          <span className="text-primary">station service</span>{' '}
          simplement
        </h1>

        <p className="text-base-content/50 text-lg mb-10 max-w-lg">
          Suivez vos ventes, stocks, commandes et livraisons en temps réel depuis une seule plateforme.
        </p>

        {/* Bouton principal */}
        <button
          onClick={() => navigate('/login')}
          className="btn btn-primary btn-lg gap-3 rounded-2xl shadow-lg px-10"
        >
          Accéder à la plateforme
          <ArrowRight size={20} />
        </button>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-3xl w-full">
          {[
            { icon: <ShoppingCart size={22} />, label: 'Ventes',   desc: 'Point de vente intégré', color: 'bg-primary/10 text-primary' },
            { icon: <Package size={22} />,      label: 'Stocks',   desc: 'Suivi en temps réel',    color: 'bg-secondary/15 text-secondary' },
            { icon: <TrendingUp size={22} />,   label: 'Rapports', desc: 'Analyses détaillées',    color: 'bg-accent/10 text-accent' },
            { icon: <Shield size={22} />,       label: 'Rôles',    desc: 'Accès sécurisés',        color: 'bg-success/10 text-success' },
          ].map((f) => (
            <div key={f.label} className="bg-base-100 rounded-2xl p-5 shadow-sm border border-base-200 hover:-translate-y-1 transition-transform duration-200">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${f.color}`}>
                {f.icon}
              </div>
              <p className="font-bold text-sm text-base-content">{f.label}</p>
              <p className="text-xs text-base-content/40 mt-0.5">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center text-xs text-base-content/30 py-5">
        {appConfig.appName} © {new Date().getFullYear()} — {appConfig.company.address}
      </footer>

    </div>
  )
}