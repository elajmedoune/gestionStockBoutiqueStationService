import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, User, Fuel, ArrowRight, ShoppingCart, Users, TrendingUp } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import appConfig from '../config/app'
import api from '../services/api'

export default function Login() {
  const [form, setForm] = useState({ login: '', motDePasse: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [focused, setFocused] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ produits: '…', caissiers: '…' })

  useEffect(() => {
    api.get('/stats-publiques').then(res => setStats(res.data)).catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form)
      navigate('/dashboard')
    } catch (err) {
        const message = err.response?.data?.errors?.login?.[0] 
          ?? err.response?.data?.message 
          ?? 'Identifiants incorrects. Veuillez réessayer.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* 🧁 Panneau gauche cupcake */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-neutral flex-col items-center justify-center p-12">

        {/* Bulles pastel cupcake */}
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-primary/30 -translate-x-1/2 -translate-y-1/2 pointer-events-none blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-secondary/30 translate-x-1/3 translate-y-1/3 pointer-events-none blur-3xl" />
        <div className="absolute top-1/2 right-0 w-48 h-48 rounded-full bg-accent/25 translate-x-1/2 pointer-events-none blur-2xl" />
        <div className="absolute top-1/4 left-1/3 w-32 h-32 rounded-full bg-info/20 pointer-events-none blur-2xl" />

        {/* Grille de points */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '28px 28px'
        }} />

        {/* Contenu */}
        <div className="relative text-center text-neutral-content z-10">
          {/* Logo */}
          <div className="w-20 h-20 rounded-2xl bg-primary/30 border border-primary/40 flex items-center justify-center mx-auto mb-6 shadow-2xl backdrop-blur-sm">
            {appConfig.company.logo
              ? <img src={appConfig.company.logo} alt={appConfig.company.name} className="w-full h-full object-contain rounded-2xl" />
              : <Fuel size={36} className="text-neutral-content" />
            }
          </div>

          <h1 className="text-3xl font-extrabold mb-2 tracking-tight">{appConfig.company.name}</h1>
          <p className="text-sm opacity-60 mb-10">{appConfig.company.slogan} — {appConfig.company.address}</p>

          {/* Stats */}
          <div className="flex gap-3 justify-center mb-10">
            {[
              { label: 'Produits',  value: stats.produits,  icon: <ShoppingCart size={16} />, accent: 'bg-primary/20 border-primary/30' },
              { label: 'Caissiers', value: stats.caissiers, icon: <Users size={16} />,        accent: 'bg-secondary/25 border-secondary/40' },
              { label: 'Fiable',    value: '100%',          icon: <TrendingUp size={16} />,   accent: 'bg-accent/20 border-accent/30' },
            ].map(s => (
              <div key={s.label} className={`${s.accent} border rounded-2xl p-4 text-center backdrop-blur-sm hover:-translate-y-1 transition-transform duration-200`}>
                <div className="flex items-center justify-center gap-1.5 opacity-80 mb-1">
                  {s.icon}
                  <span className="text-xs font-semibold uppercase tracking-widest">{s.label}</span>
                </div>
                <p className="text-2xl font-extrabold">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Feature list */}
          <div className="space-y-2 text-left">
            {[
              { txt: 'Gestion des ventes en temps réel', dot: 'bg-primary' },
              { txt: 'Suivi des stocks et alertes',      dot: 'bg-secondary' },
              { txt: 'Rapports financiers détaillés',    dot: 'bg-accent' },
            ].map((feat, i) => (
              <div key={i} className="flex items-center gap-2 text-sm opacity-70">
                <div className={`w-2 h-2 rounded-full ${feat.dot} shrink-0`} />
                {feat.txt}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panneau droit */}
      <div className="flex-1 flex items-center justify-center p-8 bg-base-100 relative overflow-hidden">
        {/* 🧁 décorations subtiles côté droit */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/10 -translate-y-1/2 translate-x-1/3 pointer-events-none blur-2xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-secondary/10 translate-y-1/2 -translate-x-1/3 pointer-events-none blur-2xl" />

        <div className="w-full max-w-sm relative z-10">

          {/* Header mobile */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg mb-3">
              {appConfig.company.logo
                ? <img src={appConfig.company.logo} alt="" className="w-full h-full object-contain rounded-2xl" />
                : <Fuel size={24} className="text-primary-content" />
              }
            </div>
            <h1 className="text-xl font-extrabold text-base-content">{appConfig.appName}</h1>
          </div>

          {/* Titre */}
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-base-content tracking-tight mb-1">
              Bon retour 👋
            </h2>
            <p className="text-sm text-base-content/40">
              Connectez-vous à votre espace de gestion
            </p>
          </div>

          {/* Erreur */}
          {error && (
            <div className="alert alert-error mb-5 py-3 text-sm rounded-2xl">
              <span>⚠️ {error}</span>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Login */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-xs font-bold uppercase tracking-widest text-base-content/40">Login</span>
              </label>
              <div className="relative">
                <User size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focused === 'login' ? 'text-primary' : 'text-base-content/30'}`} />
                <input
                  type="text"
                  className={`input input-bordered w-full pl-10 transition-all duration-200 ${focused === 'login' ? 'border-primary' : ''}`}
                  placeholder="Votre identifiant"
                  value={form.login}
                  onChange={e => setForm({ ...form, login: e.target.value })}
                  onFocus={() => setFocused('login')}
                  onBlur={() => setFocused('')}
                  required
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-xs font-bold uppercase tracking-widest text-base-content/40">Mot de passe</span>
              </label>
              <div className="relative">
                <Lock size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focused === 'pwd' ? 'text-primary' : 'text-base-content/30'}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`input input-bordered w-full pl-10 pr-10 transition-all duration-200 ${focused === 'pwd' ? 'border-primary' : ''}`}
                  placeholder="Votre mot de passe"
                  value={form.motDePasse}
                  onChange={e => setForm({ ...form, motDePasse: e.target.value })}
                  onFocus={() => setFocused('pwd')}
                  onBlur={() => setFocused('')}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-base-content/30 hover:text-primary transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Mot de passe oublié */}
            <div className="flex justify-end -mt-1">
              <button type="button" className="text-primary text-xs font-semibold hover:underline"
                onClick={() => navigate('/forgot-password')}>
                Mot de passe oublié ?
              </button>
            </div>

            {/* Bouton */}
            <button type="submit" disabled={loading}
              className="btn btn-primary w-full gap-2 h-12 text-base font-bold mt-2 shadow-lg">
              {loading
                ? <span className="loading loading-spinner loading-sm" />
                : <> Se connecter <ArrowRight size={16} /> </>
              }
            </button>

          </form>

          {/* Footer */}
          <p className="text-center text-xs text-base-content/30 mt-8">
            {appConfig.appName} © {new Date().getFullYear()}
          </p>

        </div>
      </div>
    </div>
  )
}