// src/components/produits/ProduitForm.jsx

import { useState, useEffect } from 'react'
import api from '../../services/api'
import CategorieForm from '../categories/CategorieForm'

const INITIAL = {
  nomProduit:       '',
  reference:        '',
  codeBarre:        '',
  prixUnitaire:     '',
  seuilSecurite:    '',
  quantiteInitiale: '',
  idCategorie:      '',
  photo:            null,
}

function ProduitForm({ initial = null, categories = [], onSubmit, onCancel, loading = false, onCategorieAdded }) {
  const [form, setForm]           = useState(INITIAL)
  const [preview, setPreview]     = useState(null)
  const [showAddCat, setShowAddCat] = useState(false)
  const [savingCat, setSavingCat] = useState(false)
  const [errorCat, setErrorCat]   = useState(null)

  useEffect(() => {
    if (initial) {
      setForm({
        nomProduit:       initial.nomProduit    || '',
        reference:        initial.reference     || '',
        codeBarre:        initial.codeBarre     || '',
        prixUnitaire:     initial.prixUnitaire  || '',
        seuilSecurite:    initial.seuilSecurite || '',
        quantiteInitiale: '',   // jamais pré-rempli en édition
        idCategorie:      initial.idCategorie   || '',
        photo:            null,
      })
      setPreview(
        initial.photo
          ? `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/storage/${initial.photo}`
          : null
      )
    } else {
      setForm(INITIAL)
      setPreview(null)
    }
  }, [initial])

  const handle = (e) => {
    const { name, value, files } = e.target
    if (name === 'photo' && files[0]) {
      setForm(f => ({ ...f, photo: files[0] }))
      setPreview(URL.createObjectURL(files[0]))
    } else {
      setForm(f => ({ ...f, [name]: value }))
    }
  }

  const handleAddCategorie = async (formData) => {
    setSavingCat(true); setErrorCat(null)
    try {
      const res = await api.post('/categories', formData)
      const created = res.data
      onCategorieAdded(created)
      setForm(f => ({ ...f, idCategorie: String(created.idCategorie) }))
      setShowAddCat(false)
    } catch (err) {
      setErrorCat(err.response?.data?.message ?? 'Erreur lors de la création.')
    } finally {
      setSavingCat(false)
    }
  }

  const submit = (e) => {
    e.preventDefault()
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => {
      if (v !== null && v !== '') fd.append(k, v)
    })
    if (initial) fd.append('_method', 'PUT')
    onSubmit(fd)
  }

  return (
    <>
      {/* ✅ Formulaire produit — sans createPortal ni showModal */}
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Nom du produit */}
          <div className="form-control sm:col-span-2">
            <label className="label">
              <span className="label-text font-medium">Nom du produit *</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              name="nomProduit"
              value={form.nomProduit}
              onChange={handle}
              required
              maxLength={100}
              placeholder="Ex: Eau kirene"
            />
          </div>

          {/* Référence */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Référence *</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              name="reference"
              value={form.reference}
              onChange={handle}
              required
              maxLength={50}
              placeholder="PROD-001"
            />
          </div>

          {/* Code barre */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Code barre</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              name="codeBarre"
              value={form.codeBarre}
              onChange={handle}
              maxLength={50}
              placeholder="1234567890"
            />
          </div>

          {/* Prix unitaire */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Prix unitaire (FCFA) *</span>
            </label>
            <input
              type="text"
              inputMode="decimal"
              className="input input-bordered w-full"
              name="prixUnitaire"
              value={form.prixUnitaire}
              onChange={handle}
              required
              placeholder="0"
            />
          </div>

          {/* Seuil de sécurité */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Seuil sécurité *</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              className="input input-bordered w-full"
              name="seuilSecurite"
              value={form.seuilSecurite}
              onChange={handle}
              required
              placeholder="0"
            />
          </div>

          {/* Quantité initiale — création uniquement */}
          {!initial && (
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Quantité initiale *</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                className="input input-bordered w-full"
                name="quantiteInitiale"
                value={form.quantiteInitiale}
                onChange={handle}
                required
                placeholder="0"
              />
            </div>
          )}

          {/* Catégorie */}
          <div className="form-control sm:col-span-2">
            <label className="label">
              <span className="label-text font-medium">Catégorie *</span>
            </label>
            <div className="flex gap-2">
              <select
                name="idCategorie"
                className="select select-bordered flex-1"
                required
                onChange={handle}
                value={form.idCategorie}
              >
                <option value="">-- Sélectionner --</option>
                {categories.map(c => (
                  <option value={c.idCategorie} key={c.idCategorie}>
                    {c.emoji} {c.libelle}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn btn-ghost btn-sm border border-base-300 gap-1"
                onClick={() => setShowAddCat(v => !v)}
              >
                + Nouvelle catégorie
              </button>
            </div>

            {/* ✅ Mini-formulaire catégorie — à l'intérieur du form produit mais hors d'un <form> imbriqué */}
            {showAddCat && (
              <div className="mt-3 p-4 bg-base-200 rounded-2xl border border-base-300 space-y-3">
                <p className="text-xs font-bold text-base-content/60 uppercase tracking-wider">Nouvelle catégorie</p>
                {errorCat && <div className="alert alert-error text-xs py-2">{errorCat}</div>}
                <CategorieForm
                  initial={null}
                  onSubmit={handleAddCategorie}
                  onCancel={() => { setShowAddCat(false); setErrorCat(null) }}
                  loading={savingCat}
                />
              </div>
            )}
          </div>
        </div>

        {/* Photo */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Photo</span>
          </label>
          <div className="flex items-center gap-4">
            {preview && (
              <img
                src={preview}
                alt="preview"
                className="h-16 w-16 rounded-lg object-cover border"
              />
            )}
            <input
              type="file"
              className="file-input file-input-bordered file-input-sm flex-1"
              name="photo"
              onChange={handle}
              accept="image/jpeg,image/png,image/jpg,image/webp"
            />
          </div>
        </div>

        {/* Boutons */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onCancel}
            disabled={loading}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading && <span className="loading loading-spinner loading-xs" />}
            {initial ? 'Modifier' : 'Créer'}
          </button>
        </div>
      </form>
    </>
  )
}

export default ProduitForm