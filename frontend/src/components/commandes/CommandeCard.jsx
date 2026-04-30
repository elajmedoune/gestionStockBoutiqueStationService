// src/components/commandes/CommandeCard.jsx

const STATUT_STYLES = {
    en_attente: 'badge-ghost',
    confirmee: 'badge-info',
    expediee: 'badge-warning',
    livree: 'badge-success',
}

const STATUT_ICONS = {
    en_attente: '⏳',
    confirmee: '✅',
    expediee: '🚚',
    livree: '📬',
}

const STATUTS = ['en_attente', 'confirmee', 'expediee', 'livree']

function CommandeCard({ commande, onEdit, onDelete}) {
    const statut = commande.statut || 'en_attente'

    return(
        <div className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow border border-base-200">
            <div className="card-body p-4 space-y-3">

                {/* header */}
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <p className="font-semibold">Commande #{commande.idCommande}</p>
                        <p className="text-xs text-base-content/50">{commande.dateCommande}</p>
                    </div>
                    <span className={`badge ${STATUT_STYLES[statut] || 'badge-ghost'} gap-1`}>
                        {STATUT_ICONS[statut]} {statut}
                    </span>
                </div>

                {/* details */}
                <div className="grid grid-cols-2 gap-1 text-sm">
                    <span className="text-base-content/60">Créé par</span>
                    <span className="text-right truncatue">
                        {commande.utilisateur?.prenom || '-'}
                    </span>

                    <span className="text-base-content/60">Livraison prévue</span>
                    <span className="text-right truncatue">
                        {commande.dateLivraisonPrevue || '-'}
                    </span>
                    
                    <span className="text-base-content/60">Montant total</span>
                    <span className="text-primary text-right font-bold">
                        {Number(commande.montantTotal || 0).toLocaleString('fr-FR')} FCFA  
                    </span>
                </div>

                {/* barre de progression */}
                <div className="flex items-center gap-1 text-xs">
                    {STATUTS.map((s, i) => (
                        <div key={s}
                            className="flex items-center gap-1"
                        >
                            <div className={`w-2 h-2 rounded-full ${
                                STATUTS.indexOf(statut) >= i ? 'bg-primary' : 'bg-base-300'
                            }`}/>
                            {i < STATUTS.length - 1 && (
                                <div className={`h-px w-4 ${
                                    STATUTS.indexOf(statut) > i ? 'bg-primary' : 'bg-base-300'
                                }`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* actions */}
                <div className="flex justify-end gap-1 pt-1 border-t boder-base-200">
                    <button className="btn btn-xs btn-ghost text-primary"
                        onClick={() => onEdit(commande)}
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
                        onClick={() => onDelete(commande)}
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
export default CommandeCard