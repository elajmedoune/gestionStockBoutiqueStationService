// src/components/commandes/CommandeList.jsx

import CommandeCard from "./CommandeCard"
import LoadingCard from "../layouts/LoadingCard"
import EmptyState from "../layouts/EmptyState"

function CommandeList({ commandes, onEdit, onDelete, loading, canDelete }) {
    if (loading) return <LoadingCard count={8} />

    if (!commandes.length) return (
        <EmptyState title="Aucune commande trouvée"
        message="Créez votre premiere commande" />
    )

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {commandes.map((c) => (
                <CommandeCard key={c.idCommande}
                    commande={c}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    canDelete={canDelete}
                />
            ))}
        </div>
    )
}
export default CommandeList