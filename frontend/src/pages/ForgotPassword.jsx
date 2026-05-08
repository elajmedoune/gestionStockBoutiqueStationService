import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, ArrowRight, Fuel } from 'lucide-react'
import appConfig from '../config/app'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [focused, setFocused] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // TODO: appel API reset password
      // await forgotPassword({ email })
      setSuccess(true)
    } catch {
      setError('Email introuvable. Vérifiez votre adresse.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── PANNEAU GAUCHE (déco) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary via-secondary to-accent flex-col items-center justify-center p-12">
        <div style={{ position: 'absolute', top: '-80px', left: '-80px', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: '-60px', right: '-60px', width: 250, height: 250, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div style={{ position: 'relative', textAlign: 'center', color: '#0f4c4c' }}>
          <div style={{ width: 80, height: 80, borderRadius: 24, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            {appConfig.company.logo
              ? <img src={appConfig.company.logo} alt={appConfig.company.name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 20 }} />
              : <Fuel size={36} color="#0f4c4c" />
            }
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.5px' }}>{appConfig.company.name}</h1>
          <p style={{ fontSize: 14, opacity: 0.75, marginBottom: 16 }}>{appConfig.company.slogan}</p>
          <p style={{ fontSize: 13, opacity: 0.55, maxWidth: 280, margin: '0 auto', lineHeight: 1.6 }}>
            Pas de panique ! Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>
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
              Mot de passe oublié 🔐
            </h2>
            <p style={{ fontSize: 14, color: 'var(--bc)', opacity: 0.45, marginTop: 6 }}>
              Entrez votre email pour recevoir un lien de réinitialisation
            </p>
          </div>

          {/* Succès */}
          {success && (
            <div className="alert alert-success mb-6 text-sm">
              <span>✅ Un email de réinitialisation a été envoyé !</span>
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

              {/* Email */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--bc)', opacity: 0.5, display: 'block', marginBottom: 8 }}>
                  Adresse email
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focused ? 'var(--p)' : 'var(--bc)', opacity: focused ? 1 : 0.3, transition: 'all 0.2s' }}>
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    className="input input-bordered w-full"
                    style={{ paddingLeft: 42, borderColor: focused ? 'var(--p)' : undefined, transition: 'all 0.2s' }}
                    placeholder="votre@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    required
                  />
                </div>
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
                  : <>Envoyer le lien <ArrowRight size={16} /></>
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

          {/* Footer */}
          <p style={{ textAlign: 'center', fontSize: 11, opacity: 0.3, marginTop: 32 }}>
            {appConfig.appName} © {new Date().getFullYear()}
          </p>

        </div>
      </div>
    </div>
  )
}