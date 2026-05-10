import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, User, Fuel, ArrowRight, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import appConfig from '../config/app'

export default function Login() {
  const [form, setForm] = useState({ login: '', motDePasse: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [focused, setFocused] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

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
    <div className="min-h-screen flex items-center justify-center bg-base-200">

      {/* Bulles décoratives */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-primary/10 -translate-x-1/2 -translate-y-1/2 pointer-events-none blur-3xl" />
      <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-secondary/10 translate-x-1/3 translate-y-1/3 pointer-events-none blur-3xl" />

      <div className="w-full max-w-lg bg-base-100 rounded-3xl shadow-xl p-12 relative z-10">

        {/* Bouton retour */}
        <button
         onClick={() => navigate('/')}
         className="flex items-center gap-1 text-xs text-base-content/40 hover:text-primary transition-colors mb-6"
         >
         <ArrowLeft size={14} /> Accueil
        </button>
        
        {/* Logo + Titre */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg mb-4">
            {appConfig.company.logo
              ? <img src={appConfig.company.logo} alt={appConfig.company.name} className="w-full h-full object-contain rounded-2xl" />
              : <Fuel size={28} className="text-primary-content" />
            }
          </div>
          <h1 className="text-xl font-extrabold text-base-content">{appConfig.company.name}</h1>
          <p className="text-xs text-base-content/40 mt-1">Connectez-vous à votre espace</p>
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
        <p className="text-center text-xs text-base-content/30 mt-6">
          {appConfig.appName} © {new Date().getFullYear()}
        </p>

      </div>
    </div>
  )
}