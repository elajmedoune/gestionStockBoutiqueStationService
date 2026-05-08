// src/pages/Fournisseurs.jsx

import { useState, useEffect } from "react"
import api from '../services/api'
import FournisseurList from '../components/fournisseurs/FournisseurList'
import FournisseurModal from '../components/fournisseurs/FournisseurModal'
import ConfirmDeleteModal from '../components/layouts/ConfirmDeleteModal'
import ExportPDF from '../components/exports/ExportPDF'
import ExportExcel from '../components/exports/ExportExcel'
import ExportCSV from '../components/exports/ExportCSV'

const PDF_COLS =[
    { header: 'Nom', dataKey: 'nom'},
    { header: 'Téléphone', dataKey: 'telephone'},
    { header: 'Email', dataKey: 'email'},
    { header: 'Adresse', dataKey: 'adresse'},
    { header: 'Délai (jours)', dataKey: 'delaiLivraison'},
]

function Fournisseurs() {
    const [fournisseurs, setFournisseurs] = useState([])
    const [filtered, setFiltered] = useState([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [modal, setModal] = useState({open: false, mode:'create', four: null})
    const [delModal, setDelModal] = useState({open: false, four: null})
    const [toast, setToast] = useState(null)

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3000)
    }

    const fetchFournisseurs = async () => {
        try {
            setLoading(true)
            const { data } = await api.get('/fournisseurs')
            setFournisseurs(data)
        } catch {
            showToast('Erreur lors du chargement', 'error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchFournisseurs()}, [])

    useEffect(() => {
        const q = search.toLowerCase()
        setFiltered(
            fournisseurs.filter((f) =>
                f.nom.toLowerCase().includes(q) ||
                (f.email || '').toLowerCase().includes(q) ||
                (f.telephone || '').includes(q)
            )
        )
    }, [search, fournisseurs])

    const handleSubmit = async (formData) => {
        try {
            setSaving(true)
            if(modal.mode === 'create') {
                await api.post('/fournisseurs', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                })
                showToast('Fournisseur créé !')
            } else {
                await api.post(`/fournisseurs/${modal.four.idFournisseur}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                })
                showToast('Fournisseur modifiée !')
            }
            setModal({ open: false, mode: 'create', four:null })
            fetchFournisseurs()
        } catch {
            showToast('Une erreur est survenue', 'error')
        } finally {
            setSaving(false)
        }
    }
    
    const handleDelete = async () => {
        try {
            setSaving(true)
            await api.delete(`/fournisseurs/${delModal.four.idFournisseur}`)
            showToast('Fournisseur supprimé')
            setDelModal({ open: false, four: null })
            fetchFournisseurs()
        } catch {
            showToast('Impossible de supprimer ce fournisseur', 'error')
        } finally {
            setSaving(false)
        }
    }

    const exportData = filtered.map((f) => ({
        nom: f.nom,
        telephone: f.telephone || '',
        email: f.email || '',
        adresse: f.adresse  || '',
        delaiLivraison: f.delaiLivraison,
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
                    <h1 className="text-2xl font-bold">Fournisseur</h1>
                    <p className="text-sm text-base-content/60">{fournisseurs.length} fournisseur(s)</p>
                </div>
                <button className="btn btn-primary gap-2"
                    onClick={() => setModal({ open: true, mode: 'create', four: null })}
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
                    Nouveau fournisseur
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <input type="text" 
                    placeholder="🔍 Nom, email, ou telephone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input input-bordered w-full sm:max-w-xs"
                />
                <div className="flex gap-2">
                    <ExportPDF data={exportData} 
                        columns={PDF_COLS}
                        filename="fournisseurs"
                        label="PDF"
                    />
                    <ExportExcel data={exportData}
                        filename="fournisseurs"
                        label="Excel"
                    />
                    <ExportCSV data={exportData}
                        filename="fournisseurs"
                        label="CSV"
                    />
                </div>
            </div>

            <FournisseurList 
                fournisseurs = {filtered}
                loading = {loading}
                onEdit ={(f) => setModal({ open: true, mode: 'edit', four: f })}
                onDelete = {(f) => setDelModal({ open: true, four: f })}
            />

            <FournisseurModal 
                isOpen={modal.open}
                mode = {modal.mode}
                fournisseur={modal.four}
                onSubmit={handleSubmit}
                onClose={() => setModal({ open: false, mode: 'create', four: null })}
                loading={saving}
            />

            <ConfirmDeleteModal 
                isOpen={delModal.open}
                label={delModal.four?.nom}
                onConfirm={handleDelete}
                onClose={() => setDelModal({ open: false, four: null })}
                loading={saving}
            />
        </div>
    )

}
export default Fournisseurs