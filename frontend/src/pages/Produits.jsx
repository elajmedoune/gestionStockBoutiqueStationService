// src/pages/Produits.jsx

import { useState, useEffect } from "react"
import api from '../services/api'
import ProduitList from '../components/produits/ProduitList'
import ProduitModal from '../components/produits/ProduitModal'
import ConfirmDeleteModal from '../components/layouts/ConfirmDeleteModal'
import ExportPDF from '../components/exports/ExportPDF'
import ExportExcel from '../components/exports/ExportExcel'
import ExportCSV from '../components/exports/ExportCSV'

const PDF_COLS =[
    { header: 'Référence', dataKey: 'reference'},
    { header: 'Catégorie', dataKey: 'categorie'},
    { header: 'Prix (FCFA)', dataKey: 'prixUnitaire'},
    { header: 'Seuil', dataKey: 'seuilSecurite'},
]

function Produits() {
    const [produits, setProduits] = useState([])
    const [filtered, setFiltered] = useState([])
    const [categories, setCategories] = useState([])
    const [search, setSearch] = useState('')
    const [filterCat, setFilterCat] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [modal, setModal] = useState({open: false, mode:'create', prod: null})
    const [delModal, setDelModal] = useState({open: false, prod: null})
    const [toast, setToast] = useState(null)

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3000)
    }

    const fetchAll = async () => {
        try {
            setLoading(true)
            const [{ data: prods }, { data: cats }] = await Promise.all([
                api.get('/produits'),
                api.get('/categories'),
            ])
            setProduits(prods)
            setCategories(cats)
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
            produits.filter((p) =>
            (p.reference.toLowerCase().includes(q) ||
                (p.codeBarre || '').includes(q)) &&
                (!filterCat || String(p.idCategorie) === filterCat)
            )
        )
    }, [search, filterCat, produits])

    const handleSubmit = async (formData) => {
        try {
            setSaving(true)
            if(modal.mode === 'create') {
                await api.post('/produits', formData)
                showToast('Produit créé !')
            } else {
                await api.post(`/produits/${modal.prod.idProduit}`, formData)
                showToast('Produit modifiée !')
            }
            setModal({ open: false, mode: 'create', prod:null })
            fetchAll()
        } catch (err) {
            const errors = err.response?.data?.errors
            if (errors) {
                const premier = Object.values(errors)[0][0]
                showToast(premier, 'error')
            } else {
                showToast(err.response?.data?.message ?? 'Une erreur est survenue', 'error')
            }
        } finally {
            setSaving(false)
        }
    }
    const handleDelete = async () => {
        try {
            setSaving(true)
            await api.delete(`/produits/${delModal.prod.idProduit}`)
            showToast('Produit supprimé')
            setDelModal({ open: false, prod: null })
            fetchAll()
        } catch (err) {
            showToast(
                err.response?.data?.message ?? 'Impossible de supprimer ce produit',
                'error'
            )
        } finally {
            setSaving(false)
        }
    }

    const exportData = filtered.map((p) => ({
        reference: p.reference,
        categorie: p.categorie?.libelle || '',
        prixUnitaire: p.prixUnitaire,
        seuilSecurite: p.seuilSecurite,
        codeBarre: p.codeBarre || '',
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
                    <h1 className="text-2xl font-bold">Produits</h1>
                    <p className="text-sm text-base-content/60">{produits.length} produit(s)</p>
                </div>
                <button className="btn btn-primary gap-2"
                    onClick={() => setModal({ open: true, mode: 'create', prod: null })}
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
                    Nouveau produit
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex gap-2 w-full sm:w-auto">
                    <input type="text" 
                        placeholder="🔍 Référence ou code barre..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input input-bordered w-full sm:w-56"
                    />
                    <select value={filterCat}
                        onChange={(e) => setFilterCat(e.target.value)}
                        className="select select-bordered"
                    >
                        <option value="">Toutes catégories</option>
                        {categories.map((c) => (
                            <option key={c.idCategorie}
                                value={String(c.idCategorie)}                            
                            >
                                {c.libelle}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex gap-2">
                    <ExportPDF data={exportData} 
                        columns={PDF_COLS}
                        filename="produits"
                        label="PDF"
                    />
                    <ExportExcel data={exportData}
                        filename="produits"
                        label="Excel"
                    />
                    <ExportCSV data={exportData}
                        filename="produits"
                        label="CSV"
                    />
                </div>
            </div>

            <ProduitList 
                produits = {filtered}
                loading = {loading}
                onEdit={(p) => setModal({ open: true, mode: 'edit', prod: p })}
                onDelete = {(p) => setDelModal({ open: true, prod: p })}
            />

            <ProduitModal 
                isOpen={modal.open}
                mode = {modal.mode}
                produit={modal.prod}
                categories={categories}
                onSubmit={handleSubmit}
                onClose={() => setModal({ open: false, mode: 'create', prod: null })}
                loading={saving}
                onCategorieAdded={(newCat) => {
                    setCategories(prev => {
                        if (prev.find(c => c.idCategorie === newCat.idCategorie)) return prev
                        return [...prev, newCat]
                    })
                }}
            />

            <ConfirmDeleteModal 
                isOpen={delModal.open}
                label={delModal.prod?.reference}
                onConfirm={handleDelete}
                onClose={() => setDelModal({ open: false, prod: null })}
                loading={saving}
            />
        </div>
    )

}
export default Produits