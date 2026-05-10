// src/pages/Commandes.jsx

import { useState, useEffect } from "react"
import api from '../services/api'
import CommandeList from '../components/commandes/CommandeList'
import CommandeModal from '../components/commandes/CommandeModal'
import ConfirmDeleteModal from '../components/layouts/ConfirmDeleteModal'
import ExportPDF from '../components/exports/ExportPDF'
import ExportExcel from '../components/exports/ExportExcel'
import ExportCSV from '../components/exports/ExportCSV'

const STATUTS = ['en_attente', 'confirmee', 'expediee', 'livree']
const PDF_COLS =[
    { header: 'N°', dataKey: 'idCommande'},
    { header: 'Date', dataKey: 'dateCommande'},
    { header: 'Statut', dataKey: 'statut'},
    { header: 'Montant', dataKey: 'montantTotal'},
]

function Commandes() {
    const [commandes, setCommandes] = useState([])
    const [filtered, setFiltered] = useState([])
    const [search, setSearch] = useState('')
    const [filterStatut, setFilterStatut] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [modal, setModal] = useState({open: false, mode:'create', cmd: null})
    const [delModal, setDelModal] = useState({open: false, cmd: null})
    const [toast, setToast] = useState(null)

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3000)
    }

    const fetchCommandes = async () => {
        try {
            setLoading(true)
            const { data } = await api.get('/commandes')
            setCommandes(Array.isArray(data) ? data : data.data ?? [])
        } catch {
            showToast('Erreur lors du chargement', 'error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchCommandes()}, [])

    useEffect(() => {
        const q = search.toLowerCase()
        setFiltered(
            commandes.filter((c) =>
            (!filterStatut || c.statut === filterStatut) &&
            (!search || (c.utilisateur?.prenom || '').toLowerCase().includes(q))
            )
        )
    }, [search, filterStatut, commandes])

    const statsCounts = STATUTS.reduce((acc, s) => {
        acc[s] = commandes.filter((c) => c.statut === s).length
        return acc
    }, {})

    const handleSubmit = async (form) => {
        try {
            setSaving(true)
            if(modal.mode === 'create') {
                await api.post('/commandes', form)
                showToast('Commande créée !')
            } else {
                await api.put(`/commandes/${modal.cmd.idCommande}`, form)
                showToast('Commande modifiée !')
            }
            setModal({ open: false, mode: 'create', cmd: null })
            fetchCommandes()
        } catch {
            showToast('Une erreur est survenue', 'error')
        } finally {
            setSaving(false)
        }
    }
    
    const handleDelete = async () => {
        try {
            setSaving(true)
            await api.delete(`/commandes/${delModal.cmd.idCommande}`)
            showToast('Commande supprimée')
            setDelModal({ open: false, cmd: null })
            fetchCommandes()
        } catch {
            showToast('Impossible de supprimer cette commande', 'error')
        } finally {
            setSaving(false)
        }
    }

    const exportData = filtered.map((c) => ({
        idCommande: c.idCommande,
        dateCommande: c.dateCommande,
        statut: c.statut,
        montantTotal: c.montantTotal  || 0,
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
                    <h1 className="text-2xl font-bold">Commandes</h1>
                    <p className="text-sm text-base-content/60">{commandes.length} commande(s)</p>
                </div>
                <button className="btn btn-primary gap-2"
                    onClick={() => setModal({ open: true, mode: 'create', cmd: null })}
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
                    Nouvelle commande
                </button>
            </div>

            <div className="flex flex-wrap gap-2">
                {STATUTS.map((s) => (
                    <div key={s}
                        className="bg-base-100 border border-base-200 rounded-xl px-4 py-2 flex items-center gap-2 shadow-sm"
                    >
                        <span className="capitalize text-sm text-base-content/60">{s}</span>
                        <span className="font-bold text-lg">{statsCounts[s]}</span>
                    </div>
                ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex gap-2 w-full sm:w-auto">
                    <input type="text" 
                        placeholder="🔍 Rechercher..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input input-bordered w-full sm:max-w-xs"
                    />
                    <select value={filterStatut}
                        onChange={(e) => setFilterStatut(e.target.value)}
                        className="select select-bordered"
                    >
                        <option value="">Tous statuts</option>
                        {STATUTS.map((s) => (
                            <option key={s}
                                value={s} 
                                className="capitalize"                         
                            >
                                {s}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex gap-2">
                    <ExportPDF data={exportData} 
                        columns={PDF_COLS}
                        filename="commandes"
                        label="PDF"
                    />
                    <ExportExcel data={exportData}
                        filename="commandes"
                        label="Excel"
                    />
                    <ExportCSV data={exportData}
                        filename="commandes"
                        label="CSV"
                    />
                </div>
            </div>

            <CommandeList 
                commandes = {filtered}
                loading = {loading}
                onEdit ={(c) => setModal({ open: true, mode: 'edit', cmd: c })}
                onDelete = {(c) => setDelModal({ open: true, cmd: c })}
            />

            <CommandeModal 
                isOpen={modal.open}
                mode = {modal.mode}
                commande={modal.cmd}
                onSubmit={handleSubmit}
                onClose={() => setModal({ open: false, mode: 'create', cmd: null })}
                loading={saving}
            />

            <ConfirmDeleteModal 
                isOpen={delModal.open}
                label={`commande #${delModal.cmd?.idCommande}`}
                onConfirm={handleDelete}
                onClose={() => setDelModal({ open: false, cmd: null })}
                loading={saving}
            />
        </div>
    )

}
export default Commandes