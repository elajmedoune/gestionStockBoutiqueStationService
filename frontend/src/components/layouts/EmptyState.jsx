// src/components/layouts/EmptyState.jsx

function EmptyState({ title="Aucune donnée", message = "Ajoutez un élément" }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-base-content/40">
            <span className="text-6xl mb-4">📭</span>
            <p className="text-lg font-medium">{title}</p>
            <p className="text-sm">{message} !</p>
        </div>
    )
}
export default EmptyState