// src/components/fournisseurs/FournisseurCard.jsx

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

function FournisseurCard({ fournisseur, onEdit, onDelete}) {
    const photoUrl = fournisseur.photo 
        ? `${API_URL}/storage/${fournisseur.photo}` 
        : null
    
    return(
        <div className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow border border-base-200">
            <div className="card-body p-4 space-y-3">

                {/* header : avatar + nom */}
                <div className="flex items-center gap-3">
                    <div className="avatar">
                        <div className="w-12 h-12 rounded-full bg-base-200 overflow-hidden flex items-center justify-center">
                            {photoUrl
                                ? <img src={photoUrl} alt={fournisseur.nom} className="w-full h-full object-cover"/>
                                : <span className="text-2xl">🏭</span>
                            }
                        </div>
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold truncate">{fournisseur.nom}</p>
                        <p className="text-xs text-base-content/50 truncate">
                            {fournisseur.email || '-'}
                        </p>
                    </div>
                </div>

                {/* details */}
                <div className="grid grid-cols-2 gap-1 text-sm">
                    <span className="text-base-content/60">Téléphone</span>
                    <span className="text-right truncate">{fournisseur.telephone || '-'}</span>
                    
                    <span className="text-base-content/60">Adresse</span>
                    <span className="text-right truncate">{fournisseur.adresse || '-'}</span>

                    <span className="text-base-content/60">Délai livraison</span>
                    <span className="text-right truncate">{fournisseur.delaiLivraison} jour(s)</span>

                </div>

                {/* nb produit et button  */}
                <div className="flex items-center justify-between pt-2 border-t border-base-200">
                    <span className="badge badge-ghost text-xs">
                        {fournisseur.produits?.length ?? 0} produit(s)
                    </span>

                    <div className="flex gap-1">
                        <button className="btn btn-xs btn-ghost text-primary"
                            onClick={() => onEdit(fournisseur)}
                            title="Modifier"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                            </svg>
                        </button>
                        <button className="btn btn-xs btn-ghost text-error"
                            onClick={() => onDelete(fournisseur)}
                            title="Supprimer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default FournisseurCard