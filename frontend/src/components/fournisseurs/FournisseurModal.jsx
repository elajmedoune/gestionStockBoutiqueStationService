// src/components/fournisseurs/FournisseurModal.jsx

import FournisseurForm from "./FournisseurForm"

function FournisseurModal({isOpen, mode, fournisseur, onSubmit, onClose, loading}) {
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
                    {mode === 'create' ? "➕ Nouveau fournisseur" : "✏️ Modifier le fournisseur"}
                </h3>
                <FournisseurForm initial={ mode === 'edit' ? fournisseur : null }
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
export default FournisseurModal