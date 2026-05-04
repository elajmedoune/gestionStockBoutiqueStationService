// src/components/stock/StockForm.jsx

import { useState, useEffect } from 'react'

const INITIAL = { 
    quantiteInitiale: '',
    dateEntree: '',
    dateExpiration: '',
    prixEnGros: '',
    prixAchat: '',
    idProduit: '',
}

function StockForm({ initial = null, produits = [], onSubmit, onCancel, loading = false }) {
   const [form, setForm] = useState(INITIAL)

    useEffect(() => {
        if (initial) {
            setForm({
                quantiteInitiale: initial.quantiteInitiale || '',
                dateEntree: initial.dateEntree || '',
                dateExpiration: initial.dateExpiration || '',
                prixEnGros: initial.prixEnGros || '',
                prixAchat: initial.prixAchat || '',
                idProduit: initial.idProduit || '',
            })
        } else {
            setForm(INITIAL)
        }
    }, [initial])

    const handle = (e) => 
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

    const submit = (e) =>{
        e.preventDefault()
        onSubmit(form)
    }

    return (
        <form onSubmit={submit} 
            className="space-y-4"
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* produit */}
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Produit *</span>
                    </label>
                    <select name="idProduit"
                        id="idProduit"
                        className="select select-bordered"
                        required
                        onChange={handle}
                        value={form.idProduit}
                    >
                        <option value=""> -- Selectionner --</option>
                        {produits.map((p) => (
                            <option value={p.idProduit} key={p.idProduit}>
                                {p.reference}
                            </option>
                        ))}
                    </select>
                </div>

                {/* quantite */}
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Quantité *</span>
                    </label>
                    <input type="number" 
                        className="input input-bordered"
                        name='quantiteInitiale'
                        min="0"
                        value={form.quantiteInitiale}
                        onChange={handle}
                        required
                        placeholder= "0"
                    />
                </div>

                {/* prix achat */}
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Prix achat (FCFA) *</span>
                    </label>
                    <input type="number" 
                        className="input input-bordered"
                        name='prixAchat'
                        min="0"
                        step="0.01"
                        value={form.prixAchat}
                        onChange={handle}
                        required
                        placeholder= "0"
                    />
                </div>

                {/* prix en gros*/}
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Prix en gros (FCFA) *</span>
                    </label>
                    <input type="number" 
                        className="input input-bordered"
                        name='prixEnGros'
                        min="0"
                        step="0.01"
                        value={form.prixEnGros}
                        onChange={handle}
                        required
                        placeholder= "0"
                    />
                </div>
                
                {/* date entree */}
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Date entrée *</span>
                    </label>
                    <input type="date" 
                        className="input input-bordered"
                        name='dateEntree'
                        value={form.dateEntree}
                        onChange={handle}
                        required
                    />
                </div>

                {/* date expiration */}
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Date expiration *</span>
                    </label>
                    <input type="date" 
                        className="input input-bordered"
                        name='dateExpiration'
                        value={form.dateExpiration}
                        onChange={handle}
                        required
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
export default StockForm