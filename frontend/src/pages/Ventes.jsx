import { useState, useMemo, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import appConfig from '../config/app'
import {
  Plus, Search, Download, Eye, Ban, Printer,
  ShoppingCart, DollarSign, TrendingUp, CreditCard,
  X, ChevronLeft, ChevronRight, AlertTriangle, Check,
  Receipt, User, Calendar, Package
} from 'lucide-react'
import { createVente, deleteVente, getVente } from '../services/api'
import { exportTicketCaisse } from '../services/pdf'
import { useVentes, useProduits, useStocks } from '../hooks'

const fmt = n => new Intl.NumberFormat('fr-FR').format(Math.round(n || 0))
const toISO = d => d.toISOString().split('T')[0]
const today = new Date()

const MODE_LABELS = {
  especes: { label: 'Espèces',  cls: 'badge-success' },
  carte:   { label: 'Carte',    cls: 'badge-info'    },
  credit:  { label: 'Crédit',   cls: 'badge-warning' },
}

const TVA_RATE = 18

/* ════════════════════════════════════
   MODAL : Détail d'une vente
════════════════════════════════════ */
function ModalDetail({ vente, onClose }) {
  if (!vente) return null
  const mode = MODE_LABELS[vente.modePaiement] ?? { label: vente.modePaiement, cls: 'badge-ghost' }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Receipt size={18} className="text-primary" />
            </div>
            <h3 className="font-extrabold text-lg">Vente #{vente.idVente}</h3>
          </div>
          <button className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Infos */}
        <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-base-200/50 rounded-xl">
          <div className="flex items-center gap-1 text-sm text-base-content/60">
            <Calendar size={13} />
            {vente.dateVente ? new Date(vente.dateVente).toLocaleString('fr-FR') : '—'}
          </div>
          <span className={`badge ${mode.cls} font-semibold`}>{mode.label}</span>
          {vente.utilisateur && (
            <div className="flex items-center gap-1 text-sm text-base-content/60">
              <User size={13} />
              {vente.utilisateur.prenom} {vente.utilisateur.nom}
            </div>
          )}
        </div>

        {/* Lignes */}
        <div className="overflow-x-auto rounded-xl border border-base-200 mb-4">
          <table className="table table-sm w-full">
            <thead>
              <tr className="bg-base-200/50">
                <th>Produit</th>
                <th className="text-center">Qté</th>
                <th className="text-right">Prix unit.</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {(vente.lignes ?? []).length === 0
                ? <tr><td colSpan={4} className="text-center text-base-content/40 py-6">
                    <Package size={24} className="mx-auto mb-2 opacity-30" />
                    Aucune ligne
                  </td></tr>
                : (vente.lignes ?? []).map(l => (
                    <tr key={l.idProduit} className="hover">
                      <td className="font-semibold">{l.produit?.reference ?? `#${l.idProduit}`}</td>
                      <td className="text-center">
                        <span className="badge badge-ghost badge-sm">{l.quantite}</span>
                      </td>
                      <td className="text-right text-base-content/60">{fmt(l.produit?.prixUnitaire)} F</td>
                      <td className="text-right font-bold text-primary">{fmt(l.totalPartielle)} F</td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>

        {/* Totaux */}
        <div className="bg-base-200/50 rounded-xl p-4 space-y-2 text-sm">
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
            <span className="text-success text-lg">{fmt(vente.totalTaxeComprise)} F</span>
          </div>
        </div>

        <div className="modal-action">
          <button
          className="btn btn-primary btn-sm gap-2"
          onClick={() => exportTicketCaisse(vente)}
          >
            <Printer size={14} /> Ticket de caisse
            </button>
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
  const [lignes, setLignes] = useState([])
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
      ).slice(0, 6)
  }, [produits, search])
  
  const ajouterLigne = (produit) => {
    if (!produit) return
    const stockDispo = produit.stocks?.reduce((s, st) => s + (parseInt(st.quantiteInitiale) || 0), 0) ?? 0
    const qteExistante = lignes.find(l => l.produit.idProduit === produit.idProduit)?.quantite ?? 0
    if (qte + qteExistante > stockDispo) {
      setError(`Stock insuffisant. Disponible : ${stockDispo}`)
      return
    }
    setError('')
    setLignes(prev => {
      const exist = prev.find(l => l.produit.idProduit === produit.idProduit)
      if (exist) return prev.map(l =>
        l.produit.idProduit === produit.idProduit
          ? { ...l, quantite: l.quantite + qte } : l
      )
      return [...prev, { produit, quantite: qte }]
    })
    setSearch(''); setProduitSelectionne(null); setQte(1)
  }

  const supprimerLigne = id => setLignes(prev => prev.filter(l => l.produit.idProduit !== id))
  const updateQte = (id, val) => setLignes(prev => prev.map(l =>
    l.produit.idProduit === id ? { ...l, quantite: Math.max(1, val) } : l
  ))

  const totalHT  = useMemo(() => lignes.reduce((s, l) => s + (parseFloat(l.produit.prixUnitaire) || 0) * l.quantite, 0), [lignes])
  const tva      = useMemo(() => Math.round(totalHT * TVA_RATE / 100 * 100) / 100, [totalHT])
  const totalTTC = useMemo(() => totalHT + tva, [totalHT, tva])

  const handleSubmit = async () => {
    if (lignes.length === 0) { setError('Ajoutez au moins un produit.'); return }
    setLoading(true); setError('')
    try {
      const resVente = await createVente({
        modePaiement,
        idUtilisateur: user.idUtilisateur,
        lignes: lignes.map(l => ({ idProduit: l.produit.idProduit, quantite: l.quantite }))
      })
      onSuccess(resVente.data.data ?? resVente.data)
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
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-xl">
              <ShoppingCart size={18} className="text-primary" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg">Nouvelle vente</h3>
              <p className="text-xs text-base-content/40">Caissier : {user?.prenom} {user?.nom}</p>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm btn-circle" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Mode paiement */}
        <div className="mb-4">
          <label className="label pb-1">
            <span className="label-text text-xs font-bold uppercase tracking-wider">Mode de paiement</span>
          </label>
          <div className="flex gap-2">
            {Object.entries(MODE_LABELS).map(([key, { label }]) => (
              <button key={key} onClick={() => setModePaiement(key)}
                className={`btn btn-sm flex-1 ${modePaiement === key ? 'btn-primary' : 'btn-ghost border border-base-300'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Recherche produit */}
        <div className="mb-4">
          <label className="label pb-1">
            <span className="label-text text-xs font-bold uppercase tracking-wider">Ajouter un produit</span>
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
              <input type="text"
                className="input input-bordered input-sm w-full pl-8 pr-8"
                placeholder="Référence ou code barre…"
                value={search}
                onChange={e => { setSearch(e.target.value); setProduitSelectionne(null) }}
              />
              {search && (
                <button className="absolute right-2 top-1/2 -translate-y-1/2 text-base-content/40"
                  onClick={() => { setSearch(''); setProduitSelectionne(null) }}>
                  <X size={13} />
                </button>
              )}
              {produitsFiltres.length > 0 && (
                <ul className="absolute top-full left-0 right-0 bg-base-100 border border-base-200 rounded-xl shadow-lg z-50 mt-1 overflow-hidden">
                  {produitsFiltres.map(p => (
                    <li key={p.idProduit}>
                      <button className="w-full text-left px-3 py-2 text-sm hover:bg-base-200 flex justify-between items-center"
                        onClick={() => { setProduitSelectionne(p); setSearch(p.reference) }}>
                        <span className="font-medium">{p.reference}</span>
                        <div className="flex gap-2 items-center">
                          <span className="text-xs text-base-content/50 badge badge-ghost">{fmt(p.prixUnitaire)} F</span>
                          <span className="text-xs badge badge-outline badge-sm">
                            Stock: {p.stocks?.reduce((s, st) => s + (parseInt(st.quantiteRestante) || 0), 0) ?? 0}
                            </span>
                            </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <input type="number" min={1} value={qte}
              onChange={e => setQte(Math.max(1, parseInt(e.target.value) || 1))}
              className="input input-bordered input-sm w-20 text-center" placeholder="Qté" />
            <button className="btn btn-primary btn-sm gap-1"
              onClick={() => ajouterLigne(produitSelectionne)} disabled={!produitSelectionne}>
              <Plus size={14} /> Ajouter
            </button>
          </div>
        </div>

        {/* Lignes */}
        <div className="rounded-xl border border-base-200 overflow-hidden mb-4">
          {lignes.length === 0
            ? <div className="py-8 text-center text-base-content/30 text-sm">
                <Package size={24} className="mx-auto mb-2 opacity-30" />
                Aucun produit ajouté
              </div>
            : <table className="table table-sm w-full">
                <thead><tr className="bg-base-200/50">
                  <th>Produit</th>
                  <th className="text-center w-24">Quantité</th>
                  <th className="text-right">Prix unit.</th>
                  <th className="text-right">Total</th>
                  <th className="w-10"></th>
                </tr></thead>
                <tbody>
                  {lignes.map(l => (
                    <tr key={l.produit.idProduit} className="hover">
                      <td className="font-semibold">{l.produit.reference}</td>
                      <td>
                        <input type="number" min={1} value={l.quantite}
                          onChange={e => updateQte(l.produit.idProduit, parseInt(e.target.value) || 1)}
                          className="input input-bordered input-xs w-full text-center" />
                      </td>
                      <td className="text-right text-base-content/60">{fmt(l.produit.prixUnitaire)} F</td>
                      <td className="text-right font-bold text-primary">{fmt(parseFloat(l.produit.prixUnitaire) * l.quantite)} F</td>
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
          <div className="bg-base-200/50 rounded-xl p-4 space-y-2 text-sm mb-4">
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

        {error && (
          <div className="alert alert-error alert-sm mb-3 py-2 text-sm">
            <AlertTriangle size={14} /> {error}
          </div>
        )}

        <div className="modal-action">
          <button className="btn btn-ghost btn-sm" onClick={onClose} disabled={loading}>Annuler</button>
          <button className="btn btn-primary btn-sm gap-1" onClick={handleSubmit} disabled={loading || lignes.length === 0}>
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
  const { data: ventes, loading: lV, refetch: refetchVentes } = useVentes()
  const { data: produits, loading: lP, refetch: refetchProduits } = useProduits()
  const { refetch: refetchStocks } = useStocks()

  const refetchAll = useCallback(() => {
    refetchVentes()
    refetchProduits()
    refetchStocks()
  }, [refetchVentes, refetchProduits, refetchStocks])

  const [search,      setSearch]      = useState('')
  const [filterMode,  setFilterMode]  = useState('')
  const [dateDebut,   setDateDebut]   = useState('')
  const [dateFin,     setDateFin]     = useState('')
  const [page,        setPage]        = useState(1)
  const [modalNew,    setModalNew]    = useState(false)
  const [venteDetail, setVenteDetail] = useState(null)
  const [toast,       setToast]       = useState(null)
  const [confirmDel,  setConfirmDel]  = useState(null)

  const showToast = useCallback((type, msg) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3500)
  }, [])

  const ventesFiltrees = useMemo(() => ventes.filter(v => {
    if (filterMode && v.modePaiement !== filterMode) return false
    if (search) {
      const s = search.toLowerCase()
      if (!String(v.idVente).includes(s) && !(v.modePaiement ?? '').includes(s)) return false
    }
    if (dateDebut && new Date(v.dateVente) < new Date(dateDebut)) return false
    if (dateFin   && new Date(v.dateVente) > new Date(dateFin + 'T23:59:59')) return false
    return true
  }), [ventes, search, filterMode, dateDebut, dateFin])

  const totalPages  = Math.max(1, Math.ceil(ventesFiltrees.length / PER_PAGE))
  const ventesPaged = ventesFiltrees.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const todayStr    = toISO(today)
const ventesActives = useMemo(() => ventes.filter(v => v.statut !== 'annulee'), [ventes])
const ventesAuj   = useMemo(() => ventesActives.filter(v => v.dateVente?.startsWith(todayStr)), [ventesActives])
const caAuj       = useMemo(() => ventesAuj.reduce((s, v) => s + (parseFloat(v.totalTaxeComprise) || 0), 0), [ventesAuj])
const caMois      = useMemo(() => {
    const debut = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
    return ventesActives.filter(v => v.dateVente >= debut)
      .reduce((s, v) => s + (parseFloat(v.totalTaxeComprise) || 0), 0)
  }, [ventesActives])
const panierMoyen = useMemo(() =>
    ventesActives.length ? ventesActives.reduce((s, v) => s + (parseFloat(v.totalTaxeComprise) || 0), 0) / ventesActives.length : 0
  , [ventesActives])

const handleDelete = async (id) => {
  try {
    await deleteVente(id)
    showToast('success', `Vente #${id} annulée.`)
    refetchAll()
  } catch {
    showToast('error', 'Impossible d\'annuler cette vente.')
  }
  setConfirmDel(null)
}

  const handleDetail = async (v) => {
    try {
      const res = await getVente(v.idVente)
      setVenteDetail(res.data.data ?? res.data)
    } catch {
      setVenteDetail(v)
    }
  }

  const handleTicket = async (v) => {
  try {
    const res = await getVente(v.idVente)
    exportTicketCaisse(res.data.data ?? res.data)
  } catch {
    exportTicketCaisse(v)
  }
}

  if (lV || lP) return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-5">

        {/* Toast */}
        {toast && (
          <div className="toast toast-top toast-end z-[100]">
            <div className={`alert ${toast.type === 'success' ? 'alert-success' : 'alert-error'} text-sm py-2`}>
              {toast.type === 'success' ? <Check size={14} /> : <AlertTriangle size={14} />}
              {toast.msg}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-base-content flex items-center gap-2">
              <ShoppingCart size={22} className="text-primary" /> Ventes
            </h1>
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

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Ventes auj.', value: ventesAuj.length, sub: 'transactions', icon: <ShoppingCart size={15} />, color: 'primary' },
            { label: "CA aujourd'hui", value: `${fmt(caAuj)} F`, sub: 'total TTC', icon: <DollarSign size={15} />, color: 'secondary' },
            { label: 'CA ce mois', value: `${fmt(caMois)} F`, sub: today.toLocaleDateString('fr-FR', { month: 'long' }), icon: <TrendingUp size={15} />, color: 'accent' },
            { label: 'Panier moyen', value: `${fmt(panierMoyen)} F`, sub: 'toutes ventes', icon: <CreditCard size={15} />, color: 'success' },
          ].map((kpi, i) => (
            <div key={i} className="card bg-base-100 shadow-sm border border-base-200">
              <div className="card-body p-4 gap-1">
                <div className={`p-2 rounded-xl bg-${kpi.color}/10 text-${kpi.color} w-fit mb-1`}>
                  {kpi.icon}
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-base-content/40">{kpi.label}</p>
                <p className={`text-2xl font-extrabold text-${kpi.color}`}>{kpi.value}</p>
                <p className="text-xs text-base-content/40">{kpi.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
            <input type="text" placeholder="Rechercher…"
              className="input input-bordered input-sm pl-8 w-44"
              value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <select className="select select-bordered select-sm w-36"
            value={filterMode} onChange={e => { setFilterMode(e.target.value); setPage(1) }}>
            <option value="">Tous les modes</option>
            <option value="especes">Espèces</option>
            <option value="carte">Carte</option>
            <option value="credit">Crédit</option>
          </select>
          <input type="date" className="input input-bordered input-sm w-36"
            value={dateDebut} onChange={e => { setDateDebut(e.target.value); setPage(1) }} />
          <input type="date" className="input input-bordered input-sm w-36"
            value={dateFin} onChange={e => { setDateFin(e.target.value); setPage(1) }} />
          {(search || filterMode || dateDebut || dateFin) && (
            <button className="btn btn-ghost btn-sm gap-1 text-error"
              onClick={() => { setSearch(''); setFilterMode(''); setDateDebut(''); setDateFin(''); setPage(1) }}>
              <X size={13} /> Effacer
            </button>
          )}
          <span className="ml-auto text-xs text-base-content/40">{ventesFiltrees.length} vente(s)</span>
        </div>

        {/* Tableau */}
        <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table table-sm w-full">
              <thead>
                <tr className="bg-base-200/50">
                  <th>#</th>
                  <th>Date</th>
                  <th>Caissier</th>
                  <th>Mode</th>
                  <th>Produits</th>
                  <th className="text-right">HT</th>
                  <th className="text-right">TVA</th>
                  <th className="text-right">TTC</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ventesPaged.length === 0
                  ? <tr><td colSpan={9} className="text-center text-base-content/40 py-10">Aucune vente trouvée</td></tr>
                  : ventesPaged.map(v => {
                      const mode = MODE_LABELS[v.modePaiement] ?? { label: v.modePaiement, cls: 'badge-ghost' }
                      const lignes = v.lignes ?? []
                      return (
                        <tr key={v.idVente} className={`hover ${v.statut === 'annulee' ? 'opacity-50' : ''}`}>
                          <td className="font-bold text-base-content/50">#{v.idVente}</td>
                          <td className="text-base-content/70 text-xs">
                            {v.dateVente ? new Date(v.dateVente).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                          </td>
                          <td className="text-xs">
                            {v.utilisateur ? `${v.utilisateur.prenom} ${v.utilisateur.nom}` : '—'}
                          </td>
                          <td>
                            <span className={`badge ${mode.cls} badge-sm font-semibold`}>{mode.label}</span>
                          </td>
                          <td className="max-w-xs">
                            {lignes.length === 0
                              ? <span className="text-base-content/30 text-xs">—</span>
                              : <div className="flex flex-wrap gap-1">
                                  {lignes.slice(0, 3).map(l => (
                                    <span key={l.idProduit} className="badge badge-ghost badge-xs">
                                      {l.produit?.reference ?? `#${l.idProduit}`} ×{l.quantite}
                                    </span>
                                  ))}
                                  {lignes.length > 3 && (
                                    <span className="badge badge-ghost badge-xs">+{lignes.length - 3}</span>
                                  )}
                                </div>
                            }
                          </td>
                          <td className="text-right font-semibold text-xs">{fmt(v.totalHorsTaxe)} F</td>
                          <td className="text-right text-base-content/50 text-xs">{fmt(v.tva)} F</td>
                          <td className="text-right font-extrabold text-success">{fmt(v.totalTaxeComprise)} F</td>
                          <td className="text-right">
                            <div className="flex gap-1 justify-end">
                              {v.statut === 'annulee' ? (
                                <span className="badge badge-error badge-sm">Annulée</span>
                              ) : (
                              <>
                              <button className="btn btn-ghost btn-xs btn-circle tooltip" data-tip="Détail"
                              onClick={() => handleDetail(v)}>
                                <Eye size={13} />
                                </button>
                                <button className="btn btn-ghost btn-xs btn-circle tooltip text-primary" data-tip="Ticket de caisse"
                                onClick={() => handleTicket(v)}>
                                  <Printer size={13} />
                                  </button>
                                  <button className="btn btn-ghost btn-xs btn-circle text-warning tooltip" data-tip="Annuler"
                                  onClick={() => setConfirmDel(v.idVente)}>
                                    <Ban size={13} />
                                    </button>
                                    </>
                                  )}
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
                    acc.push(p); return acc
                  }, [])
                  .map((p, i) => p === '…'
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

      {/* Modals */}
      {modalNew && (
        <ModalNouvelleVente produits={produits}
          onClose={() => setModalNew(false)}
          onSuccess={() => { showToast('success', 'Vente enregistrée !'); refetchAll() }} />
      )}

      {venteDetail && (
        <ModalDetail vente={venteDetail} onClose={() => setVenteDetail(null)} />
      )}

      {confirmDel && (
        <div className="modal modal-open">
          <div className="modal-box max-w-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-warning/10 rounded-xl">
                <Ban size={18} className="text-warning" />
              </div>
              <h3 className="font-extrabold text-base">Annuler la vente #{confirmDel} ?</h3>
            </div>
            <p className="text-sm text-base-content/60 mb-4">La vente sera marquée comme annulée. Cette action est irréversible.</p>
            <div className="modal-action">
              <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDel(null)}>Retour</button>
              <button className="btn btn-warning btn-sm gap-1" onClick={() => handleDelete(confirmDel)}>
                <Ban size={13} /> Confirmer l'annulation
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setConfirmDel(null)} />
        </div>
      )}
    </Layout>
  )
}