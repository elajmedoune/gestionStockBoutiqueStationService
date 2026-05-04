import { useState, useRef } from 'react'
import { Camera, User, Save, Eye, EyeOff } from 'lucide-react'
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

  const [passwords, setPasswords] = useState({
    ancien: '', nouveau: '', confirmation: ''
  })
  const [showPwd, setShowPwd] = useState(false)

  const [successPhoto, setSuccessPhoto] = useState(null)
  const [errorPhoto, setErrorPhoto] = useState(null)
  const [successInfo, setSuccessInfo] = useState(null)
  const [errorInfo, setErrorInfo] = useState(null)
  const [successPwd, setSuccessPwd] = useState(null)
  const [errorPwd, setErrorPwd] = useState(null)

  /* ── Photo ── */
  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setPhotoFile(file)
    setPreview(URL.createObjectURL(file))
  }

  async function handleUploadPhoto() {
    if (!photoFile) return
    setLoadingPhoto(true)
    setErrorPhoto(null)
    setSuccessPhoto(null)
    try {
      const formData = new FormData()
      formData.append('photo', photoFile)
      const res = await api.post('/profil/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      // Mettre à jour le user dans le localStorage
      const updatedUser = { ...user, photo: res.data.photo }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
      setSuccessPhoto('Photo mise à jour avec succès !')
    } catch {
      setErrorPhoto('Erreur lors de l\'upload.')
    } finally {
      setLoadingPhoto(false)
    }
  }

  /* ── Infos ── */
  async function handleSaveInfo(e) {
    e.preventDefault()
    setErrorInfo(null)
    setSuccessInfo(null)
    try {
      await api.put('/profil', form)
      const updatedUser = { ...user, ...form }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setSuccessInfo('Informations mises à jour !')
    } catch {
      setErrorInfo('Erreur lors de la mise à jour.')
    }
  }

  /* ── Mot de passe ── */
  async function handleSavePwd(e) {
    e.preventDefault()
    setErrorPwd(null)
    setSuccessPwd(null)
    if (passwords.nouveau !== passwords.confirmation) {
      setErrorPwd('Les mots de passe ne correspondent pas.')
      return
    }
    try {
      await api.put('/profil/password', {
        ancien_mot_de_passe: passwords.ancien,
        nouveau_mot_de_passe: passwords.nouveau,
      })
      setSuccessPwd('Mot de passe modifié avec succès !')
      setPasswords({ ancien: '', nouveau: '', confirmation: '' })
    } catch {
      setErrorPwd('Ancien mot de passe incorrect.')
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">

        <h2 className="text-2xl font-bold text-base-content">Mon Profil</h2>

        {/* ── Photo ── */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body items-center gap-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-primary text-primary-content flex items-center justify-center">
                {preview ? (
                  <img src={preview} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={36} />
                )}
              </div>
              <button
                onClick={() => fileRef.current.click()}
                className="absolute bottom-0 right-0 btn btn-circle btn-xs btn-primary"
              >
                <Camera size={12} />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <p className="text-sm text-base-content/50">
              Cliquez sur l'icône pour changer votre photo
            </p>

            {successPhoto && <div className="alert alert-success text-sm py-2">{successPhoto}</div>}
            {errorPhoto && <div className="alert alert-error text-sm py-2">{errorPhoto}</div>}

            {photoFile && (
              <button
                className="btn btn-primary btn-sm"
                onClick={handleUploadPhoto}
                disabled={loadingPhoto}
              >
                {loadingPhoto ? <span className="loading loading-spinner loading-xs" /> : <Save size={14} />}
                Enregistrer la photo
              </button>
            )}
          </div>
        </div>

        {/* ── Informations ── */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="font-semibold text-base-content mb-4">Informations personnelles</h3>

            {successInfo && <div className="alert alert-success text-sm py-2 mb-2">{successInfo}</div>}
            {errorInfo && <div className="alert alert-error text-sm py-2 mb-2">{errorInfo}</div>}

            <form onSubmit={handleSaveInfo} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">Nom</label>
                  <input
                    className="input input-bordered w-full"
                    value={form.nom}
                    onChange={e => setForm({ ...form, nom: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label text-xs">Prénom</label>
                  <input
                    className="input input-bordered w-full"
                    value={form.prenom}
                    onChange={e => setForm({ ...form, prenom: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="label text-xs">Email</label>
                <input
                  type="email"
                  className="input input-bordered w-full"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <label className="label text-xs">Rôle</label>
                <input
                  className="input input-bordered w-full bg-base-200"
                  value={user?.role ?? ''}
                  disabled
                />
              </div>
              <button type="submit" className="btn btn-primary btn-sm">
                <Save size={14} /> Enregistrer
              </button>
            </form>
          </div>
        </div>

        {/* ── Mot de passe ── */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="font-semibold text-base-content mb-4">Changer le mot de passe</h3>

            {successPwd && <div className="alert alert-success text-sm py-2 mb-2">{successPwd}</div>}
            {errorPwd && <div className="alert alert-error text-sm py-2 mb-2">{errorPwd}</div>}

            <form onSubmit={handleSavePwd} className="space-y-3">
              <div>
                <label className="label text-xs">Ancien mot de passe</label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    className="input input-bordered w-full pr-10"
                    value={passwords.ancien}
                    onChange={e => setPasswords({ ...passwords, ancien: e.target.value })}
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-3 text-base-content/40">
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="label text-xs">Nouveau mot de passe</label>
                <input
                  type="password"
                  className="input input-bordered w-full"
                  value={passwords.nouveau}
                  onChange={e => setPasswords({ ...passwords, nouveau: e.target.value })}
                />
              </div>
              <div>
                <label className="label text-xs">Confirmer le mot de passe</label>
                <input
                  type="password"
                  className="input input-bordered w-full"
                  value={passwords.confirmation}
                  onChange={e => setPasswords({ ...passwords, confirmation: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-sm">
                <Save size={14} /> Modifier le mot de passe
              </button>
            </form>
          </div>
        </div>

      </div>
    </Layout>
  )
}