import { useState, useMemo, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import {
  Plus, Search, Filter, Download, Eye, Trash2,
  ShoppingCart, DollarSign, TrendingUp, CreditCard,
  X, ChevronLeft, ChevronRight, AlertTriangle, Check
} from 'lucide-react'
import {
  createVente,
  deleteVente,
  getVente,
} from '../services/api'
import { useVentes, useProduits } from '../hooks'

/* ── Utilitaires ── */
const fmt = n => new Intl.NumberFormat('fr-FR').format(Math.round(n || 0))
const toISO = d => d.toISOString().split('T')[0]
const today = new Date()

const MODE_LABELS = {
  especes: { label: 'Espèces',  cls: 'badge-success' },
  carte:   { label: 'Carte',    cls: 'badge-info'    },
  credit:  { label: 'Crédit',   cls: 'badge-warning' },
}

const TVA_RATE = 18 // % — correspond au trigger trg_update_vente_total

/* ════════════════════════════════════
   MODAL : Détail d'une vente
════════════════════════════════════ */
function ModalDetail({ vente, onClose }) {
  if (!vente) return null
  const mode = MODE_LABELS[vente.modePaiement] ?? { label: vente.modePaiement, cls: 'badge-ghost' }
  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-lg">Vente #{vente.idVente}</h3>
          <button className="btn btn-ghost btn-sm btn-circle" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm text-base-content/50">
            {vente.dateVente ? new Date(vente.dateVente).toLocaleString('fr-FR') : '—'}
          </span>
          <span className={`badge ${mode.cls} font-semibold`}>{mode.label}</span>
        </div>

        {/* Lignes */}
        <div className="overflow-x-auto rounded-xl border border-base-200 mb-4">
          <table className="table table-sm w-full">
            <thead>
              <tr>
                <th>Produit</th>
                <th className="text-right">Qté</th>
                <th className="text-right">Prix unit.</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {(vente.lignes ?? []).length === 0
                ? <tr><td colSpan={4} className="text-center text-base-content/40 py-4">Aucune ligne</td></tr>
                : (vente.lignes ?? []).map(l => (
                    <tr key={l.idProduit}>
                      <td className="font-medium">{l.produit?.reference ?? `#${l.idProduit}`}</td>
                      <td className="text-right">{l.quantite}</td>
                      <td className="text-right">{fmt(l.produit?.prixUnitaire)} F</td>
                      <td className="text-right font-bold">{fmt(l.totalPartielle)} F</td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>

        {/* Totaux */}
        <div className="bg-base-200/50 rounded-xl p-4 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-base-content/60">Sous-total HT</span>
            <span className="font-semibold">{fmt(vente.totalHorsTaxe)} F</span>
          </div>
          <div className="flex justify-between">
            <span className="text-base-content/60">TVA (18%)</span>
            <span className="font-semibold">{fmt(vente.tva)} F</span>
          </div>
          <div className="divider my-1" />
          <div className="flex justify-between text-base font-extrabold">
            <span>Total TTC</span>
            <span className="text-success">{fmt(vente.totalTaxeComprise)} F</span>
          </div>
        </div>

        <div className="modal-action">
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Fermer</button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  )
}

/* ════════════════════════════════════
   MODAL : Nouvelle vente
════════════════════════════════════ */
function ModalNouvelleVente({ produits, onClose, onSuccess }) {
  const { user } = useAuth()
  const [modePaiement, setModePaiement] = useState('especes')
  const [lignes, setLignes] = useState([])          // { produit, quantite }
  const [search, setSearch] = useState('')
  const [qte, setQte] = useState(1)
  const [produitSelectionne, setProduitSelectionne] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const produitsFiltres = useMemo(() => {
    if (!search.trim()) return []
    return produits
      .filter(p =>
        p.reference?.toLowerCase().includes(search.toLowerCase()) ||
        p.codeBarre?.includes(search)
      )
      .slice(0, 6)
  }, [produits, search])

  const ajouterLigne = (produit) => {
    if (!produit) return
    setLignes(prev => {
      const exist = prev.find(l => l.produit.idProduit === produit.idProduit)
      if (exist) return prev.map(l =>
        l.produit.idProduit === produit.idProduit
          ? { ...l, quantite: l.quantite + qte }
          : l
      )
      return [...prev, { produit, quantite: qte }]
    })
    setSearch('')
    setProduitSelectionne(null)
    setQte(1)
  }

  const supprimerLigne = (idProduit) =>
    setLignes(prev => prev.filter(l => l.produit.idProduit !== idProduit))

  const updateQte = (idProduit, val) =>
    setLignes(prev => prev.map(l =>
      l.produit.idProduit === idProduit ? { ...l, quantite: Math.max(1, val) } : l
    ))

  /* Totaux calculés côté front (même logique que le trigger SQL) */
  const totalHT  = useMemo(() => lignes.reduce((s, l) => s + (parseFloat(l.produit.prixUnitaire) || 0) * l.quantite, 0), [lignes])
  const tva      = useMemo(() => Math.round(totalHT * TVA_RATE / 100 * 100) / 100, [totalHT])
  const totalTTC = useMemo(() => totalHT + tva, [totalHT, tva])

  const handleSubmit = async () => {
    if (lignes.length === 0) { setError('Ajoutez au moins un produit.'); return }
    setLoading(true)
    setError('')
    try {
      // 1. Créer la vente vide (sp_creer_vente)
      const resVente = await createVente({
        modePaiement,
        idUtilisateur: user.idUtilisateur,
        lignes: lignes.map(l => ({
          idProduit: l.produit.idProduit,
          quantite: l.quantite,
        }))
      })
      onSuccess(resVente.data)
      onClose()
    } catch (e) {
      setError(e.response?.data?.message ?? 'Erreur lors de la création de la vente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-extrabold text-lg">Nouvelle vente</h3>
            <p className="text-xs text-base-content/40">Caissier : {user?.prenom} {user?.nom}</p>
          </div>
          <button className="btn btn-ghost btn-sm btn-circle" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Mode paiement */}
        <div className="mb-4">
          <label className="label pb-1"><span className="label-text text-xs font-semibold uppercase tracking-wider">Mode de paiement</span></label>
          <div className="flex gap-2">
            {Object.entries(MODE_LABELS).map(([key, { label, cls }]) => (
              <button
                key={key}
                onClick={() => setModePaiement(key)}
                className={`btn btn-sm flex-1 ${modePaiement === key ? 'btn-primary' : 'btn-ghost border border-base-300'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Recherche produit */}
        <div className="mb-4">
          <label className="label pb-1"><span className="label-text text-xs font-semibold uppercase tracking-wider">Ajouter un produit</span></label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                className="input input-bordered input-sm w-full pr-8"
                placeholder="Référence ou code barre…"
                value={search}
                onChange={e => { setSearch(e.target.value); setProduitSelectionne(null) }}
              />
              {search && (
                <button className="absolute right-2 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
                  onClick={() => { setSearch(''); setProduitSelectionne(null) }}>
                  <X size={13} />
                </button>
              )}
              {/* Dropdown suggestions */}
              {produitsFiltres.length > 0 && (
                <ul className="absolute top-full left-0 right-0 bg-base-100 border border-base-200 rounded-xl shadow-lg z-50 mt-1 overflow-hidden">
                  {produitsFiltres.map(p => (
                    <li key={p.idProduit}>
                      <button
                        className="w-full text-left px-3 py-2 text-sm hover:bg-base-200 flex justify-between items-center"
                        onClick={() => { setProduitSelectionne(p); setSearch(p.reference) }}
                      >
                        <span className="font-medium">{p.reference}</span>
                        <span className="text-xs text-base-content/50">{fmt(p.prixUnitaire)} F</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <input
              type="number"
              min={1}
              value={qte}
              onChange={e => setQte(Math.max(1, parseInt(e.target.value) || 1))}
              className="input input-bordered input-sm w-20 text-center"
              placeholder="Qté"
            />
            <button
              className="btn btn-primary btn-sm"
              onClick={() => ajouterLigne(produitSelectionne)}
              disabled={!produitSelectionne}
            >
              <Plus size={14} /> Ajouter
            </button>
          </div>
        </div>

        {/* Lignes de vente */}
        <div className="rounded-xl border border-base-200 overflow-hidden mb-4">
          {lignes.length === 0
            ? <div className="py-8 text-center text-base-content/30 text-sm">Aucun produit ajouté</div>
            : <table className="table table-sm w-full">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th className="text-center w-24">Quantité</th>
                    <th className="text-right">Prix unit.</th>
                    <th className="text-right">Total</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {lignes.map(l => (
                    <tr key={l.produit.idProduit}>
                      <td className="font-medium">{l.produit.reference}</td>
                      <td>
                        <input
                          type="number"
                          min={1}
                          value={l.quantite}
                          onChange={e => updateQte(l.produit.idProduit, parseInt(e.target.value) || 1)}
                          className="input input-bordered input-xs w-full text-center"
                        />
                      </td>
                      <td className="text-right text-base-content/60">{fmt(l.produit.prixUnitaire)} F</td>
                      <td className="text-right font-bold">{fmt(parseFloat(l.produit.prixUnitaire) * l.quantite)} F</td>
                      <td>
                        <button className="btn btn-ghost btn-xs btn-circle text-error"
                          onClick={() => supprimerLigne(l.produit.idProduit)}>
                          <X size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </div>

        {/* Totaux */}
        {lignes.length > 0 && (
          <div className="bg-base-200/50 rounded-xl p-4 space-y-1.5 text-sm mb-4">
            <div className="flex justify-between">
              <span className="text-base-content/60">Sous-total HT</span>
              <span className="font-semibold">{fmt(totalHT)} F</span>
            </div>
            <div className="flex justify-between">
              <span className="text-base-content/60">TVA (18%)</span>
              <span className="font-semibold">{fmt(tva)} F</span>
            </div>
            <div className="divider my-1" />
            <div className="flex justify-between text-base font-extrabold">
              <span>Total TTC</span>
              <span className="text-success text-lg">{fmt(totalTTC)} F</span>
            </div>
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div className="alert alert-error alert-sm mb-3 py-2 text-sm">
            <AlertTriangle size={14} /> {error}
          </div>
        )}

        <div className="modal-action">
          <button className="btn btn-ghost btn-sm" onClick={onClose} disabled={loading}>Annuler</button>
          <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={loading || lignes.length === 0}>
            {loading ? <span className="loading loading-spinner loading-xs" /> : <Check size={14} />}
            Enregistrer la vente
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  )
}

/* ════════════════════════════════════
   PAGE PRINCIPALE
════════════════════════════════════ */
const PER_PAGE = 10

export default function Ventes() {
  const { data: ventes,   loading: lV, refetch } = useVentes()
  const { data: produits, loading: lP }           = useProduits()

  const [search,        setSearch]        = useState('')
  const [filterMode,    setFilterMode]    = useState('')
  const [dateDebut,     setDateDebut]     = useState('')
  const [dateFin,       setDateFin]       = useState('')
  const [page,          setPage]          = useState(1)
  const [modalNew,      setModalNew]      = useState(false)
  const [venteDetail,   setVenteDetail]   = useState(null)
  const [toast,         setToast]         = useState(null)   // { type, msg }
  const [confirmDel,    setConfirmDel]    = useState(null)   // idVente

  const showToast = useCallback((type, msg) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3500)
  }, [])

  /* ── Filtrage ── */
  const ventesFiltrees = useMemo(() => {
    return ventes.filter(v => {
      if (filterMode && v.modePaiement !== filterMode) return false
      if (search) {
        const s = search.toLowerCase()
        if (!String(v.idVente).includes(s) && !(v.modePaiement ?? '').includes(s)) return false
      }
      if (dateDebut && new Date(v.dateVente) < new Date(dateDebut)) return false
      if (dateFin   && new Date(v.dateVente) > new Date(dateFin + 'T23:59:59')) return false
      return true
    })
  }, [ventes, search, filterMode, dateDebut, dateFin])

  const totalPages = Math.max(1, Math.ceil(ventesFiltrees.length / PER_PAGE))
  const ventesPaged = ventesFiltrees.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  /* ── KPIs ── */
  const todayStr = toISO(today)
  const ventesAuj  = useMemo(() => ventes.filter(v => v.dateVente?.startsWith(todayStr)), [ventes])
  const caAuj      = useMemo(() => ventesAuj.reduce((s, v) => s + (parseFloat(v.totalTaxeComprise) || 0), 0), [ventesAuj])
  const caMois     = useMemo(() => {
    const debut = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
    return ventes
      .filter(v => v.dateVente >= debut)
      .reduce((s, v) => s + (parseFloat(v.totalTaxeComprise) || 0), 0)
  }, [ventes])
  const panierMoyen = useMemo(() =>
    ventes.length ? ventes.reduce((s, v) => s + (parseFloat(v.totalTaxeComprise) || 0), 0) / ventes.length : 0
  , [ventes])

  /* ── Suppression ── */
  const handleDelete = async (id) => {
    try {
      await deleteVente(id)
      showToast('success', `Vente #${id} supprimée.`)
      refetch()
    } catch {
      showToast('error', 'Impossible de supprimer cette vente.')
    }
    setConfirmDel(null)
  }

  /* ── Détail ── */
  const handleDetail = async (v) => {
    try {
      const res = await getVente(v.idVente)
      setVenteDetail(res.data)
    } catch {
      setVenteDetail(v)
    }
  }

  if (lV || lP) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-5">

        {/* ── Toast ── */}
        {toast && (
          <div className={`toast toast-top toast-end z-[100]`}>
            <div className={`alert ${toast.type === 'success' ? 'alert-success' : 'alert-error'} text-sm py-2`}>
              {toast.type === 'success' ? <Check size={14} /> : <AlertTriangle size={14} />}
              {toast.msg}
            </div>
          </div>
        )}

        {/* ── Header ── */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-base-content">Ventes</h1>
            <p className="text-xs text-base-content/40 mt-0.5">Historique et saisie des ventes</p>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-sm btn-ghost border border-base-300 gap-1.5">
              <Download size={14} /> Exporter
            </button>
            <button className="btn btn-sm btn-primary gap-1.5" onClick={() => setModalNew(true)}>
              <Plus size={14} /> Nouvelle vente
            </button>
          </div>
        </div>

        {/* ── KPIs ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-4 gap-1">
              <div className="p-2 rounded-xl bg-primary/10 text-primary w-fit mb-1">
                <ShoppingCart size={15} />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-base-content/40">Ventes auj.</p>
              <p className="text-2xl font-extrabold text-primary">{ventesAuj.length}</p>
              <p className="text-xs text-base-content/40">transactions</p>
            </div>
          </div>
          <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-4 gap-1">
              <div className="p-2 rounded-xl bg-secondary/10 text-secondary w-fit mb-1">
                <DollarSign size={15} />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-base-content/40">CA aujourd'hui</p>
              <p className="text-2xl font-extrabold text-secondary">{fmt(caAuj)} F</p>
              <p className="text-xs text-base-content/40">total TTC</p>
            </div>
          </div>
          <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-4 gap-1">
              <div className="p-2 rounded-xl bg-accent/10 text-accent w-fit mb-1">
                <TrendingUp size={15} />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-base-content/40">CA ce mois</p>
              <p className="text-2xl font-extrabold text-accent">{fmt(caMois)} F</p>
              <p className="text-xs text-base-content/40">{today.toLocaleDateString('fr-FR', { month: 'long' })}</p>
            </div>
          </div>
          <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-4 gap-1">
              <div className="p-2 rounded-xl bg-success/10 text-success w-fit mb-1">
                <CreditCard size={15} />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-base-content/40">Panier moyen</p>
              <p className="text-2xl font-extrabold text-success">{fmt(panierMoyen)} F</p>
              <p className="text-xs text-base-content/40">toutes ventes</p>
            </div>
          </div>
        </div>

        {/* ── Filtres ── */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
            <input
              type="text"
              placeholder="Rechercher…"
              className="input input-bordered input-sm pl-8 w-44"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <select
            className="select select-bordered select-sm w-36"
            value={filterMode}
            onChange={e => { setFilterMode(e.target.value); setPage(1) }}
          >
            <option value="">Tous les modes</option>
            <option value="especes">Espèces</option>
            <option value="carte">Carte</option>
            <option value="credit">Crédit</option>
          </select>
          <input type="date" className="input input-bordered input-sm w-36"
            value={dateDebut} onChange={e => { setDateDebut(e.target.value); setPage(1) }} />
          <input type="date" className="input input-bordered input-sm w-36"
            value={dateFin}   onChange={e => { setDateFin(e.target.value); setPage(1) }} />
          {(search || filterMode || dateDebut || dateFin) && (
            <button className="btn btn-ghost btn-sm gap-1 text-error"
              onClick={() => { setSearch(''); setFilterMode(''); setDateDebut(''); setDateFin(''); setPage(1) }}>
              <X size={13} /> Effacer
            </button>
          )}
          <span className="ml-auto text-xs text-base-content/40">{ventesFiltrees.length} vente(s)</span>
        </div>

        {/* ── Tableau ── */}
        <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table table-sm w-full">
              <thead>
                <tr>
                  <th className="w-16">#</th>
                  <th>Date</th>
                  <th>Mode paiement</th>
                  <th className="text-right">Montant HT</th>
                  <th className="text-right">TVA</th>
                  <th className="text-right">Total TTC</th>
                  <th className="text-right w-20">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ventesPaged.length === 0
                  ? <tr><td colSpan={7} className="text-center text-base-content/40 py-10">Aucune vente trouvée</td></tr>
                  : ventesPaged.map(v => {
                      const mode = MODE_LABELS[v.modePaiement] ?? { label: v.modePaiement, cls: 'badge-ghost' }
                      return (
                        <tr key={v.idVente} className="hover">
                          <td className="text-base-content/40 font-semibold">#{v.idVente}</td>
                          <td className="text-base-content/70">
                            {v.dateVente ? new Date(v.dateVente).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                          </td>
                          <td>
                            <span className={`badge ${mode.cls} badge-sm font-semibold`}>{mode.label}</span>
                          </td>
                          <td className="text-right font-semibold">{fmt(v.totalHorsTaxe)} F</td>
                          <td className="text-right text-base-content/50">{fmt(v.tva)} F</td>
                          <td className="text-right font-extrabold text-success">{fmt(v.totalTaxeComprise)} F</td>
                          <td className="text-right">
                            <div className="flex gap-1 justify-end">
                              <button className="btn btn-ghost btn-xs btn-circle tooltip" data-tip="Détail"
                                onClick={() => handleDetail(v)}>
                                <Eye size={13} />
                              </button>
                              <button className="btn btn-ghost btn-xs btn-circle text-error tooltip" data-tip="Supprimer"
                                onClick={() => setConfirmDel(v.idVente)}>
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                }
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-base-200 text-xs text-base-content/50">
              <span>{(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, ventesFiltrees.length)} sur {ventesFiltrees.length}</span>
              <div className="join">
                <button className="join-item btn btn-xs btn-ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft size={13} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…')
                    acc.push(p)
                    return acc
                  }, [])
                  .map((p, i) =>
                    p === '…'
                      ? <span key={`e${i}`} className="join-item btn btn-xs btn-ghost pointer-events-none">…</span>
                      : <button key={p} className={`join-item btn btn-xs ${page === p ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPage(p)}>{p}</button>
                  )
                }
                <button className="join-item btn btn-xs btn-ghost" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ── Modals ── */}
      {modalNew && (
        <ModalNouvelleVente
          produits={produits}
          onClose={() => setModalNew(false)}
          onSuccess={() => { showToast('success', 'Vente enregistrée avec succès !'); refetch() }}
        />
      )}

      {venteDetail && (
        <ModalDetail vente={venteDetail} onClose={() => setVenteDetail(null)} />
      )}

      {/* Confirm suppression */}
      {confirmDel && (
        <div className="modal modal-open">
          <div className="modal-box max-w-sm">
            <h3 className="font-extrabold text-base mb-2">Supprimer la vente #{confirmDel} ?</h3>
            <p className="text-sm text-base-content/60 mb-4">Cette action est irréversible.</p>
            <div className="modal-action">
              <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDel(null)}>Annuler</button>
              <button className="btn btn-error btn-sm" onClick={() => handleDelete(confirmDel)}>
                <Trash2 size={13} /> Supprimer
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setConfirmDel(null)} />
        </div>
      )}
    </Layout>
  )
}