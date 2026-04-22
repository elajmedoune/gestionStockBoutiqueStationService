import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, User, Fuel, ArrowRight } from 'lucide-react'
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
    } catch {
      setError('Identifiants incorrects. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── PANNEAU GAUCHE (déco) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary via-secondary to-accent flex-col items-center justify-center p-12">

        {/* Cercles décoratifs */}
        <div style={{
          position: 'absolute', top: '-80px', left: '-80px',
          width: 300, height: 300, borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)'
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', right: '-60px',
          width: 250, height: 250, borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)'
        }} />
        <div style={{
          position: 'absolute', top: '40%', right: '-30px',
          width: 150, height: 150, borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)'
        }} />

        {/* Grille de points */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.15,
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '28px 28px'
        }} />

        {/* Contenu central */}
        <div style={{ position: 'relative', textAlign: 'center', color: '#0f4c4c' }}>
          {/* Logo */}
          <div style={{
            width: 80, height: 80, borderRadius: 24,
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
          }}>
            {appConfig.company.logo
              ? <img src={appConfig.company.logo} alt={appConfig.company.name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 20 }} />
              : <Fuel size={36} color="#0f4c4c" />
            }
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.5px' }}>
            {appConfig.company.name}
          </h1>
          <p style={{ fontSize: 14, opacity: 0.75, marginBottom: 40 }}>
            {appConfig.company.slogan} — {appConfig.company.address}
          </p>

          {/* Stats déco */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            {[
              { label: 'Produits', value: stats.produits },
              { label: 'Caissiers', value: stats.caissiers },
              { label: 'Fiable', value: '100%' },
            ].map(s => (
              <div key={s.label} style={{
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 14, padding: '12px 18px', textAlign: 'center'
              }}>
                <p style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{s.value}</p>
                <p style={{ fontSize: 11, opacity: 0.7, margin: 0, marginTop: 2 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PANNEAU DROIT (formulaire) ── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-base-100">
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Header mobile */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow mb-3">
              {appConfig.company.logo
                ? <img src={appConfig.company.logo} alt="" className="w-full h-full object-contain rounded-2xl" />
                : <Fuel size={24} className="text-primary-content" />
              }
            </div>
            <h1 className="text-xl font-extrabold text-base-content">{appConfig.appName}</h1>
          </div>

          {/* Titre */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--bc)', margin: 0, letterSpacing: '-0.5px' }}>
              Bon retour 👋
            </h2>
            <p style={{ fontSize: 14, color: 'var(--bc)', opacity: 0.45, marginTop: 6 }}>
              Connectez-vous à votre espace de gestion
            </p>
          </div>

          {/* Erreur */}
          {error && (
            <div className="alert alert-error mb-5 py-3 text-sm">
              <span>⚠️ {error}</span>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Login */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--bc)', opacity: 0.5, display: 'block', marginBottom: 8 }}>
                Login
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  color: focused === 'login' ? 'var(--p)' : 'var(--bc)',
                  opacity: focused === 'login' ? 1 : 0.3,
                  transition: 'all 0.2s'
                }}>
                  <User size={16} />
                </div>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  style={{
                    paddingLeft: 42,
                    borderColor: focused === 'login' ? 'var(--p)' : undefined,
                    boxShadow: focused === 'login' ? '0 0 0 3px rgba(var(--p), 0.1)' : undefined,
                    transition: 'all 0.2s'
                  }}
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
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--bc)', opacity: 0.5, display: 'block', marginBottom: 8 }}>
                Mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  color: focused === 'pwd' ? 'var(--p)' : 'var(--bc)',
                  opacity: focused === 'pwd' ? 1 : 0.3,
                  transition: 'all 0.2s'
                }}>
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input input-bordered w-full"
                  style={{
                    paddingLeft: 42, paddingRight: 44,
                    borderColor: focused === 'pwd' ? 'var(--p)' : undefined,
                    boxShadow: focused === 'pwd' ? '0 0 0 3px rgba(var(--p), 0.1)' : undefined,
                    transition: 'all 0.2s'
                  }}
                  placeholder="Votre mot de passe"
                  value={form.motDePasse}
                  onChange={e => setForm({ ...form, motDePasse: e.target.value })}
                  onFocus={() => setFocused('pwd')}
                  onBlur={() => setFocused('')}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--bc)', opacity: 0.4
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Mot de passe oublié */}
            <div style={{ textAlign: 'right', marginTop: -8 }}>
              <button
                type="button"
                className="text-primary text-xs font-semibold hover:underline"
                onClick={() => navigate('/forgot-password')}
              >
                Mot de passe oublié ?
              </button>
            </div>

            {/* Bouton */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full gap-2"
              style={{ marginTop: 8, height: 48, fontSize: 15, fontWeight: 700 }}
            >
              {loading
                ? <span className="loading loading-spinner loading-sm" />
                : <>Se connecter <ArrowRight size={16} /></>
              }
            </button>

          </form>

          {/* Footer */}
          <p style={{ textAlign: 'center', fontSize: 11, opacity: 0.3, marginTop: 32 }}>
            {appConfig.appName} © {new Date().getFullYear()}
          </p>

        </div>
      </div>
    </div>
  )
}à