// src/components/produits/ProduitForm.jsx

import { useState, useEffect } from 'react'

const INITIAL = { 
    reference: '',
    codeBarre: '',
    prixUnitaire: '',
    seuilSecurite: '',
    idCategorie: '',
    photo: null,
}

function ProduitForm ({initial = null, categories=[], onSubmit, onCancel, loading = false}){
    const [form, setForm] = useState(INITIAL)
    const [preview, setPreview] = useState(null)

    useEffect(() => {
        if(initial) {
            setForm({
                reference: initial.reference || '',
                codeBarre: initial.codeBarre || '',
                prixUntaire: initial.prixUnitaire || '',
                seuilSecurite: initial.seuilSecurite || '',
                idCategorie: initial.idCategorie || '',
                photo: null, 
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

    const handle =(e) => {
        const {name, value, files } =  e.target
        if( name === 'photo' && files[0]) {
            setForm((f) => ({ ...f, photo: files[0] }))
            setPreview(URL.createObjectURL(files[0]))
        } else {
            setForm((f) => ({ ...f, [name]: value }))
        }
    }

    const submit = (e) => {
        e.preventDefault()
        const fd = new FormData()
        Object.entries(form).forEach(([k, v]) => {
            if(v !== null && v !== '') fd.append(k, v)
        })
    if(initial) fd.append('_method', 'PUT')
        onSubmit(fd)
    }

    return (
        <form onSubmit={submit} 
            className="space-y-4"
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* reference */}
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Reference *</span>
                    </label>
                    <input type="text" 
                        className="input input-bordered w-full"
                        name='reference'
                        value={form.reference}
                        onChange={handle}
                        required
                        maxLength={50}
                        placeholder= "PROD-001"
                    />
                </div>
                {/* code barre */}
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Code barre</span>
                    </label>
                    <input type="text" 
                        className="input input-bordered w-full"
                        name='codeBarre'
                        value={form.codeBarre}
                        onChange={handle}
                        maxLength={50}
                        placeholder= "1234567890"
                    />
                </div>
                {/* prix unitaire */}
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Prix unitaire</span>
                    </label>
                    <input type="number" 
                        className="input input-bordered w-full"
                        name='prixUnitaire'
                        min="0"
                        step="0.01"
                        value={form.prixUntaire}
                        onChange={handle}
                        required
                        placeholder= "0"
                    />
                </div>
                {/* seuil de securite */}
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Seuil securite*</span>
                    </label>
                    <input type="number" 
                        className="input input-bordered w-full"
                        name='seuilSecurite'
                        min="0"
                        value={form.seuilSecurite}
                        onChange={handle}
                        required
                        placeholder= "0"
                    />
                </div>
                {/* categorie */}
                <div className="form-control sm:col-span-2">
                    <label className="label">
                        <span className="label-text font-medium">Categorie *</span>
                    </label>
                    <select name="idCategorie"
                        id="idCategorie"
                        className="select select-bordered"
                        required
                        onChange={handle}
                        value={form.idCategorie}
                    >
                        <option value=""> -- Selectionner --</option>
                        {categories.map((c) => (
                            <option value={c.idCategorie} key={c.idCategorie}>
                                {c.emoji} {c.libelle}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* photo*/}
            <div className="form-control">
                <label className="label">
                    <span className="label-text font-medium">Photo</span>
                </label>
                <div className="flex items-center gap-4">
                    {preview && (
                        <img src={preview}
                            alt="preview" 
                            className='h-16 w-16 rounded-lg object-cover border'
                        />
                    )}
                    <input type="file"
                        className="file-input file-input-bordered file-input-sm flex-1" 
                        name='photo'
                        onChange={handle}
                        accept="image/jpeg,image/png,image/jpg"   
                    />
                </div>
            </div>

            {/* button send */}
            <div className="flex justify-end gap-2 pt-2">
                <button type="button"
                    className="btn btn-ghost"
                    onClick={onCancel}
                    disabled={loading}
                >
                    Annuler
                </button>
                <button type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                >
                    {loading && <span className='loading loading-spinner loading-xs'/>}
                    {initial ? 'Modifier' : 'Créer'}
                </button>
            </div>
        </form>
    )
}
export default ProduitForm
