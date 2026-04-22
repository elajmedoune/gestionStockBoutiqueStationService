// src/components/categories/CategorieList.jsx

import CategorieCard from "./CategorieCard"
import LoadingCard from "../layouts/LoadingCard"
import EmptyState from "../layouts/EmptyState"

function CategorieList({ categories, onEdit, onDelete, loading }) {
    if (loading) return <LoadingCard/>

    if(!categories.length) return <EmptyState title="Aucune catégorie trouvée" message="Créez votre premiere categorie" /> 

    return(
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map((cat) => (
                <CategorieCard key={cat.idCategorie}
                    categorie={cat}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    )
}
export default CategorieList