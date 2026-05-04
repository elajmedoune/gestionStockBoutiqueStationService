// src/components/categories/CategorieModal.jsx

import CategorieForm from "./CategorieForm"

function CategorieModal({ isOpen, mode, categorie, onSubmit, onClose, loading }) {
    if(!isOpen) return null

    return (
        <dialog open className="modal modal-open">
            <div className="modal-box w-full max-w-md">
                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                    onClick={onClose}
                >
                    ✕
                </button>
                <h3 className="font-bold text-lg mb-4">
                    {mode === 'create' ? "➕ Nouvelle catégorie" : "✏️ Modifier la catégorie" }
                </h3>
                <CategorieForm initial={ mode === 'edit' ? categorie : null }
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
export default CategorieModal