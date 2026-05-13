import React, { useState, useEffect } from "react"
import api from "../services/api"
import LoadingCard from "../components/layouts/LoadingCard"
import EmptyState from "../components/layouts/EmptyState"
import ConfirmDeleteModal from "../components/layouts/ConfirmDeleteModal"
import {
  Truck, Plus, Search, Calendar, ClipboardList,
  CheckCircle, Clock, XCircle, Package,
  Pencil, Trash2, AlertTriangle, ChevronDown, ChevronUp, Download,
} from "lucide-react"
import ExportPDF from "../components/exports/ExportPDF"
import ExportExcel from "../components/exports/ExportExcel"
import ExportCSV from "../components/exports/ExportCSV"
import { useAuth } from '../context/AuthContext'
import { createPortal } from 'react-dom'

const PDF_COLS = [
  { header: '#',             dataKey: 'idLivraison'   },
  { header: 'Commande',      dataKey: 'idCommande'    },
  { header: 'Date livraison',dataKey: 'dateLivraison' },
  { header: 'Montant (F)',   dataKey: 'montantTotal'  },
  { header: 'Statut',        dataKey: 'statut'        },
]

const STATUTS = ["en_attente", "livree", "annulee"]

const STATUT_CONFIG = {
  en_attente: { label: "En attente", badge: "badge-warning", btnClass: "btn-warning", icon: <Clock size={12} /> },
  livree:     { label: "Livrée",     badge: "badge-success", btnClass: "btn-success", icon: <CheckCircle size={12} /> },
  annulee:    { label: "Annulée",    badge: "badge-error",   btnClass: "btn-error",   icon: <XCircle size={12} /> },
}

const fmt = n => new Intl.NumberFormat('fr-FR').format(Math.round(n || 0))

