import { useState, useRef } from 'react'
import { Camera, User, Save, Eye, EyeOff, Lock, Mail, Shield } from 'lucide-react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function MonProfil() {
  const { user, setUser } = useAuth()
  const fileRef = useRef(null)

  const [preview, setPreview] = useState(
    user?.photo ? `http://localhost:8000/storage/${user.photo.replace(/\\/g, '/')}` : null
  )
  const [photoFile, setPhotoFile] = useState(null)
  const [loadingPhoto, setLoadingPhoto] = useState(false)

  const [form, setForm] = useState({
    nom: user?.nom ?? '',
    prenom: user?.prenom ?? '',
    email: user?.email ?? '',
  })

  const [passwords, setPasswords] = useState({ ancien: '', nouveau: '', confirmation: '' })
  const [showPwd, setShowPwd] = useState({ ancien: false, nouveau: false, confirmation: false })

  const [successPhoto, setSuccessPhoto] = useState(null)
  const [errorPhoto,   setErrorPhoto]   = useState(null)
  const [successInfo,  setSuccessInfo]  = useState(null)
  const [errorInfo,    setErrorInfo]    = useState(null)
  const [successPwd,   setSuccessPwd]   = useState(null)
  const [errorPwd,     setErrorPwd]     = useState(null)
  const [loadingInfo,  setLoadingInfo]  = useState(false)
  const [loadingPwd,   setLoadingPwd]   = useState(false)

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setPhotoFile(file)
    setPreview(URL.createObjectURL(file))
  }

  async function handleUploadPhoto() {
    if (!photoFile) return
    setLoadingPhoto(true); setErrorPhoto(null); setSuccessPhoto(null)
    try {
      const formData = new FormData()
      formData.append('photo', photoFile)
      const res = await api.post('/profil/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const updatedUser = { ...user, photo: res.data.photo }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
      setSuccessPhoto('Photo mise à jour !')
      setPhotoFile(null)
    } catch {
      setErrorPhoto("Erreur lors de l'upload.")
    } finally {
      setLoadingPhoto(false)
    }
  }

  async function handleSaveInfo(e) {
    e.preventDefault()
    setLoadingInfo(true); setErrorInfo(null); setSuccessInfo(null)
    try {
      await api.put('/profil', form)
      const updatedUser = { ...user, ...form }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
      setSuccessInfo('Informations mises à jour !')
    } catch {
      setErrorInfo('Erreur lors de la mise à jour.')
    } finally {
      setLoadingInfo(false)
    }
  }

  async function handleSavePwd(e) {
    e.preventDefault()
    setLoadingPwd(true); setErrorPwd(null); setSuccessPwd(null)
    if (passwords.nouveau !== passwords.confirmation) {
      setErrorPwd('Les mots de passe ne correspondent pas.')
      setLoadingPwd(false); return
    }
    try {
      await api.put('/profil/password', {
        ancien_mot_de_passe: passwords.ancien,
        nouveau_mot_de_passe: passwords.nouveau,
      })
      setSuccessPwd('Mot de passe modifié !')
      setPasswords({ ancien: '', nouveau: '', confirmation: '' })
    } catch {
      setErrorPwd('Ancien mot de passe incorrect.')
    } finally {
      setLoadingPwd(false)
    }
  }

  const pwdStrength = (pwd) => {
    if (!pwd) return 0
    let score = 0
    if (pwd.length >= 8) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    return score
  }

  const strength = pwdStrength(passwords.nouveau)
  const strengthColors = ['bg-error', 'bg-warning', 'bg-warning', 'bg-success', 'bg-success']
  const strengthLabels = ['', 'Faible', 'Moyen', 'Bien', 'Fort']

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-base-content flex items-center gap-2">
            <div className="p-2 bg-primary/15 rounded-2xl">
              <User size={18} className="text-primary" />
            </div>
            Mon Profil
          </h1>
          <p className="text-xs text-base-content/40 mt-0.5 ml-1">Gérez vos informations personnelles</p>
        </div>

        {/* Photo */}
        <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
          <div className="bg-primary text-primary-content px-5 py-3 flex items-center gap-2 relative overflow-hidden">
            {/* 🧁 bulles pastel décoratives */}
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-secondary/30 blur-xl pointer-events-none" />
            <div className="p-1.5 bg-white/25 rounded-2xl relative z-10"><Camera size={14} /></div>
            <h3 className="font-extrabold text-sm relative z-10">Photo de profil</h3>
          </div>
          <div className="card-body items-center gap-4 py-6">
            <div className="relative group">
              <div className="w-28 h-28 rounded-2xl overflow-hidden bg-primary text-primary-content flex items-center justify-center shadow-lg border-4 border-base-200">
                {preview
                  ? <img src={preview} alt="avatar" className="w-full h-full object-cover" />
                  : <User size={40} />
                }
              </div>
              <button
                onClick={() => fileRef.current.click()}
                className="absolute -bottom-2 -right-2 btn btn-circle btn-sm btn-secondary shadow-lg"
              >
                <Camera size={14} />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>

            <div className="text-center">
              <p className="font-bold text-base-content">{user?.prenom} {user?.nom}</p>
              <span className="badge badge-primary badge-sm capitalize mt-1">{user?.role}</span>
            </div>

            {successPhoto && <div className="alert alert-success text-sm py-2 rounded-2xl w-full">{successPhoto}</div>}
            {errorPhoto   && <div className="alert alert-error   text-sm py-2 rounded-2xl w-full">{errorPhoto}</div>}

            {photoFile && (
              <button className="btn btn-primary btn-sm gap-2" onClick={handleUploadPhoto} disabled={loadingPhoto}>
                {loadingPhoto ? <span className="loading loading-spinner loading-xs" /> : <Save size={14} />}
                Enregistrer la photo
              </button>
            )}

            {!photoFile && (
              <p className="text-xs text-base-content/40">Cliquez sur l'icône pour changer votre photo</p>
            )}
          </div>
        </div>

        {/* Informations */}
        <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
          <div className="bg-primary text-primary-content px-5 py-3 flex items-center gap-2 relative overflow-hidden">
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-accent/25 blur-xl pointer-events-none" />
            <div className="p-1.5 bg-white/25 rounded-2xl relative z-10"><Mail size={14} /></div>
            <h3 className="font-extrabold text-sm relative z-10">Informations personnelles</h3>
          </div>
          <div className="card-body pt-5">
            {successInfo && <div className="alert alert-success text-sm py-2 rounded-2xl mb-3">{successInfo}</div>}
            {errorInfo   && <div className="alert alert-error   text-sm py-2 rounded-2xl mb-3">{errorInfo}</div>}

            <form onSubmit={handleSaveInfo} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-xs font-semibold text-base-content/60 uppercase tracking-wider">Nom</span>
                  </label>
                  <input
                    className="input input-bordered"
                    value={form.nom}
                    onChange={e => setForm({ ...form, nom: e.target.value })}
                  />
                </div>
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-xs font-semibold text-base-content/60 uppercase tracking-wider">Prénom</span>
                  </label>
                  <input
                    className="input input-bordered"
                    value={form.prenom}
                    onChange={e => setForm({ ...form, prenom: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/60 uppercase tracking-wider">Email</span>
                </label>
                <input
                  type="email"
                  className="input input-bordered"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/60 uppercase tracking-wider">Rôle</span>
                </label>
                <div className="input input-bordered bg-base-200 flex items-center gap-2">
                  <Shield size={14} className="text-primary" />
                  <span className="capitalize text-base-content/70 font-medium">{user?.role}</span>
                  <span className="ml-auto badge badge-secondary badge-xs">Non modifiable</span>
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <button type="submit" className="btn btn-primary btn-sm gap-2" disabled={loadingInfo}>
                  {loadingInfo ? <span className="loading loading-spinner loading-xs" /> : <Save size={14} />}
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Mot de passe */}
        <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
          <div className="bg-primary text-primary-content px-5 py-3 flex items-center gap-2 relative overflow-hidden">
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-info/30 blur-xl pointer-events-none" />
            <div className="p-1.5 bg-white/25 rounded-2xl relative z-10"><Lock size={14} /></div>
            <h3 className="font-extrabold text-sm relative z-10">Changer le mot de passe</h3>
          </div>
          <div className="card-body pt-5">
            {successPwd && <div className="alert alert-success text-sm py-2 rounded-2xl mb-3">{successPwd}</div>}
            {errorPwd   && <div className="alert alert-error   text-sm py-2 rounded-2xl mb-3">{errorPwd}</div>}

            <form onSubmit={handleSavePwd} className="space-y-4">
              {/* Ancien MDP */}
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/60 uppercase tracking-wider">Ancien mot de passe</span>
                </label>
                <div className="relative">
                  <input
                    type={showPwd.ancien ? 'text' : 'password'}
                    className="input input-bordered w-full pr-10"
                    value={passwords.ancien}
                    onChange={e => setPasswords({ ...passwords, ancien: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd({ ...showPwd, ancien: !showPwd.ancien })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-primary transition-colors"
                  >
                    {showPwd.ancien ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Nouveau MDP */}
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/60 uppercase tracking-wider">Nouveau mot de passe</span>
                </label>
                <div className="relative">
                  <input
                    type={showPwd.nouveau ? 'text' : 'password'}
                    className="input input-bordered w-full pr-10"
                    value={passwords.nouveau}
                    onChange={e => setPasswords({ ...passwords, nouveau: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd({ ...showPwd, nouveau: !showPwd.nouveau })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-primary transition-colors"
                  >
                    {showPwd.nouveau ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwords.nouveau && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColors[strength] : 'bg-base-200'}`} />
                      ))}
                    </div>
                    <p className={`text-xs font-bold ${strengthColors[strength].replace('bg-', 'text-')}`}>
                      {strengthLabels[strength]}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirmation */}
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/60 uppercase tracking-wider">Confirmer le mot de passe</span>
                </label>
                <div className="relative">
                  <input
                    type={showPwd.confirmation ? 'text' : 'password'}
                    className={`input input-bordered w-full pr-10 ${
                      passwords.confirmation && passwords.confirmation !== passwords.nouveau
                        ? 'input-error'
                        : passwords.confirmation && passwords.confirmation === passwords.nouveau
                        ? 'input-success'
                        : ''
                    }`}
                    value={passwords.confirmation}
                    onChange={e => setPasswords({ ...passwords, confirmation: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd({ ...showPwd, confirmation: !showPwd.confirmation })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-primary transition-colors"
                  >
                    {showPwd.confirmation ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwords.confirmation && passwords.confirmation !== passwords.nouveau && (
                  <p className="text-xs text-error mt-1">Les mots de passe ne correspondent pas</p>
                )}
              </div>

              <div className="flex justify-end pt-1">
                <button type="submit" className="btn btn-primary btn-sm gap-2" disabled={loadingPwd}>
                  {loadingPwd ? <span className="loading loading-spinner loading-xs" /> : <Lock size={14} />}
                  Modifier le mot de passe
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </Layout>
  )
}