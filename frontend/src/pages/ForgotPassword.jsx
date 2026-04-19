import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail } from 'lucide-react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // TODO: appel API reset password
      // await forgotPassword({ email })
      setSuccess(true)
    } catch (err) {
      setError('Email introuvable. Vérifiez votre adresse.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">

          {/* Logo + Titre */}
          <div className="flex flex-col items-center mb-6">
            <div className="text-6xl mb-2">⛽</div>
            <h1 className="text-2xl font-bold text-base-content">Mot de passe oublié</h1>
            <p className="text-base-content/60 mt-1 text-center text-sm">
              Entrez votre email pour recevoir un lien de réinitialisation
            </p>
          </div>

          {/* Succès */}
          {success && (
            <div className="alert alert-success mb-4">
              <span>Un email de réinitialisation a été envoyé !</span>
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div className="alert alert-error mb-4">
              <span>⚠️ {error}</span>
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit}>

              <div className="form-control mb-6">
                <label className="label">
                  <span className="label-text font-medium">Adresse email</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    className="input input-bordered w-full pl-10"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
                  />
                </div>
              </div>

              <button
                type="submit"
                className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? 'Envoi...' : 'Envoyer le lien'}
              </button>

            </form>
          )}

          {/* Retour login */}
          <button
            type="button"
            className="btn btn-ghost w-full mt-3 gap-2"
            onClick={() => navigate('/login')}
          >
            <ArrowLeft size={18} />
            Retour à la connexion
          </button>

        </div>
      </div>
    </div>
  )
}