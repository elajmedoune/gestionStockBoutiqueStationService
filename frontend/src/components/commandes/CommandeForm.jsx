// src/components/commandes/CommandeForm.jsx

import { useState, useEffect } from 'react'

const STATUTS = ['en_attente', 'confirmee', 'expediee', 'livree']

const STATUT_LABELS = {
    en_attente: '⏳ En attente',
    confirmee: '✅ Confirmée',
    expediee: '🚚 Expédiée',
    livree: '📬 Livrée',
}

const INITIAL = { 
    dateCommande: '',
    dateLivraisonPrevue: '',
    montantTotal: '',
}

function CommandeForm ({initial = null, onSubmit, onCancel, loading = false}){
    const [form, setForm] = useState(INITIAL)

    useEffect(() => {
        if(initial) {
            setForm({
                dateCommande: initial.dateCommande || '',
                dateLivraisonPrevue: initial.dateLivraisonPrevue || '',
                montantTotal: initial.montantTotal || '', 
                statut: initial.statut || 'en_attente', 
            })
        } else {
            setForm(INITIAL)       
        }
    }, [initial])

    const handle = (e) => {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    }

    const submit = (e) => {
        e.preventDefault()
        onSubmit(form)
    }

    return (
        <form onSubmit={submit} 
            className="space-y-4"
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* date commande */}
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Date commande *</span>
                    </label>
                    <input className="input input-bordered"
                        name='dateCommande'
                        type='date'
                        value={form.dateCommande}
                        onChange={handle}
                        required
                    />
                </div>

                {/* date livraison prevue */}
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Date livraison prevue *</span>
                    </label>
                    <input className="input input-bordered"
                        name='dateLivraisonPrevue'
                        type='date'
                        value={form.dateLivraisonPrevue}
                        onChange={handle}
                        required
                    />
                </div>

                {/*  */}
                <div className="form-control sm:col-span-2">
                    <label className="label">
                        <span className="label-text font-medium">Montant total (FCFA)</span>
                    </label>
                    <input type="number" 
                        className="input input-bordered"
                        name='montantTotal'
                        min="0"
                        step="0.01"
                        value={form.montantTotal}
                        onChange={handle}
                        required
                        placeholder='0'
                    />
                </div>
            </div>

            {/* statut en mode edition only */}
            {initial && (
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Statut</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {STATUTS.map((s) => (
                            <button key={s}
                                type='button'
                                onClick={() => setForm((f) => ({ ...f, statut: s}))}
                                className={`btn btn-sm ${
                                    form.statut === s
                                        ? 'btn-primary'
                                        : 'btn-ghost border border-base-300'
                                }`}
                            >
                                {STATUT_LABELS[s]}
                            </button>
                        ))}
                    </div>
                </div>
            )}

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
export default CommandeForm
