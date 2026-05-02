import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, ArrowRight, Fuel, KeyRound } from 'lucide-react'
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
      setSuccess(true)
    } catch {
      setError('Email introuvable. Vérifiez votre adresse.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* Panneau gauche */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-neutral flex-col items-center justify-center p-12">

        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-white/5 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-white/5 translate-x-1/3 translate-y-1/3 pointer-events-none" />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '28px 28px'
        }} />

        <div className="relative text-center text-neutral-content z-10">
          <div className="w-20 h-20 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center mx-auto mb-6 shadow-2xl">
            {appConfig.company.logo
              ? <img src={appConfig.company.logo} alt={appConfig.company.name} className="w-full h-full object-contain rounded-2xl" />
              : <Fuel size={36} className="text-neutral-content" />
            }
          </div>
          <h1 className="text-3xl font-extrabold mb-2 tracking-tight">{appConfig.company.name}</h1>
          <p className="text-sm opacity-50 mb-10">{appConfig.company.slogan}</p>

          <div className="bg-white/10 border border-white/15 rounded-2xl p-6 text-left max-w-xs mx-auto">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center mb-4">
              <KeyRound size={20} className="text-neutral-content" />
            </div>
            <h3 className="font-bold text-sm mb-2">Réinitialisation sécurisée</h3>
            <p className="text-xs opacity-50 leading-relaxed">
              Pas de panique ! Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe en toute sécurité.
            </p>
          </div>
        </div>
      </div>

      {/* Panneau droit */}
      <div className="flex-1 flex items-center justify-center p-8 bg-base-100">
        <div className="w-full max-w-sm">

          {/* Header mobile */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-neutral rounded-2xl flex items-center justify-center shadow-lg mb-3">
              {appConfig.company.logo
                ? <img src={appConfig.company.logo} alt="" className="w-full h-full object-contain rounded-2xl" />
                : <Fuel size={24} className="text-neutral-content" />
              }
            </div>
            <h1 className="text-xl font-extrabold text-base-content">{appConfig.appName}</h1>
          </div>

          {/* Titre */}
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-base-content tracking-tight mb-1">
              Mot de passe oublié 🔐
            </h2>
            <p className="text-sm text-base-content/40">
              Entrez votre email pour recevoir un lien de réinitialisation
            </p>
          </div>

          {/* Succès */}
          {success && (
            <div className="card bg-success/10 border border-success/30 mb-6">
              <div className="card-body p-4 gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-success/20 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-success text-base">✅</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-success">Email envoyé !</p>
                    <p className="text-xs text-base-content/50">Vérifiez votre boîte mail.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div className="alert alert-error mb-5 py-3 text-sm rounded-xl">
              <span>⚠️ {error}</span>
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-bold uppercase tracking-widest text-base-content/40">Adresse email</span>
                </label>
                <div className="relative">
                  <Mail size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focused ? 'text-neutral' : 'text-base-content/30'}`} />
                  <input
                    type="email"
                    className={`input input-bordered w-full pl-10 rounded-xl transition-all duration-200 ${focused ? 'border-neutral' : ''}`}
                    placeholder="votre@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    required
                  />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="btn btn-neutral w-full gap-2 rounded-xl h-12 text-base font-bold mt-2">
                {loading
                  ? <span className="loading loading-spinner loading-sm" />
                  : <> Envoyer le lien <ArrowRight size={16} /> </>
                }
              </button>

            </form>
          )}

          <button type="button" className="btn btn-ghost w-full gap-2 mt-3 rounded-xl"
            onClick={() => navigate('/login')}>
            <ArrowLeft size={16} /> Retour à la connexion
          </button>

          <p className="text-center text-xs text-base-content/20 mt-8">
            {appConfig.appName} © {new Date().getFullYear()}
          </p>

        </div>
      </div>
    </div>
  )
}