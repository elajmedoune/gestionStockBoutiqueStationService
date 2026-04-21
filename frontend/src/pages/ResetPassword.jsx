import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Lock, Eye, EyeOff, ArrowRight, Fuel, Check } from 'lucide-react'
import appConfig from '../config/app'

export default function ResetPassword() {
  const [form, setForm] = useState({ password: '', confirmation: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [focused, setFocused] = useState('')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmation) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (form.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    setLoading(true)
    try {
      // TODO: appel API
      // await resetPassword({ token, password: form.password })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch {
      setError('Lien invalide ou expiré. Veuillez recommencer.')
    } finally {
      setLoading(false)
    }
  }

  const strength = (pwd) => {
    if (!pwd) return 0
    let s = 0
    if (pwd.length >= 8) s++
    if (/[A-Z]/.test(pwd)) s++
    if (/[0-9]/.test(pwd)) s++
    if (/[^A-Za-z0-9]/.test(pwd)) s++
    return s
  }

  const strengthLabel = ['', 'Faible', 'Moyen', 'Bon', 'Fort']
  const strengthColor = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981']
  const s = strength(form.password)

  return (
    <div className="min-h-screen flex">

      {/* ── PANNEAU GAUCHE ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary via-secondary to-accent flex-col items-center justify-center p-12">
        <div style={{ position: 'absolute', top: '-80px', left: '-80px', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: '-60px', right: '-60px', width: 250, height: 250, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div style={{ position: 'relative', textAlign: 'center', color: 'white' }}>
          <div style={{ width: 80, height: 80, borderRadius: 24, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            {appConfig.company.logo
              ? <img src={appConfig.company.logo} alt={appConfig.company.name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 20 }} />
              : <Fuel size={36} color="white" />
            }
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.5px' }}>{appConfig.company.name}</h1>
          <p style={{ fontSize: 14, opacity: 0.75, marginBottom: 16 }}>{appConfig.company.slogan}</p>
          <p style={{ fontSize: 13, opacity: 0.55, maxWidth: 280, margin: '0 auto', lineHeight: 1.6 }}>
            Choisissez un mot de passe fort et unique pour sécuriser votre compte.
          </p>

          {/* Tips */}
          <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
            {[
              '8 caractères minimum',
              'Une majuscule',
              'Un chiffre',
              'Un caractère spécial',
            ].map((tip, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 14px' }}>
                <Check size={13} color="white" opacity={0.7} />
                <span style={{ fontSize: 13, opacity: 0.8 }}>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PANNEAU DROIT ── */}
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
              Nouveau mot de passe 🔑
            </h2>
            <p style={{ fontSize: 14, color: 'var(--bc)', opacity: 0.45, marginTop: 6 }}>
              Choisissez un mot de passe sécurisé pour votre compte
            </p>
          </div>

          {/* Succès */}
          {success && (
            <div className="alert alert-success mb-6 text-sm flex flex-col items-start gap-1">
              <span className="font-bold">✅ Mot de passe modifié !</span>
              <span className="opacity-70">Redirection vers la connexion...</span>
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div className="alert alert-error mb-6 text-sm">
              <span>⚠️ {error}</span>
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Nouveau mot de passe */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--bc)', opacity: 0.5, display: 'block', marginBottom: 8 }}>
                  Nouveau mot de passe
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focused === 'pwd' ? 'var(--p)' : 'var(--bc)', opacity: focused === 'pwd' ? 1 : 0.3, transition: 'all 0.2s' }}>
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    className="input input-bordered w-full"
                    style={{ paddingLeft: 42, paddingRight: 44, borderColor: focused === 'pwd' ? 'var(--p)' : undefined, transition: 'all 0.2s' }}
                    placeholder="Nouveau mot de passe"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    onFocus={() => setFocused('pwd')}
                    onBlur={() => setFocused('')}
                    required
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--bc)', opacity: 0.4 }}>
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Indicateur de force */}
                {form.password && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i <= s ? strengthColor[s] : '#e5e7eb', transition: 'all 0.3s' }} />
                      ))}
                    </div>
                    <p style={{ fontSize: 11, color: strengthColor[s], fontWeight: 600, marginTop: 4 }}>
                      {strengthLabel[s]}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirmation */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--bc)', opacity: 0.5, display: 'block', marginBottom: 8 }}>
                  Confirmer le mot de passe
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focused === 'confirm' ? 'var(--p)' : 'var(--bc)', opacity: focused === 'confirm' ? 1 : 0.3, transition: 'all 0.2s' }}>
                    <Lock size={16} />
                  </div>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    className="input input-bordered w-full"
                    style={{
                      paddingLeft: 42, paddingRight: 44,
                      borderColor: form.confirmation && form.password !== form.confirmation ? '#ef4444' : focused === 'confirm' ? 'var(--p)' : undefined,
                      transition: 'all 0.2s'
                    }}
                    placeholder="Confirmez le mot de passe"
                    value={form.confirmation}
                    onChange={e => setForm({ ...form, confirmation: e.target.value })}
                    onFocus={() => setFocused('confirm')}
                    onBlur={() => setFocused('')}
                    required
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--bc)', opacity: 0.4 }}>
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {form.confirmation && form.password !== form.confirmation && (
                  <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>Les mots de passe ne correspondent pas</p>
                )}
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
                  : <>Réinitialiser <ArrowRight size={16} /></>
                }
              </button>

            </form>
          )}

          {/* Retour login */}
          <button
            type="button"
            className="btn btn-ghost w-full gap-2 mt-3"
            onClick={() => navigate('/login')}
          >
            <ArrowLeft size={16} /> Retour à la connexion
          </button>

          <p style={{ textAlign: 'center', fontSize: 11, opacity: 0.3, marginTop: 32 }}>
            {appConfig.appName} © {new Date().getFullYear()}
          </p>

        </div>
      </div>
    </div>
  )
}