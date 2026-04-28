// src/components/produits/ProduitCard.jsx

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

function ProduitCard({ produit, onEdit, onDelete}) {
    const photoUrl = produit.photo ? `${API_URL}/storage/${produit.photo}` : null
    const stockTotal = produit.stocks?.reduce((acc, s) => acc + (s.quantiteInitiale || 0), 0) ?? 0
    const isCritical =  produit.seuilSecurite && stockTotal <= produit.seuilSecurite
    
    return(
        <div className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow border border-base-200">
            <figure className="h-36 bg-base-200 overflow-hidden rounded-t-2xl">
                {photoUrl
                    ? <img src={photoUrl} alt={produit.reference} className="w-full h-full object-cover"/>
                    : <div className="w-full h-full flex items-center justify-center text-5xl text-base-content/20">🛒</div>
                }
            </figure>
            
            <div className="card-body p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <p className="font-semibold truncate">{produit.reference}</p>
                        <p className="text-xs text-base-content/50">{produit.categorie?.libelle ?? '-'}</p>
                    </div>
                    {isCritical && <span className="badge badge-error badge-sm shrink-0">⚠ Stock bas </span>}
                </div>

                <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-primary">
                        {Number(produit.prixUnitaire).toLocaleString('fr-FR')} FCFA
                    </span>
                    <span className="text-base-content/60">Stock : {stockTotal} </span>
                </div>

                <div className="flex justify-end gap-1 pt-1 border-t border-base-200">
                    <button className="btn btn-xs btn-ghost text-primary"
                        onClick={() => onEdit(produit)}
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
                        onClick={() => onDelete(produit)}
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
    )
}
export default ProduitCard