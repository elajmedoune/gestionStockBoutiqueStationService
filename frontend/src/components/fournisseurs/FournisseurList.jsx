// src/components/fournisseurs/FournisseurList.jsx

import FournisseurCard from "./FournisseurCard"
import LoadingCard from "../layouts/LoadingCard"
import EmptyState from "../layouts/EmptyState"

function FournisseurList({ fournisseurs, onEdit, onDelete, loading }) {
    if (loading) return <LoadingCard count={6} />

    if(!fournisseurs.length) return <EmptyState title="Aucun fournisseur trouvé" message="Créez votre premier fournisseur" /> 

    return(
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {fournisseurs.map((f) => (
                <FournisseurCard key={f.idFournisseur}
                    fournisseur={f}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    )
}
export default FournisseurList