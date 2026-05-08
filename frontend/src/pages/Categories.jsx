// src/pages/Categories.jsx

import { useState, useEffect } from "react"
import api from '../services/api'
import CategorieList from '../components/categories/CategorieList'
import CategorieModal from '../components/categories/CategorieModal'
import ConfirmDeleteModal from '../components/layouts/ConfirmDeleteModal'
import ExportPDF from '../components/exports/ExportPDF'
import ExportExcel from '../components/exports/ExportExcel'
import ExportCSV from '../components/exports/ExportCSV'

const PDF_COLS =[
    { header: 'Libellé', dataKey: 'libelle'},
    { header: 'Description', dataKey: 'description'},
    { header: 'Produits', dataKey: 'nbProduits'},
]

function Categories() {
    const [categories, setCategories] = useState([])
    const [filtered, setFiltered] = useState([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [modal, setModal] = useState({open: false, mode:'create', cat: null})
    const [delModal, setDelModal] = useState({open: false, cat: null})
    const [toast, setToast] = useState(null)

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3000)
    }

    const fetchCategories = async () => {
        try {
            setLoading(true)
            const { data } = await api.get('/categories')
            setCategories(data)
            setFiltered(data)
        } catch {
            showToast('Erreur lors du chargement', 'error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchCategories()}, [])

    useEffect(() => {
        const q = search.toLowerCase()
        setFiltered(
            categories.filter((c) =>
                c.libelle.toLowerCase().includes(q) ||
                (c.description || '').toLowerCase().includes(q)
            )
        )
    }, [search, categories])

    const handleSubmit = async (form) => {
        try {
            setSaving(true)
            if(modal.mode === 'create') {
                await api.post('/categories', form)
                showToast('Catégorie créé !')
            } else{
                await api.put(`/categories/${modal.cat.idCategorie}`, form)
                showToast('Catégorie modifiée !')
            }
            setModal({ open: false, mode: 'create', cat:null })
            fetchCategories()
        } catch {
            showToast('Une erreur est survenue', 'error')
        } finally {
            setSaving(false)
        }
    }
    const handleDelete = async () => {
        try {
            setSaving(true)
            await api.delete(`/categories/${delModal.cat.idCategorie}`)
            showToast('Catégorie supprimée')
            setDelModal({ open: false, cat: null })
            fetchCategories()
        } catch {
            showToast('Impossible de supprimer cette catégorie', 'error')
        } finally {
            setSaving(false)
        }
    }

    const exportData = filtered.map((c) => ({
        libelle: c.libelle,
        description: c.description || '',
        nbProduits: c.produits?.length ?? 0,
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
                    <h1 className="text-2xl font-bold">Catégories</h1>
                    <p className="text-sm text-base-content/60">{categories.length} catégorie(s)</p>
                </div>
                <button className="btn btn-primary gap-2"
                    onClick={() => setModal({ open: true, mode: 'create', cat: null })}
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
                    Nouvelle catégorie
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <input type="text" 
                    placeholder="🔍 Rechercher une catégorie..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input input-bordered w-full sm:max-w-xs"
                />
                <div className="flex gap-2">
                    <ExportPDF data={exportData} 
                        columns={PDF_COLS}
                        filename="categories"
                        label="PDF"
                    />
                    <ExportExcel data={exportData}
                        filename="categories"
                        label="Excel"
                    />
                    <ExportCSV data={exportData}
                        filename="categories"
                        label="CSV"
                    />
                </div>
            </div>

            <CategorieList 
                categories = {filtered}
                loading = {loading}
                onEdit={(c) => setModal({ open: true, mode: 'edit', cat: c })}
                onDelete = {(c) => setDelModal({ open: true, cat: c })}
            />

            <CategorieModal 
                isOpen={modal.open}
                mode = {modal.mode}
                categorie={modal.cat}
                onSubmit={handleSubmit}
                onClose={() => setModal({ open: false, mode: 'create', cat: null })}
                loading={saving}
            />

            <ConfirmDeleteModal 
                isOpen={delModal.open}
                label={delModal.cat?.libelle}
                onConfirm={handleDelete}
                onClose={() => setDelModal({ open: false, cat: null })}
                loading={saving}
            />
        </div>
    )

}
export default Categories