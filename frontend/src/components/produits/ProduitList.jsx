// src/components/produits/ProduitList.jsx

import ProduitCard from "./ProduitCard"
import LoadingCard from "../layouts/LoadingCard"
import EmptyState from "../layouts/EmptyState"

function ProduitList ({ produits, onEdit, onDelete, loading }) {
    if(loading) return <LoadingCard count={8}/>

    if(!produits.length) return (
        <EmptyState title="Aucun produit trouvé"
            message="Ajoutez votre premier produit"
        />
    )

    return (
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {produits.map((p) => (
                <ProduitCard key={p.idProduit}
                    produit={p}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    )
}
export default ProduitList