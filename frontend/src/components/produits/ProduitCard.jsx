// src/components/produits/ProduitCard.jsx

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

function ProduitCard({ produit, onEdit, onDelete}) {
    const photoUrl = produit.photo ? `${API_URL}/storage/${produit.photo}` : null
    const stockTotal = produit.stocks?.reduce((acc, s) => acc + (s.quantiteIinitiale || 0), 0) ?? 0
    const isCritical =  produit.seuilSecurite && stockTotal <= produit.seuilSecurite
    
    return(
        <div className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow border border-base-200">
            
        </div>
    )
}
export default ProduitCard