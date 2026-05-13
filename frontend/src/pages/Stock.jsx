// src/pages/Stock.jsx

import { useState, useEffect } from "react"
import api from '../services/api'
import StockList from '../components/stock/StockList'
import StockModal from '../components/stock/StockModal'
import ConfirmDeleteModal from '../components/layouts/ConfirmDeleteModal'
import ExportPDF from '../components/exports/ExportPDF'
import ExportExcel from '../components/exports/ExportExcel'
import ExportCSV from '../components/exports/ExportCSV'

const PDF_COLS =[
    { header: 'Produit', dataKey: 'produit'},
    { header: 'Quantité', dataKey: 'quantiteInitiale'},
    { header: 'Prix achat', dataKey: 'prixAchat'},
    { header: 'Prix gros', dataKey: 'prixEnGros'},
    { header: 'Date entrée', dataKey: 'dateEntree'},
    { header: 'Date expiration', dataKey: 'dateExpiration'},
]

function Stock() {
    const [stocks, setStocks] = useState([])
    const [filtered, setFiltered] = useState([])
    const [produits, setProduits] = useState([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [modal, setModal] = useState({open: false, mode:'create', stock: null})
    const [delModal, setDelModal] = useState({open: false, stock: null})
    const [toast, setToast] = useState(null)

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3000)
    }

    const fetchAll = async () => {
        try {
            setLoading(true)
            const [resS, resP] = await Promise.all([
                api.get('/stocks'),
                api.get('/produits'),
            ])
            setStocks(Array.isArray(resS.data) ? resS.data : resS.data.data ?? [])
            setProduits(Array.isArray(resP.data) ? resP.data : resP.data.data ?? [])
        } catch {
            showToast('Erreur lors du chargement', 'error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchAll()}, [])

    useEffect(() => {
        const q = search.toLowerCase()
        setFiltered(
            stocks.filter((s) =>
                (s.produit?.reference || '').toLowerCase().includes(q)
            )
        )
    }, [search, stocks])

    const today = new Date()

    const expired = stocks.filter((s) =>
        s.dateExpiration && new Date(s.dateExpiration) < today
    ).length

    const expiringSoon = stocks.filter((s) => {
        if(!s.dateExpiration) return false
        const diff = (new Date(s.dateExpiration) - today) / (1000*60*60*24)
        return diff > 0 && diff <= 30
    }).length

    const handleSubmit = async (form) => {
        try {
            setSaving(true)
            if(modal.mode === 'create') {
                await api.post('/stocks', form)
                showToast('Stock créé !')
            } else {
                await api.put(`/stocks/${modal.stock.idStock}`, form)
                showToast('Stock modifiée !')
            }
            setModal({ open: false, mode: 'create', stock:null })
            fetchAll()
        } catch {
            showToast('Une erreur est survenue', 'error')
        } finally {
            setSaving(false)
        }
    }
    
    const handleDelete = async () => {
        try {
            setSaving(true)
            await api.delete(`/stocks/${delModal.stock.idStock}`)
            showToast('Stock supprimé')
            setDelModal({ open: false, stock: null })
            fetchAll()
        } catch {
            showToast('Impossible de supprimer ce stock', 'error')
        } finally {
            setSaving(false)
        }
    }

    const exportData = filtered.map((s) => ({
        produit: s.produit?.reference || '',
        quantiteInitiale: s.quantiteInitiale,
        prixAchat: s.prixAchat,
        prixEnGros: s.prixEnGros,
        dateEntree: s.dateEntree,
        dateExpiration: s.dateExpiration || '',
    }))

    return (
        <div className="p-4 md:p-6 space-y-5">
            {toast && (
                <div className="toast toast-top toast-end z-50">
                    <div className={`alert ${toast.type === 'error' ? 'alert-error' : 'alert-success'} shadow-lg`}>
                        <span>{toast.msg}</span>
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">Gestion du Stock</h1>
                    <p className="text-sm text-base-content/60">{stocks.length} entrée(s) de stock</p>
                </div>
                <button className="btn btn-primary gap-2"
                    onClick={() => setModal({ open: true, mode: 'create', stock: null })}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                    Nouvelle entrée
                </button>
            </div>

            {(expired > 0 || expiringSoon > 0) && (
                <div className="flex flex-wrap gap-2">
                    {expired > 0 && (
                        <div className="alert alert-error py-2 px-4 w-auto">
                            <span className="text-sm font-medium">⛔ {expired} stock(s) expiré(s) </span>
                        </div>
                    )}
                    {expiringSoon > 0 && (
                        <div className="alert alert-warning py-2 px-4 w-auto">
                            <span className="text-sm font-medium">⚠️ {expiringSoon} expirant dans 30 jours</span>
                        </div>
                    )}
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <input type="text" 
                    placeholder="🔍 Recherche par produit..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input input-bordered w-full sm:max-w-xs"
                />
                <div className="flex gap-2">
                    <ExportPDF data={exportData} 
                        columns={PDF_COLS}
                        filename="stocks"
                        label="PDF"
                    />
                    <ExportExcel data={exportData}
                        filename="stocks"
                        label="Excel"
                    />
                    <ExportCSV data={exportData}
                        filename="stocks"
                        label="CSV"
                    />
                </div>
            </div>

            <StockList 
                stocks = {filtered}
                loading = {loading}
                onEdit ={(s) => setModal({ open: true, mode: 'edit', stock: s })}
                onDelete = {(s) => setDelModal({ open: true, stock: s })}
            />

            <StockModal 
                isOpen={modal.open}
                mode = {modal.mode}
                stock={modal.stock}
                produits={produits}
                onSubmit={handleSubmit}
                onClose={() => setModal({ open: false, mode: 'create', stock: null })}
                loading={saving}
            />

            <ConfirmDeleteModal 
                isOpen={delModal.open}
                label={delModal.stock?.produit?.reference}
                onConfirm={handleDelete}
                onClose={() => setDelModal({ open: false, stock: null })}
                loading={saving}
            />
        </div>
    )

}
export default Stock