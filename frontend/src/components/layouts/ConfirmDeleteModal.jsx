// src/components/layouts/ConfirmDeleteModal.jsx

import { createPortal } from 'react-dom'

function ConfirmDeleteModal({ isOpen, onConfirm, onClose, loading, label }) {
    if (!isOpen) return null

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative bg-base-100 rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
                <h3 className="font-bold text-lg text-error">⚠️ Confirmer la suppression</h3>
                <p className="py-4">
                    Supprimer <strong>{label}</strong> ? Action irréversible.
                </p>
                <div className="flex justify-end gap-2">
                    <button className="btn btn-ghost" onClick={onClose} disabled={loading}>
                        Annuler
                    </button>
                    <button className="btn btn-error" onClick={onConfirm} disabled={loading}>
                        {loading && <span className="loading loading-spinner loading-xs" />}
                        Supprimer
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}
export default ConfirmDeleteModal