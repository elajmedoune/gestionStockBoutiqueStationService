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
  const strengthColors = ['', 'bg-error text-error', 'bg-warning text-warning', 'bg-info text-info', 'bg-success text-success']
  const strengthBg = ['', 'bg-error', 'bg-warning', 'bg-info', 'bg-success']
  const s = strength(form.password)

  const tips = [
    '8 caractères minimum',
    'Une majuscule',
    'Un chiffre',
    'Un caractère spécial',
  ]

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

          <p className="text-xs opacity-40 mb-6">Choisissez un mot de passe fort :</p>
          <div className="space-y-2 text-left">
            {tips.map((tip, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/10 border border-white/10 rounded-xl px-4 py-2.5">
                <div className="w-5 h-5 bg-white/15 rounded-lg flex items-center justify-center shrink-0">
                  <Check size={11} className="text-neutral-content" />
                </div>
                <span className="text-xs opacity-70">{tip}</span>
              </div>
            ))}
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
              Nouveau mot de passe 🔑
            </h2>
            <p className="text-sm text-base-content/40">
              Choisissez un mot de passe sécurisé pour votre compte
            </p>
          </div>

          {/* Succès */}
          {success && (
            <div className="card bg-success/10 border border-success/30 mb-6">
              <div className="card-body p-4 gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-success/20 rounded-xl flex items-center justify-center shrink-0">
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
          {error && (
            <div className="alert alert-error mb-5 py-3 text-sm rounded-xl">
              <span>⚠️ {error}</span>
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Nouveau MDP */}
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-bold uppercase tracking-widest text-base-content/40">Nouveau mot de passe</span>
                </label>
                <div className="relative">
                  <Lock size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focused === 'pwd' ? 'text-neutral' : 'text-base-content/30'}`} />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    className={`input input-bordered w-full pl-10 pr-10 rounded-xl transition-all duration-200 ${focused === 'pwd' ? 'border-neutral' : ''}`}
                    placeholder="Nouveau mot de passe"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    onFocus={() => setFocused('pwd')}
                    onBlur={() => setFocused('')}
                    required
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-base-content/30 hover:text-base-content transition-colors">
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
                  <Lock size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focused === 'confirm' ? 'text-neutral' : 'text-base-content/30'}`} />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    className={`input input-bordered w-full pl-10 pr-10 rounded-xl transition-all duration-200 ${
                      form.confirmation && form.password !== form.confirmation ? 'input-error' :
                      form.confirmation && form.password === form.confirmation ? 'input-success' :
                      focused === 'confirm' ? 'border-neutral' : ''
                    }`}
                    placeholder="Confirmez le mot de passe"
                    value={form.confirmation}
                    onChange={e => setForm({ ...form, confirmation: e.target.value })}
                    onFocus={() => setFocused('confirm')}
                    onBlur={() => setFocused('')}
                    required
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-base-content/30 hover:text-base-content transition-colors">
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
                className="btn btn-neutral w-full gap-2 rounded-xl h-12 text-base font-bold mt-2">
                {loading
                  ? <span className="loading loading-spinner loading-sm" />
                  : <> Réinitialiser <ArrowRight size={16} /> </>
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