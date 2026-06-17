// src/components/produits/ProduitModal.jsx

import { createPortal } from 'react-dom'
import ProduitForm from "./ProduitForm"

function ProduitModal({ isOpen, mode, produit, categories, onSubmit, onClose, loading, onCategorieAdded }) {
    if (!isOpen) return null

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex justify-center px-4 pt-20">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative bg-base-100 rounded-2xl shadow-xl w-full max-w-lg max-h-[78vh] overflow-y-auto p-6 self-start">
                <button
                    className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                    onClick={onClose}
                >
                    ✕
                </button>
                <h3 className="font-bold text-lg mb-4">
                    {mode === 'create' ? "➕ Nouveau produit" : "✏️ Modifier le produit"}
                </h3>
                <ProduitForm
                    key={produit?.idProduit ?? 'new'}
                    initial={mode === 'edit' ? produit : null}
                    categories={categories}
                    onSubmit={onSubmit}
                    onCancel={onClose}
                    loading={loading}
                    onCategorieAdded={onCategorieAdded}
                />
            </div>
        </div>,
        document.body
    )
}

export default ProduitModal