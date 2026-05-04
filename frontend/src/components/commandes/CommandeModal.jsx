// src/components/commandes/CommandeModal.jsx

import CommandeForm from "./CommandeForm"

function CommandeModal({isOpen, mode, commande, onSubmit, onClose, loading}) {
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
                    {mode === 'create' ? "➕ Nouvelle commande" : "✏️ Modifier la commande"}
                </h3>
                <CommandeForm initial={ mode === 'edit' ? commande : null }
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
export default CommandeModal