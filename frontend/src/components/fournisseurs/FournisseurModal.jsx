import { createPortal } from 'react-dom'
import FournisseurForm from "./FournisseurForm"
import { Building2, Pencil } from 'lucide-react'

function FournisseurModal({isOpen, mode, fournisseur, onSubmit, onClose, loading}) {
    if(!isOpen) return null

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative bg-base-100 w-full max-w-lg rounded-2xl overflow-hidden flex flex-col shadow-2xl"
                style={{ maxHeight: '90vh' }}>

                {/* Header */}
                <div className="bg-primary text-primary-content px-5 py-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/25 rounded-2xl">
                            {mode === 'create' ? <Building2 size={16} /> : <Pencil size={16} />}
                        </div>
                        <h3 className="font-extrabold">
                            {mode === 'create' ? 'Nouveau fournisseur' : 'Modifier le fournisseur'}
                        </h3>
                    </div>
                    <button className="btn btn-ghost btn-sm btn-circle text-primary-content"
                        onClick={onClose}>✕</button>
                </div>

                {/* Contenu scrollable */}
                <div className="overflow-y-auto p-5" style={{ maxHeight: 'calc(90vh - 70px)' }}>
                    <FournisseurForm
                        key={fournisseur?.idFournisseur ?? 'new'}
                        initial={mode === 'edit' ? fournisseur : null}
                        onSubmit={onSubmit}
                        onCancel={onClose}
                        loading={loading}
                    />
                </div>
            </div>
        </div>,
        document.body
    )
}
export default FournisseurModal