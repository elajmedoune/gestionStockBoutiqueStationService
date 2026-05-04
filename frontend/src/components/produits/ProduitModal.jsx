// src/components/produits/ProduitModal.jsx

import ProduitForm from "./ProduitForm"

function ProduitModal({isOpen, mode, produit, categories, onSubmit, onClose, loading}) {
    if(!isOpen) return null

    return(
        <dialog open className="modal modal-open">
             <div className="modal-box w-full max-w-lg">
                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                    onClick={onClose}
                >
                    ✕
                </button>
                <h3 className="font-bold text-lg mb-4">
                    {mode === 'create' ? "➕ Nouveau produit" : "✏️ Modifier le produit"}
                </h3>
                <ProduitForm initial={ mode === 'edit' ? produit : null }
                    categories={categories}
                    onSubmit={onSubmit}
                    onCancel={onClose}
                    loading = {loading}
                />
            </div>

            <div className="modal-backdrop bg-black/40"
                onClick={onClose}
            />
        </dialog>
    )
}
export default ProduitModal