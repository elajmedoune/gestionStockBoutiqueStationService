// src/components/layouts/ConfirmDeleteModal.jsx

function ConfirmDeleteModal({ isOpen , onConfirm, onClose, loading, label }) {
    if(!isOpen) return null
    return (
        <dialog open className="modal modal-open">
            <div className="modal-box max-w-sm">
                <h3 className="font-bold text-lg text-error">⚠️ Confirmer la suppression</h3>
                <p className="py-4">
                    Supprimer <strong>{label}</strong> ? Action irréversible.
                </p>
                <div className="flex justify-end gap-2">
                    <button className="btn btn-ghost"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Annuler
                    </button>
                    <button className="btn btn-error"
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading && <span className="loading loading-spinner loading-xs" /> }
                        Supprimer
                    </button>
                </div>
            </div>
            <div className="modal-backdrop bg-black/40"
                onClick={onClose}
            />
        </dialog>
    )
}
export default ConfirmDeleteModal