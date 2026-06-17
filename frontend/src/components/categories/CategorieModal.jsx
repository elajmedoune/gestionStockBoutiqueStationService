// src/components/categories/CategorieModal.jsx

import { createPortal } from 'react-dom'
import CategorieForm from "./CategorieForm"

function CategorieModal({ isOpen, mode, categorie, onSubmit, onClose, loading }) {
    if (!isOpen) return null

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative bg-base-100 rounded-2xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto p-6">
                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={onClose}>
                    ✕
                </button>
                <h3 className="font-bold text-lg mb-4">
                    {mode === 'create' ? "➕ Nouvelle catégorie" : "✏️ Modifier la catégorie"}
                </h3>
                <CategorieForm
                    initial={mode === 'edit' ? categorie : null}
                    onSubmit={onSubmit}
                    onCancel={onClose}
                    loading={loading}
                />
            </div>
        </div>,
        document.body
    )
}
export default CategorieModal