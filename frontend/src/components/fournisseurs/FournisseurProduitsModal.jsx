import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import api from '../../services/api'

function FournisseurProduitsModal({ isOpen, fournisseur, produits, onClose, onSuccess }) {
    const [selected, setSelected] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (fournisseur) {
            setSelected(fournisseur.produits?.map(p => p.idProduit) ?? [])
        }
    }, [fournisseur])

    const toggle = (id) => {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        )
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            await api.post(`/fournisseurs/${fournisseur.idFournisseur}/produits`, {
                produits: selected
            })
            onSuccess()
            onClose()
        } catch {
            // erreur
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen || !fournisseur) return null

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative bg-base-100 rounded-2xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto p-6">
                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={onClose}>✕</button>
                <h3 className="font-bold text-lg mb-4">📦 Produits de {fournisseur.nom}</h3>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {produits.map(p => (
                        <label key={p.idProduit} className="flex items-center gap-3 p-2 hover:bg-base-200 rounded-xl cursor-pointer">
                            <input
                                type="checkbox"
                                className="checkbox checkbox-primary"
                                checked={selected.includes(p.idProduit)}
                                onChange={() => toggle(p.idProduit)}
                            />
                            <span className="flex-1">{p.nomProduit ?? p.reference}</span>
                            <span className="text-xs text-base-content/40">{p.categorie?.libelle}</span>
                        </label>
                    ))}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
                    <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                        {loading && <span className="loading loading-spinner loading-xs" />}
                        Enregistrer
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}
export default FournisseurProduitsModal