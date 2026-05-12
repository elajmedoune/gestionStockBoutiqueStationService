import { useState, useEffect } from "react"
import api from '../services/api'
import CommandeList from '../components/commandes/CommandeList'
import CommandeModal from '../components/commandes/CommandeModal'
import ConfirmDeleteModal from '../components/layouts/ConfirmDeleteModal'
import ExportPDF from '../components/exports/ExportPDF'
import ExportExcel from '../components/exports/ExportExcel'
import ExportCSV from '../components/exports/ExportCSV'
import { ShoppingBag, Plus, Search, Download } from "lucide-react"
import { useAuth } from '../context/AuthContext'

const STATUTS = ['en_attente', 'confirmee', 'expediee', 'livree']
const PDF_COLS = [
  { header: 'N°',      dataKey: 'idCommande'   },
  { header: 'Date',    dataKey: 'dateCommande'  },
  { header: 'Statut',  dataKey: 'statut'        },
  { header: 'Montant', dataKey: 'montantTotal'  },
]

function Commandes() {
  const [commandes,    setCommandes]    = useState([])
  const [filtered,     setFiltered]     = useState([])
  const [search,       setSearch]       = useState('')
  const [filterStatut, setFilterStatut] = useState('')
  const [loading,      setLoading]      = useState(true)
  const [saving,       setSaving]       = useState(false)
  const [exportOpen,   setExportOpen]   = useState(false)
  const { user } = useAuth()
  const isGerant = user?.role === 'gerant'
  const isGestionnaire = user?.role === 'gestionnaire_stock'
  const canCreate = isGerant || isGestionnaire
  const canDelete = isGerant

  const [modal,    setModal]    = useState({ open: false, mode: 'create', cmd: null })
  const [delModal, setDelModal] = useState({ open: false, cmd: null })
  const [toast,    setToast]    = useState(null)

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

  useEffect(() => { fetchCommandes() }, [])

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
      if (modal.mode === 'create') {
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

  const STATUT_LABELS = {
  en_attente: "En attente",
  confirmee:  "Confirmée",
  expediee:   "Expédiée",
  livree:     "Livrée",
  annulee:    "Annulée",
}

const exportData = filtered.map((c) => ({
  idCommande:   `#${c.idCommande}`,
  dateCommande: c.dateCommande
    ? new Date(c.dateCommande).toLocaleDateString("fr-FR")
    : "—",
  statut:       STATUT_LABELS[c.statut] ?? c.statut,
  montantTotal: Math.round(c.montantTotal || 0),
}))

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-5">

      {/* Toast */}
      {toast && (
        <div className="toast toast-top toast-end z-50">
          <div className={`alert ${toast.type === 'error' ? 'alert-error' : 'alert-success'} shadow-lg`}>
            <span>{toast.msg}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-base-content flex items-center gap-2">
            <div className="p-2 bg-primary/15 rounded-2xl">
              <ShoppingBag size={20} className="text-primary" />
            </div>
            Commandes
          </h1>
          <p className="text-sm text-base-content/50 mt-0.5 ml-1">Gestion des commandes fournisseurs</p>
        </div>
        <div className="flex gap-2 items-center">

          {/* Bouton Export dropdown */}
          <div className="relative">
            <button
              className="btn btn-sm btn-ghost border border-base-300 gap-1.5"
              onClick={() => setExportOpen(!exportOpen)}
            >
              <Download size={14} /> Exporter
            </button>
            {exportOpen && (
              <div className="absolute right-0 mt-1 bg-base-100 rounded-2xl shadow-lg border border-base-200 w-40 p-2 flex flex-col gap-1 z-50">
                <ExportPDF   data={exportData} columns={PDF_COLS} filename="commandes" label="PDF"   />
                <ExportExcel data={exportData}                     filename="commandes" label="Excel" />
                <ExportCSV   data={exportData}                     filename="commandes" label="CSV"   />
              </div>
            )}
          </div>

          {/* Bouton Nouvelle commande */}
          {canCreate && (
            <button className="btn btn-primary gap-2"
            onClick={() => setModal({ open: true, mode: 'create', cmd: null })}>
              <Plus size={16} /> Nouvelle commande
              </button>
            )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { statut: 'en_attente', label: 'En attente', color: 'text-warning',   bg: 'bg-warning/10'   },
          { statut: 'confirmee',  label: 'Confirmées', color: 'text-info',      bg: 'bg-info/10'      },
          { statut: 'expediee',   label: 'Expédiées',  color: 'text-secondary', bg: 'bg-secondary/10' },
          { statut: 'livree',     label: 'Livrées',    color: 'text-success',   bg: 'bg-success/10'   },
        ].map(({ statut, label, color, bg }) => (
          <div key={statut} className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-4 gap-1">
              <div className={`p-2 rounded-2xl ${bg} w-fit mb-1 ${color}`}>
                <ShoppingBag size={18} />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-base-content/40">{label}</p>
              <p className={`text-3xl font-extrabold ${color}`}>{statsCounts[statut] ?? 0}</p>
              <p className="text-xs text-base-content/40">{statsCounts[statut] === 1 ? 'commande' : 'commandes'}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body p-3">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input input-bordered input-sm pl-8 w-48"
              />
            </div>
            <select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              className="select select-bordered select-sm"
            >
              <option value="">Tous les statuts</option>
              {STATUTS.map((s) => (
                <option key={s} value={s} className="capitalize">{s}</option>
              ))}
            </select>
            <span className="ml-auto text-xs text-base-content/40 font-semibold">
              {filtered.length} commande(s)
            </span>
          </div>
        </div>
      </div>

      {/* Liste */}
      <CommandeList
      commandes={filtered}
      loading={loading}
      onEdit={(c) => setModal({ open: true, mode: 'edit', cmd: c })}
      onDelete={(c) => setDelModal({ open: true, cmd: c })}
      canDelete={canDelete}
      />

      <CommandeModal
        isOpen={modal.open}
        mode={modal.mode}
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