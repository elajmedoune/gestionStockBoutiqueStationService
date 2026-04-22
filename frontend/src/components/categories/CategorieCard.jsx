// src/components/categories/CategorieCard.jsx

function CategorieCard({ categorie, onEdit, onDelete}) {
    return(
        <div className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow border border-base-200">
            <div className="card-body p-4">
                <div className="flex items-center gap-3">
                    <div className="text-4xl">{categorie.emoji || '📦'}</div>
                    <div className="flex-1 min-w-0">
                        <h3 className="card-title text-base truncate">{categorie.libelle}</h3>
                        <p className="text-sm text-base-content/60 line-clamp-2">
                            {categorie.description || <span className="italic">Aucune description</span>}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-base-200">
                    <span className="badge badge-ghost text-xs">
                        {categorie.produits?.length ?? 0} produit(s)
                    </span>
                    <div className="flex gap-1">
                        <button className="btn btn-xs btn-ghost text-primary"
                            onClick={() => onEdit(categorie)}
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
                            onClick={() => onDelete(categorie)}
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
export default CategorieCard