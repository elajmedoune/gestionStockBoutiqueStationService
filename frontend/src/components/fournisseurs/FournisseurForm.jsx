// src/components/fournisseurs/FournisseurForm.jsx

import { useState, useEffect } from 'react'

const INITIAL = { 
    nom: '',
    telephone: '',
    email: '',
    adresse: '',
    delaiLivraison: '',
    photo: null,
}

function FournisseurForm ({initial = null, onSubmit, onCancel, loading = false}){
    const [form, setForm] = useState(INITIAL)
    const [preview, setPreview] = useState(null)

    useEffect(() => {
        if(initial) {
            setForm({
                nom: initial.nom || '',
                telephone: initial.telephone || '',
                email: initial.email || '',
                adresse: initial.adresse || '',
                delaiLivraison: initial.delaiLivraison || '',
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

    const handle = (e) => {
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
                {/* nom */}
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Nom *</span>
                    </label>
                    <input type="text" 
                        className="input input-bordered"
                        name='nom'
                        value={form.nom}
                        onChange={handle}
                        required
                        maxLength={100}
                        placeholder= "Nom du fournisseur"
                    />
                </div>
                {/* telephone */}
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Téléphone</span>
                    </label>
                    <input type="text" 
                        className="input input-bordered"
                        name='telephone'
                        value={form.telephone}
                        onChange={handle}
                        maxLength={50}
                        placeholder= "+221771234567"
                    />
                </div>
                {/* email */}
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Email</span>
                    </label>
                    <input type="text" 
                        className="input input-bordered"
                        name='email'
                        value={form.email}
                        onChange={handle}
                        placeholder= "contact@fournisseur.com"
                    />
                </div>
                {/* adresse */}
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Adresse</span>
                    </label>
                    <input type="text" 
                        className="input input-bordered"
                        name='adresse'
                        value={form.adresse}
                        onChange={handle}
                        placeholder= "Thiès, Sénégal"
                    />
                </div>
                {/* delai livraison */}
                <div className="form-control sm:col-span-2">
                    <label className="label">
                        <span className="label-text font-medium">Délai de livraison (jours)</span>
                    </label>
                    <input type="number" 
                        className="input input-bordered w-full"
                        name='delaiLivraison'
                        min="1"
                        value={form.delaiLivraison}
                        onChange={handle}
                        required
                    />
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
export default FournisseurForm
