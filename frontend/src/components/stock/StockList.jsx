// src/components/stock/StockList.jsx

import StockCard from "./StockCard"
import LoadingCard from "../layouts/LoadingCard"
import EmptyState from "../layouts/EmptyState"

function StockList({ stocks, onEdit, onDelete, loading }) {
    if (loading) return <LoadingCard count={6} />

    if(!stocks.length) return (
        <EmptyState title="Aucun stock enregistré"
            message="Ajoutez une première entrée de stock"
        />
    )

    return(
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stocks.map((s) => (
                <StockCard key={s.idStock}
                    stock={s}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    )
}
export default StockList