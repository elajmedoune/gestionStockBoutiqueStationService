import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, ArrowRight, Fuel, KeyRound } from 'lucide-react'
import appConfig from '../config/app'
import api from '../services/api'

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
      await api.post('/forgot-password', { email })
      setSuccess(true)
    } catch (err) {
      if (err.response?.status === 429) {
        setError('Trop de tentatives. Patientez quelques minutes avant de réessayer.')
      } else if (err.response?.status === 422) {
        setError(err.response?.data?.message ?? 'Adresse email introuvable.')
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.')
      }
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
        <div className="absolute top-1/3 right-1/4 w-40 h-40 rounded-full bg-accent/25 pointer-events-none blur-2xl" />

        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '28px 28px'
        }} />

        <div className="relative text-center text-neutral-content z-10">
          <div className="w-20 h-20 rounded-2xl bg-primary/30 border border-primary/40 flex items-center justify-center mx-auto mb-6 shadow-2xl backdrop-blur-sm">
            {appConfig.company.logo
              ? <img src={appConfig.company.logo} alt={appConfig.company.name} className="w-full h-full object-contain rounded-2xl" />
              : <Fuel size={36} className="text-neutral-content" />
            }
          </div>
          <h1 className="text-3xl font-extrabold mb-2 tracking-tight">{appConfig.company.name}</h1>
          <p className="text-sm opacity-60 mb-10">{appConfig.company.slogan}</p>

          <div className="bg-secondary/15 border border-secondary/30 rounded-2xl p-6 text-left max-w-xs mx-auto backdrop-blur-sm">
            <div className="w-10 h-10 bg-secondary/30 rounded-2xl flex items-center justify-center mb-4">
              <KeyRound size={20} className="text-neutral-content" />
            </div>
            <h3 className="font-bold text-sm mb-2">Réinitialisation sécurisée</h3>
            <p className="text-xs opacity-70 leading-relaxed">
              Pas de panique ! Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe en toute sécurité.
            </p>
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
              Mot de passe oublié 🔐
            </h2>
            <p className="text-sm text-base-content/40">
              Entrez votre email pour recevoir un lien de réinitialisation
            </p>
          </div>

          {/* Succès */}
          {success && (
            <div className="card bg-success/10 border border-success/30 mb-6 rounded-2xl">
              <div className="card-body p-4 gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-success/20 rounded-2xl flex items-center justify-center shrink-0">
                    <span className="text-success text-base">✅</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-success">Email envoyé !</p>
                    <p className="text-xs text-base-content/60">
                      Un lien de réinitialisation a été envoyé à <span className="font-semibold">{email}</span>.
                      Vérifiez votre boîte mail (et le dossier spam).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div className="alert alert-error mb-5 py-3 text-sm rounded-2xl">
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
                  <Mail size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focused ? 'text-primary' : 'text-base-content/30'}`} />
                  <input
                    type="email"
                    className={`input input-bordered w-full pl-10 transition-all duration-200 ${focused ? 'border-primary' : ''}`}
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
                className="btn btn-primary w-full gap-2 h-12 text-base font-bold mt-2 shadow-lg">
                {loading
                  ? <span className="loading loading-spinner loading-sm" />
                  : <> Envoyer le lien <ArrowRight size={16} /> </>
                }
              </button>

            </form>
          )}

          <button type="button" className="btn btn-ghost w-full gap-2 mt-3"
            onClick={() => navigate('/login')}>
            <ArrowLeft size={16} /> Retour à la connexion
          </button>

          <p className="text-center text-xs text-base-content/30 mt-8">
            {appConfig.appName} © {new Date().getFullYear()}
          </p>

        </div>
      </div>
    </div>
  )
}