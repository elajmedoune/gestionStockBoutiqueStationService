import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Lock, Eye, EyeOff, ArrowRight, Fuel, Check, AlertTriangle } from 'lucide-react'
import appConfig from '../config/app'
import api from '../services/api'

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
  const email = searchParams.get('email')

  // Garde : si pas de token ou pas d'email dans l'URL → lien invalide
  useEffect(() => {
    if (!token || !email) {
      setError('Lien invalide ou incomplet. Veuillez recommencer la procédure.')
    }
  }, [token, email])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!token || !email) {
      setError('Lien invalide. Veuillez recommencer la procédure.')
      return
    }
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
      await api.post('/reset-password', {
        token,
        email,
        password:              form.password,
        password_confirmation: form.confirmation,
      })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      if (err.response?.status === 422) {
        // Token expiré, invalide, ou validation backend
        const msg = err.response?.data?.message
        if (err.response?.data?.errors) {
          // Premières erreurs de validation
          const firstError = Object.values(err.response.data.errors)[0]?.[0]
          setError(firstError ?? msg ?? 'Données invalides.')
        } else {
          setError(msg ?? 'Token invalide ou expiré. Veuillez recommencer.')
        }
      } else if (err.response?.status === 429) {
        setError('Trop de tentatives. Patientez quelques minutes.')
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.')
      }
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

  const strengthLabel  = ['', 'Faible', 'Moyen', 'Bon', 'Fort']
  const strengthColors = ['', 'bg-error text-error', 'bg-warning text-warning', 'bg-info text-info', 'bg-success text-success']
  const strengthBg     = ['', 'bg-error', 'bg-warning', 'bg-info', 'bg-success']
  const s = strength(form.password)

  /* 🧁 chaque tip a sa propre teinte cupcake */
  const tips = [
    { txt: '8 caractères minimum',  bg: 'bg-primary/15',   border: 'border-primary/30',   dot: 'bg-primary/30',   icon: 'text-primary' },
    { txt: 'Une majuscule',         bg: 'bg-secondary/15', border: 'border-secondary/30', dot: 'bg-secondary/30', icon: 'text-secondary' },
    { txt: 'Un chiffre',            bg: 'bg-accent/15',    border: 'border-accent/30',    dot: 'bg-accent/30',    icon: 'text-accent' },
    { txt: 'Un caractère spécial',  bg: 'bg-info/15',      border: 'border-info/30',      dot: 'bg-info/30',      icon: 'text-info' },
  ]

  // Si pas de token/email → on désactive le formulaire
  const linkInvalid = !token || !email

  return (
    <div className="min-h-screen flex">

      {/* 🧁 Panneau gauche cupcake */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-neutral flex-col items-center justify-center p-12">

        {/* Bulles pastel cupcake */}
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-primary/30 -translate-x-1/2 -translate-y-1/2 pointer-events-none blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-secondary/30 translate-x-1/3 translate-y-1/3 pointer-events-none blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-40 h-40 rounded-full bg-accent/25 pointer-events-none blur-2xl" />
        <div className="absolute bottom-1/3 left-1/4 w-32 h-32 rounded-full bg-info/20 pointer-events-none blur-2xl" />

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

          <p className="text-xs opacity-60 mb-6 uppercase tracking-widest font-bold">Choisissez un mot de passe fort :</p>
          <div className="space-y-2 text-left">
            {tips.map((tip, i) => (
              <div key={i} className={`flex items-center gap-3 ${tip.bg} ${tip.border} border rounded-2xl px-4 py-2.5 backdrop-blur-sm`}>
                <div className={`w-5 h-5 ${tip.dot} rounded-xl flex items-center justify-center shrink-0`}>
                  <Check size={11} className={tip.icon} />
                </div>
                <span className="text-xs opacity-90 font-medium">{tip.txt}</span>
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
              Nouveau mot de passe 🔑
            </h2>
            <p className="text-sm text-base-content/40">
              {email
                ? <>Compte : <span className="font-semibold text-base-content/70">{email}</span></>
                : 'Choisissez un mot de passe sécurisé pour votre compte'}
            </p>
          </div>

          {/* Lien invalide */}
          {linkInvalid && !success && (
            <div className="card bg-error/10 border border-error/30 mb-6 rounded-2xl">
              <div className="card-body p-4 gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-error/20 rounded-2xl flex items-center justify-center shrink-0">
                    <AlertTriangle size={18} className="text-error" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-error">Lien invalide</p>
                    <p className="text-xs text-base-content/60">Le lien de réinitialisation est incomplet ou expiré.</p>
                  </div>
                </div>
                <button onClick={() => navigate('/forgot-password')}
                  className="btn btn-error btn-sm w-full mt-2">
                  Demander un nouveau lien
                </button>
              </div>
            </div>
          )}

          {/* Succès */}
          {success && (
            <div className="card bg-success/10 border border-success/30 mb-6 rounded-2xl">
              <div className="card-body p-4 gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-success/20 rounded-2xl flex items-center justify-center shrink-0">
                    <Check size={16} className="text-success" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-success">Mot de passe modifié !</p>
                    <p className="text-xs text-base-content/50">Redirection vers la connexion...</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Erreur */}
          {error && !linkInvalid && (
            <div className="alert alert-error mb-5 py-3 text-sm rounded-2xl">
              <span>⚠️ {error}</span>
            </div>
          )}

          {!success && !linkInvalid && (
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Nouveau MDP */}
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-bold uppercase tracking-widest text-base-content/40">Nouveau mot de passe</span>
                </label>
                <div className="relative">
                  <Lock size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focused === 'pwd' ? 'text-primary' : 'text-base-content/30'}`} />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    className={`input input-bordered w-full pl-10 pr-10 transition-all duration-200 ${focused === 'pwd' ? 'border-primary' : ''}`}
                    placeholder="Nouveau mot de passe"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    onFocus={() => setFocused('pwd')}
                    onBlur={() => setFocused('')}
                    required
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-base-content/30 hover:text-primary transition-colors">
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Indicateur force */}
                {form.password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= s ? strengthBg[s] : 'bg-base-200'}`} />
                      ))}
                    </div>
                    <p className={`text-xs font-bold ${strengthColors[s].split(' ')[1]}`}>
                      {strengthLabel[s]}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirmation */}
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-bold uppercase tracking-widest text-base-content/40">Confirmer le mot de passe</span>
                </label>
                <div className="relative">
                  <Lock size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focused === 'confirm' ? 'text-primary' : 'text-base-content/30'}`} />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    className={`input input-bordered w-full pl-10 pr-10 transition-all duration-200 ${
                      form.confirmation && form.password !== form.confirmation ? 'input-error' :
                      form.confirmation && form.password === form.confirmation ? 'input-success' :
                      focused === 'confirm' ? 'border-primary' : ''
                    }`}
                    placeholder="Confirmez le mot de passe"
                    value={form.confirmation}
                    onChange={e => setForm({ ...form, confirmation: e.target.value })}
                    onFocus={() => setFocused('confirm')}
                    onBlur={() => setFocused('')}
                    required
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-base-content/30 hover:text-primary transition-colors">
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {form.confirmation && form.password !== form.confirmation && (
                  <p className="text-xs text-error mt-1">Les mots de passe ne correspondent pas</p>
                )}
                {form.confirmation && form.password === form.confirmation && (
                  <p className="text-xs text-success mt-1 flex items-center gap-1">
                    <Check size={11} /> Les mots de passe correspondent
                  </p>
                )}
              </div>

              <button type="submit" disabled={loading}
                className="btn btn-primary w-full gap-2 h-12 text-base font-bold mt-2 shadow-lg">
                {loading
                  ? <span className="loading loading-spinner loading-sm" />
                  : <> Réinitialiser <ArrowRight size={16} /> </>
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