import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [form, setForm] = useState({ login: '', motDePasse: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
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
      setError('Identifiants incorrects. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">

          {/* Logo + Nom de l'app */}
          <div className="flex flex-col items-center mb-6">
            <div className="text-6xl mb-2">⛽</div>
            <h1 className="text-3xl font-bold text-base-content">Gestion Stock</h1>
            <p className="text-base-content/60 mt-1">Boutique Station Service</p>
          </div>

          {/* Erreur */}
          {error && (
            <div className="alert alert-error mb-4">
              <span>⚠️ {error}</span>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit}>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text font-medium">Login</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Entrez votre login"
                value={form.login}
                onChange={(e) => setForm({ ...form, login: e.target.value })}
                required
              />
            </div>

            <div className="form-control mb-2">
              <label className="label">
                <span className="label-text font-medium">Mot de passe</span>
              </label>
              {/* Champ mot de passe avec œil */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input input-bordered w-full pr-12"
                  placeholder="Entrez votre mot de passe"
                  value={form.motDePasse}
                  onChange={(e) => setForm({ ...form, motDePasse: e.target.value })}
                  required
                />
                <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content"
                onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
              </div>
            </div>

            {/* Mot de passe oublié */}
            <div className="flex justify-end mb-6">
              <button
                type="button"
                className="text-sm text-primary hover:underline"
                onClick={() => navigate('/forgot-password')}
              >
                Mot de passe oublié ?
              </button>
            </div>

            {/* Bouton connexion */}
            <button
              type="submit"
              className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>

          </form>

        </div>
      </div>
    </div>
  )
}