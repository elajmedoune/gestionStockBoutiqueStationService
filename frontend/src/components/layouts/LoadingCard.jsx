// src/components/layouts/LoadingCard.jsx

function LoadingCard({ count = 8 }){
    return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i}
                        className="card bg-base-100 shadow-md">
                            <div className="card-body p-4 space-y-3">
                                <div className="skeleton h-8 w-8 rounded" />
                                <div className="skeleton h-4 w-3/4" />
                                <div className="skeleton h-3 w-full" />
                            </div>
                    </div>
                ))}
            </div>
        )
}
export default LoadingCard