export default function Livraisons() {
  const [livraisons,       setLivraisons]       = useState([])
  const [commandes,        setCommandes]        = useState([])
  const [loading,          setLoading]          = useState(true)
  const [saving,           setSaving]           = useState(false)
  const [error,            setError]            = useState(null)
  const [search,           setSearch]           = useState("")
  const [filterStatut,     setFilterStatut]     = useState("tous")
  const [showModal,        setShowModal]        = useState(false)
  const [editItem,         setEditItem]         = useState(null)
  const [delModal,         setDelModal]         = useState(null)
  const [detailId,         setDetailId]         = useState(null)
  const [cmdSelectionnee,  setCmdSelectionnee]  = useState(null)
  const [exportOpen,       setExportOpen]       = useState(false)
  const { user } = useAuth()
const isGerant       = user?.role === 'gerant'
const isGestionnaire = user?.role === 'gestionnaire_stock'
const isMagasinier   = user?.role === 'magasinier'
const canCreate      = isGerant || isGestionnaire
const canDelete      = isGerant
const canValider     = isGerant || isGestionnaire || isMagasinier
const canAnnuler     = isGerant || isGestionnaire

  const [form, setForm] = useState({
    idCommande:    "",
    dateLivraison: "",
    dateLivraisonPrevue: "",
    statut:        "en_attente",
    observations:  "",
    montantTotal:  0,
  })

  useEffect(() => { fetchLivraisons(); fetchCommandes() }, [])

  const fetchLivraisons = async () => {
    try {
      setLoading(true)
      const res = await api.get("/livraisons")
      setLivraisons(res.data.data || res.data)
    } catch { setError("Erreur lors du chargement") }
    finally { setLoading(false) }
  }

  const fetchCommandes = async () => {
    try {
      const res = await api.get("/commandes")
      setCommandes(res.data.data || res.data)
    } catch {}
  }

  const ouvrirModal = (item = null) => {
    setEditItem(item)
    if (item) {
      setForm({
        idCommande:    item.idCommande,
        dateLivraison: item.dateLivraison?.split("T")[0] || "",
        statut:        item.statut,
        observations:  item.observations || "",
        montantTotal:  item.montantTotal || 0,
      })
      setCmdSelectionnee(commandes.find(c => c.idCommande === item.idCommande) ?? null)
    } else {
      setForm({ idCommande: "", dateLivraison: "", statut: "en_attente", observations: "", montantTotal: 0 })
      setCmdSelectionnee(null)
    }
    setShowModal(true)
  }

  const handleCommandeChange = (idCommande) => {
    const cmd = commandes.find(c => String(c.idCommande) === String(idCommande))
    setCmdSelectionnee(cmd ?? null)
    setForm(f => ({ 
        ...f, 
        idCommande, 
        montantTotal: cmd?.montantTotal || 0,
        dateLivraisonPrevue: cmd?.dateLivraisonPrevue 
            ? String(cmd.dateLivraisonPrevue).split('T')[0] 
            : ''
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      if (editItem) {
        await api.put(`/livraisons/${editItem.idLivraison}`, form)
      } else {
        await api.post("/livraisons", form)
      }
      setShowModal(false)
      fetchLivraisons()
      fetchCommandes()
    } catch (err) {
      setError(err.response?.data?.message ?? "Erreur lors de la sauvegarde")
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try {
      setSaving(true)
      await api.delete(`/livraisons/${delModal}`)
      setDelModal(null)
      fetchLivraisons()
    } catch { setError("Erreur lors de la suppression") }
    finally { setSaving(false) }
  }

  const filtered = livraisons.filter(l => {
    const matchSearch =
      String(l.idLivraison).includes(search) ||
      (l.commande?.fournisseur?.nomFournisseur ?? "").toLowerCase().includes(search.toLowerCase())
    const matchStatut = filterStatut === "tous" || l.statut === filterStatut
    return matchSearch && matchStatut
  })

  const STATS_CONFIG = [
    { statut: "en_attente", label: "En attente", icon: <Clock size={18} />,       color: "text-warning", bg: "bg-warning/10" },
    { statut: "livree",     label: "Livrées",    icon: <CheckCircle size={18} />, color: "text-success", bg: "bg-success/10" },
    { statut: "annulee",    label: "Annulées",   icon: <XCircle size={18} />,     color: "text-error",   bg: "bg-error/10"   },
  ]

  const exportData = filtered.map(l => ({
    idLivraison:   `#${l.idLivraison}`,
    idCommande:    `CMD #${l.idCommande}`,
    dateLivraison: l.dateLivraison ? new Date(l.dateLivraison).toLocaleDateString("fr-FR") : "—",
    montantTotal:  Math.round(l.montantTotal || 0),
    statut:        STATUT_CONFIG[l.statut]?.label ?? l.statut,
  }))

    const validerLivraison = async (id) => {
    try {
        await api.put(`/livraisons/${id}`, { statut: 'livree' })
        fetchLivraisons()
        fetchCommandes()
    } catch { setError("Erreur lors de la validation") }
}

const annulerLivraison = async (id) => {
    try {
        await api.put(`/livraisons/${id}`, { statut: 'annulee' })
        fetchLivraisons()
        fetchCommandes()
    } catch { setError("Erreur lors de l'annulation") }
}

  if (loading) return (
    <div className="p-6 max-w-6xl mx-auto">
      <LoadingCard count={8} />
    </div>
  )

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-base-content flex items-center gap-2">
            <div className="p-2 bg-primary/15 rounded-2xl">
              <Truck size={20} className="text-primary" />
            </div>
            Livraisons
          </h1>
          <p className="text-sm text-base-content/50 mt-0.5 ml-1">Réception des commandes fournisseurs</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="relative">
            <button
              className="btn btn-sm btn-ghost border border-base-300 gap-1.5"
              onClick={() => setExportOpen(!exportOpen)}>
              <Download size={14} /> Exporter
            </button>
            {exportOpen && (
              <div className="absolute right-0 mt-1 bg-base-100 rounded-2xl shadow-lg border border-base-200 w-40 p-2 flex flex-col gap-1 z-50">
                <ExportPDF   data={exportData} columns={PDF_COLS} filename="livraisons" label="PDF"   />
                <ExportExcel data={exportData}                     filename="livraisons" label="Excel" />
                <ExportCSV   data={exportData}                     filename="livraisons" label="CSV"   />
              </div>
            )}
          </div>
          {canCreate && (
    <button className="btn btn-primary gap-2" onClick={() => ouvrirModal()}>
        <Plus size={16} /> Nouvelle livraison
    </button>
)}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {STATS_CONFIG.map(({ statut, label, icon, color, bg }) => (
          <div key={statut} className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-4 gap-1">
              <div className={`p-2 rounded-2xl ${bg} w-fit mb-1 ${color}`}>{icon}</div>
              <p className="text-xs font-bold uppercase tracking-widest text-base-content/40">{label}</p>
              <p className={`text-2xl font-extrabold ${color}`}>
                {livraisons.filter(l => l.statut === statut).length}
              </p>
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
              <input type="text" placeholder="Rechercher..."
                className="input input-bordered input-sm pl-8 w-48"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="select select-bordered select-sm"
              value={filterStatut} onChange={e => setFilterStatut(e.target.value)}>
              <option value="tous">Tous les statuts</option>
              {STATUTS.map(s => (
                <option key={s} value={s}>{STATUT_CONFIG[s]?.label ?? s}</option>
              ))}
            </select>
            <span className="ml-auto text-xs text-base-content/40 font-semibold">
              {filtered.length} livraison(s)
            </span>
          </div>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="alert alert-error rounded-2xl">
          <AlertTriangle size={14} />
          <span>{error}</span>
          <button className="btn btn-sm btn-ghost ml-auto" onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Tableau */}
      <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-sm w-full">
            <thead>
              <tr className="bg-primary text-primary-content">
                <th>#</th>
                <th>Commande</th>
                <th>Fournisseur</th>
                <th>Date livraison</th>
                <th>Montant</th>
                <th>Statut</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState title="Aucune livraison" message="Créez une nouvelle livraison" />
                  </td>
                </tr>
              ) : filtered.map(liv => (
                <React.Fragment key={liv.idLivraison}>
                  <tr className="hover">
                    <td className="font-bold text-primary">#{liv.idLivraison}</td>
                    <td className="font-semibold text-xs">CMD #{liv.idCommande}</td>
                    <td className="text-xs">{liv.commande?.fournisseur?.nomFournisseur ?? "—"}</td>
                    <td className="text-xs">
                      {liv.dateLivraison
                        ? new Date(liv.dateLivraison).toLocaleDateString("fr-FR")
                        : "—"}
                    </td>
                    <td className="font-bold text-xs">{fmt(liv.montantTotal)} F</td>
                    <td>
                      <span className={`badge badge-sm gap-1 font-semibold ${STATUT_CONFIG[liv.statut]?.badge ?? 'badge-ghost'}`}>
                        {STATUT_CONFIG[liv.statut]?.icon}
                        {STATUT_CONFIG[liv.statut]?.label ?? liv.statut}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-1 justify-end">
    <button className="btn btn-ghost btn-xs btn-circle tooltip"
        data-tip="Voir lignes"
        onClick={() => setDetailId(detailId === liv.idLivraison ? null : liv.idLivraison)}>
        {detailId === liv.idLivraison ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
    </button>
    {liv.statut === 'en_attente' && canValider && (
        <button className="btn btn-ghost btn-xs btn-circle tooltip text-success"
            data-tip="Valider"
            onClick={() => validerLivraison(liv.idLivraison)}>
            <CheckCircle size={13} />
        </button>
    )}
    {liv.statut === 'en_attente' && canAnnuler && (
        <button className="btn btn-ghost btn-xs btn-circle tooltip text-error"
            data-tip="Annuler"
            onClick={() => annulerLivraison(liv.idLivraison)}>
            <XCircle size={13} />
        </button>
    )}
    {(isGerant || isGestionnaire) && (
        <button className="btn btn-ghost btn-xs btn-circle tooltip text-warning"
            data-tip="Modifier"
            onClick={() => ouvrirModal(liv)}>
            <Pencil size={13} />
        </button>
    )}
    {canDelete && (
        <button className="btn btn-ghost btn-xs btn-circle tooltip text-error"
            data-tip="Supprimer"
            onClick={() => setDelModal(liv.idLivraison)}>
            <Trash2 size={13} />
        </button>
    )}
</div>
                    </td>
                  </tr>

                  {/* Lignes de commande */}
                  {detailId === liv.idLivraison && (
                    <tr>
                      <td colSpan={7} className="bg-base-200/50 px-8 py-3">
                        <p className="text-xs font-bold mb-2 flex items-center gap-1 text-primary">
                          <ClipboardList size={12} /> Produits de la commande #{liv.idCommande}
                        </p>
                        {(liv.commande?.lignes ?? []).length === 0 ? (
                          <p className="text-xs text-base-content/40">Aucune ligne de commande</p>
                        ) : (
                          <table className="table table-xs w-full">
                            <thead>
                              <tr className="bg-base-300/50">
                                <th>Produit</th>
                                <th className="text-right">Qté commandée</th>
                                <th className="text-right">Prix unitaire</th>
                                <th className="text-right">Sous-total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(liv.commande?.lignes ?? []).map((l, i) => (
                                <tr key={i} className="hover">
                                  <td className="font-semibold">
                                    {l.produit?.nomProduit ?? l.produit?.reference ?? `#${l.idProduit}`}
                                  </td>
                                  <td className="text-right">
                                    <span className="badge badge-ghost badge-sm">{l.quantite}</span>
                                  </td>
                                  <td className="text-right text-base-content/60">{fmt(l.prixUnitaire)} F</td>
                                  <td className="text-right font-bold text-primary">{fmt(l.sousTotal)} F</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal création/édition */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
            
            <div className="relative bg-base-100 w-full max-w-lg rounded-2xl overflow-hidden flex flex-col shadow-2xl"
                style={{ maxHeight: '90vh' }}>

                {/* Header */}
                <div className="bg-primary text-primary-content px-5 py-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/25 rounded-2xl"><Truck size={16} /></div>
                        <h3 className="font-extrabold">
                            {editItem ? "Modifier la livraison" : "Nouvelle livraison"}
                        </h3>
                    </div>
                    <button className="btn btn-ghost btn-sm btn-circle text-primary-content"
                        onClick={() => setShowModal(false)}>✕</button>
                </div>

                {/* Formulaire scrollable */}
                <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden" style={{ maxHeight: 'calc(90vh - 70px)' }}>
                  <div className="p-5 space-y-4 overflow-y-auto flex-1">

                    {/* Commande */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium flex items-center gap-1">
                          <ClipboardList size={13} className="text-primary" /> Commande *
                        </span>
                      </label>
                      <select className="select select-bordered"
                        value={form.idCommande}
                        onChange={e => handleCommandeChange(e.target.value)}
                        required disabled={!!editItem}>
                        <option value="">-- Sélectionner une commande --</option>
                        {commandes
                          .filter(c => c.statut !== 'livree' || (editItem && c.idCommande === editItem.idCommande))
                          .map(c => (
                            <option key={c.idCommande} value={c.idCommande}>
                              CMD #{c.idCommande} — {c.statut} — {fmt(c.montantTotal)} F
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Produits à recevoir */}
                    {cmdSelectionnee && (cmdSelectionnee.lignes ?? []).length > 0 && (
                      <div className="bg-base-200/50 rounded-2xl p-3">
                        <p className="text-xs font-bold mb-2 flex items-center gap-1">
                          <Package size={12} className="text-primary" /> Produits à recevoir
                        </p>
                        <table className="table table-xs w-full">
                          <thead>
                            <tr className="bg-base-300/50">
                              <th>Produit</th>
                              <th className="text-right">Qté</th>
                              <th className="text-right">Prix unit.</th>
                              <th className="text-right">Sous-total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(cmdSelectionnee.lignes ?? []).map((l, i) => (
                              <tr key={i}>
                                <td className="font-semibold">
                                  {l.produit?.nomProduit ?? l.produit?.reference ?? `#${l.idProduit}`}
                                </td>
                                <td className="text-right">{l.quantite}</td>
                                <td className="text-right text-base-content/60">{fmt(l.prixUnitaire)} F</td>
                                <td className="text-right font-bold text-primary">{fmt(l.sousTotal)} F</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Date prévue (lecture seule) + Date réelle */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium flex items-center gap-1">
                                    <Calendar size={13} className="text-primary" /> Date prévue
                                </span>
                            </label>
                            <input type="date" className="input input-bordered bg-base-200/50"
                                value={form.dateLivraisonPrevue}
                                readOnly />
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium flex items-center gap-1">
                                    <Calendar size={13} className="text-primary" /> Date réelle *
                                </span>
                            </label>
                            <input type="date" className="input input-bordered"
                                value={form.dateLivraison}
                                onChange={e => setForm(f => ({ ...f, dateLivraison: e.target.value }))}
                                required />
                        </div>
                    </div>

                    {/* Ponctualité calculée */}
                    {form.dateLivraison && form.dateLivraisonPrevue && (() => {
                        const reel  = new Date(form.dateLivraison)
                        const prevu = new Date(form.dateLivraisonPrevue)
                        const diff  = Math.round((reel - prevu) / (1000 * 60 * 60 * 24))
                        const config = diff < 0
                            ? { label: `${Math.abs(diff)} jour(s) en avance`, cls: 'alert-success' }
                            : diff === 0
                            ? { label: 'Livré à temps ✓', cls: 'alert-success' }
                            : { label: `${diff} jour(s) de retard`, cls: 'alert-warning' }
                        return (
                            <div className={`alert ${config.cls} py-2 text-sm`}>
                                <span>{config.label}</span>
                            </div>
                        )
                    })()}

                    {/* Montant total */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">Montant total (FCFA)</span>
                      </label>
                      <input type="number" min="0" step="0.01" className="input input-bordered"
                        value={form.montantTotal}
                        onChange={e => setForm(f => ({ ...f, montantTotal: e.target.value }))} />
                    </div>

                    {/* Statut */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">Statut *</span>
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        {STATUTS.map(s => (
                          <button key={s} type="button"
                            onClick={() => setForm(f => ({ ...f, statut: s }))}
                            className={`btn btn-sm gap-1 ${form.statut === s
                              ? STATUT_CONFIG[s]?.btnClass
                              : 'btn-ghost border border-base-300'}`}>
                            {STATUT_CONFIG[s]?.icon}
                            {STATUT_CONFIG[s]?.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Observations */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">Observations</span>
                      </label>
                      <textarea className="textarea textarea-bordered rounded-2xl" rows={3}
                        value={form.observations}
                        onChange={e => setForm(f => ({ ...f, observations: e.target.value }))}
                        placeholder="Notes sur la livraison..." />
                    </div>
                  </div>

                  {/* Boutons fixés en bas */}
                  <div className="flex justify-end gap-2 px-5 py-4 border-t border-base-200 shrink-0 bg-base-100">
                      <button type="button" className="btn btn-ghost"
                          onClick={() => setShowModal(false)} disabled={saving}>
                          Annuler
                      </button>
                      <button type="submit" className="btn btn-primary" disabled={saving}>
                          {saving && <span className="loading loading-spinner loading-xs" />}
                          {editItem ? "Modifier" : "Enregistrer"}
                      </button>
                  </div>
                </form>
            </div>
        </div>,
        document.body
      )}

      {/* Confirmation suppression */}
      <ConfirmDeleteModal
        isOpen={!!delModal}
        label={`la livraison #${delModal}`}
        onConfirm={handleDelete}
        onClose={() => setDelModal(null)}
        loading={saving}
      />

    </div>
  )
}