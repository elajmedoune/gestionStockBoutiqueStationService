// src/components/stock/StockCard.jsx

function StockCard ({ stock, onEdit, onDelete }){
    const today = new Date()
    const expDate = stock.dateExpiration ? new Date(stock.dateExpiration) : null

    const isExpired = expDate && expDate < today
    const isExpiringSoon = expDate && !isExpired &&
        (expDate - today) / (1000 * 60 * 60 * 24) <= 30

    return(
        <div className={`card bg-base-100 shadow-md hover:shadow-lg transition-shadow border ${
            isExpired ? 'border-error' : 
            isExpiringSoon ? 'border-warning' : 
                            'border-base-200'
        }`}>
            <div className="card-body p-4 space-y-3">

                {/* header */}
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <p className="font-semibold">
                            {stock.produit?.reference ?? '-'}
                        </p>
                        <p className="text-xs text-base-content/50">
                            {stock.produit?.categorie?.libelle ?? ''}
                        </p>
                    </div>
                    {isExpired && <span className="badge badge-error badge-sm">Expiré</span>}
                    {isExpiringSoon && <span className="badge badge-warning badge-sm">Bientôt expiré</span>}
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-1 text-sm">
                    <span className="text-base-content/60">Quantité</span>
                    <span className="font-medium text-right">
                        {stock.quantiteInitiale}
                    </span>

                    <span className="text-base-content/60">Prix achat</span>
                    <span className="font-medium text-right">
                        {Number(stock.prixAchat).toLocaleString('fr-FR')} FCFA 
                    </span>

                    <span className="text-base-content/60">Prix en gros</span>
                    <span className="font-medium text-right">
                        {Number(stock.prixEnGros).toLocaleString('fr-FR')} FCFA 
                    </span>

                    <span className="text-base-content/60">Date Entrée</span>
                    <span className="text-right">
                        {stock.dateEntree}
                    </span>

                    <span className="text-base-content/60">Expiration</span>
                    <span className={`text-right ${isExpired ? 'text-error font-bold' : ''}`}>
                        {stock.dateExpiration ?? '-'}
                    </span>
                </div>

                {/* actions */}
                <div className="flex justify-end gap-1 pt-1 border-t border-base-200">
                    <button className="btn btn-xs btn-ghost text-primary"
                        onClick={() => onEdit(stock)}
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
                        onClick={() => onDelete(stock)}
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
export default StockCard 