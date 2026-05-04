// src/components/stock/StockModal.jsx

import StockForm from "./StockForm"

function StockModal({isOpen, mode, stock, produits, onSubmit, onClose, loading}) {
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
                    {mode === 'create' ? "➕ Nouvelle entrée stock" : "✏️ Modifier le stock"}
                </h3>
                <StockForm initial={ mode === 'edit' ? stock : null }
                    produits={produits}
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
export default StockModal