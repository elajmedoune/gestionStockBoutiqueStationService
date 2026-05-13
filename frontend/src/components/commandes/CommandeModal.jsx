import { ShoppingBag, Pencil, X } from 'lucide-react'
import { createPortal } from 'react-dom'
import CommandeForm from "./CommandeForm"

function CommandeModal({ isOpen, mode, commande, fournisseurs, onSubmit, onClose, loading, error }) {
    if (!isOpen) return null

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            
            {/* Modal */}
            <div className="relative bg-base-100 w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col shadow-2xl" 
                style={{ maxHeight: '90vh' }}>

                {/* Header */}
                <div className="bg-primary text-primary-content px-5 py-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/25 rounded-2xl">
                            {mode === 'create' ? <ShoppingBag size={16} /> : <Pencil size={16} />}
                        </div>
                        <h3 className="font-extrabold">
                            {mode === 'create' ? 'Nouvelle commande' : 'Modifier la commande'}
                        </h3>
                    </div>
                    <button className="btn btn-ghost btn-sm btn-circle text-primary-content" onClick={onClose}>
                        <X size={16} />
                    </button>
                </div>

                {/* Formulaire scrollable */}
                <div className="overflow-y-auto p-5" style={{ maxHeight: 'calc(90vh - 70px)' }}>
                    <CommandeForm
                        initial={mode === 'edit' ? commande : null}
                        fournisseurs={fournisseurs}
                        onSubmit={onSubmit}
                        onCancel={onClose}
                        loading={loading}
                        error={error}
                    />
                </div>
            </div>
        </div>,
        document.body
    )
}
export default CommandeModal