import { useState, useMemo, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import appConfig from '../config/app'
import { useRef, useEffect } from 'react'
import {
  Plus, Search, Download, Eye, Ban, Printer,
  ShoppingCart, DollarSign, TrendingUp, CreditCard,
  X, ChevronLeft, ChevronRight, AlertTriangle, Check,
  Receipt, User, Calendar, Package, Trash2
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
  mobile_money: { label: 'Mobile Money', cls: 'badge-warning' },
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
  const [categorieActive, setCategorieActive] = useState('tous')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [flashId, setFlashId] = useState(null)
  const searchRef = useRef(null)
 
  // ── Focus automatique sur la barre de recherche (pour le scan)
  useEffect(() => {
    setTimeout(() => searchRef.current?.focus(), 100)
  }, [])
 
  // ── Catégories extraites depuis les produits
  const categories = useMemo(() => {
    const cats = {}
    produits.forEach(p => {
      if (p.categorie) cats[p.categorie.idCategorie] = p.categorie.libelle ?? p.categorie.nom ?? 'Autre'
    })
    return cats
  }, [produits])
 
  // ── Produits filtrés par catégorie + recherche
  const produitsFiltres = useMemo(() => {
    return produits.filter(p => {
      const matchCat = categorieActive === 'tous' || String(p.categorie?.idCategorie) === String(categorieActive)
      const matchSearch = !search.trim() ||
        p.reference?.toLowerCase().includes(search.toLowerCase()) ||
        p.codeBarre?.includes(search) ||
        p.nomProduit?.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [produits, search, categorieActive])
 
  // ── Stock disponible d'un produit
  const stockDispo = (produit) =>
    produit.stocks?.reduce((s, st) => s + (parseInt(st.quantiteRestante) || 0), 0) ?? 0
 
  // ── Ajouter au panier
  const ajouterLigne = useCallback((produit, qte = 1) => {
    if (!produit) return
    const dispo = stockDispo(produit)
    const qteExistante = lignes.find(l => l.produit.idProduit === produit.idProduit)?.quantite ?? 0
    if (qteExistante + qte > dispo) {
      setError(`Stock insuffisant pour "${produit.reference}". Disponible : ${dispo}`)
      setTimeout(() => setError(''), 3000)
      return
    }
    setError('')
    setFlashId(produit.idProduit)
    setTimeout(() => setFlashId(null), 400)
    setLignes(prev => {
      const exist = prev.find(l => l.produit.idProduit === produit.idProduit)
      if (exist) return prev.map(l =>
        l.produit.idProduit === produit.idProduit ? { ...l, quantite: l.quantite + qte } : l
      )
      return [...prev, { produit, quantite: qte }]
    })
  }, [lignes])
 
  // ── Scan code barre : Enter dans la barre de recherche
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      const produit = produits.find(p => p.codeBarre === search.trim())
      if (produit) {
        ajouterLigne(produit)
        setSearch('')
      } else if (produitsFiltres.length === 1) {
        ajouterLigne(produitsFiltres[0])
        setSearch('')
      } else {
        setError('Produit non trouvé')
        setTimeout(() => setError(''), 2000)
      }
    }
  }
 
  const supprimerLigne = (id) => setLignes(prev => prev.filter(l => l.produit.idProduit !== id))
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
      <div className="modal-box max-w-6xl w-full h-[90vh] p-0 overflow-hidden flex flex-col">
 
        {/* ── HEADER */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-base-200 bg-base-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-xl">
              <ShoppingCart size={18} className="text-primary" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">Nouvelle vente</h3>
              <p className="text-xs text-base-content/40">
              {user?.role === 'gerant' ? 'Gérant' : 
               user?.role === 'gestionnaire_stock' ? 'Gestionnaire' : 'Caissier'} : {user?.prenom} {user?.nom}
              </p>
            </div>
          </div>
 
          {/* Mode paiement */}
          <div className="flex gap-1">
            {Object.entries(MODE_LABELS).map(([key, { label }]) => (
              <button key={key} onClick={() => setModePaiement(key)}
                className={`btn btn-xs ${modePaiement === key ? 'btn-primary' : 'btn-ghost border border-base-300'}`}>
                {label}
              </button>
            ))}
          </div>
 
          <button className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
 
        {/* ── BODY : 2 colonnes */}
        <div className="flex flex-1 overflow-hidden">
 
          {/* ══ COLONNE GAUCHE : Produits */}
          <div className="flex flex-col flex-1 overflow-hidden border-r border-base-200">
 
            {/* Barre de recherche + scan */}
            <div className="px-4 py-3 border-b border-base-200 shrink-0">
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', zIndex: 10 }} />
                <input
                  ref={searchRef}
                  type="text"
                  className="input input-bordered input-sm w-full"
                  style={{ paddingLeft: 36 }}
                  placeholder="Rechercher par nom, référence ou scanner le code barre…"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setError('') }}
                  onKeyDown={handleSearchKeyDown}
                />
                {search && (
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
                    onClick={() => setSearch('')}>
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>
 
            {/* Filtres catégories */}
            <div className="flex gap-2 px-4 py-2 border-b border-base-200 overflow-x-auto shrink-0">
              <button
                onClick={() => setCategorieActive('tous')}
                className={`btn btn-xs shrink-0 ${categorieActive === 'tous' ? 'btn-primary' : 'btn-ghost border border-base-300'}`}>
                Tous
              </button>
              {Object.entries(categories).map(([id, libelle]) => (
                <button key={id}
                  onClick={() => setCategorieActive(id)}
                  className={`btn btn-xs shrink-0 ${categorieActive === String(id) ? 'btn-primary' : 'btn-ghost border border-base-300'}`}>
                  {libelle}
                </button>
              ))}
            </div>
 
            {/* Grille produits */}
            <div className="flex-1 overflow-y-auto p-4">
              {produitsFiltres.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-base-content/30">
                  <Package size={32} className="mb-2 opacity-30" />
                  <p className="text-sm">Aucun produit trouvé</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {produitsFiltres.map(p => {
                    const dispo = stockDispo(p)
                    const enPanier = lignes.find(l => l.produit.idProduit === p.idProduit)
                    const isFlash = flashId === p.idProduit
                    return (
                      <button
                        key={p.idProduit}
                        onClick={() => ajouterLigne(p)}
                        disabled={dispo === 0}
                        className={`
                          relative flex flex-col items-center text-center p-3 rounded-2xl border-2 transition-all duration-150
                          ${dispo === 0
                            ? 'opacity-40 cursor-not-allowed border-base-200 bg-base-200/50'
                            : isFlash
                              ? 'border-primary bg-primary/10 scale-95'
                              : enPanier
                                ? 'border-primary/50 bg-primary/5 hover:bg-primary/10'
                                : 'border-base-200 bg-base-100 hover:border-primary/40 hover:bg-base-200/50 hover:scale-[1.02]'
                          }
                        `}
                      >
                        {/* Badge panier */}
                        {enPanier && (
                          <div className="absolute -top-2 -right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-primary-content text-xs font-bold">{enPanier.quantite}</span>
                          </div>
                        )}
 
                        {/* Image produit */}
                        <div className="w-14 h-14 rounded-xl bg-base-200 flex items-center justify-center mb-2 overflow-hidden">
                          {p.photo
                            ? <img src={p.photo} alt={p.reference} className="w-full h-full object-cover" />
                            : <Package size={24} className="text-base-content/30" />
                          }
                        </div>
 
                        {/* Nom */}
                        <p className="text-xs font-bold leading-tight line-clamp-2 mb-1">
                          {p.nomProduit ?? p.reference}
                        </p>
 
                        {/* Prix */}
                        <p className="text-sm font-extrabold text-primary">{fmt(p.prixUnitaire)} F</p>
 
                        {/* Stock */}
                        <span className={`mt-1 text-xs badge badge-sm ${dispo === 0 ? 'badge-error' : dispo <= 5 ? 'badge-warning' : 'badge-ghost'}`}>
                          {dispo === 0 ? 'Rupture' : `Stock: ${dispo}`}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
 
          {/* ══ COLONNE DROITE : Panier */}
          <div className="w-72 flex flex-col bg-base-50 shrink-0">
 
            <div className="px-4 py-3 border-b border-base-200 shrink-0">
              <h4 className="font-extrabold text-sm flex items-center gap-2">
                <ShoppingCart size={14} className="text-primary" />
                Panier
                {lignes.length > 0 && (
                  <span className="badge badge-primary badge-sm">{lignes.length}</span>
                )}
              </h4>
            </div>
 
            {/* Lignes panier */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
              {lignes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-base-content/20">
                  <ShoppingCart size={28} className="mb-2" />
                  <p className="text-xs">Panier vide</p>
                </div>
              ) : lignes.map(l => (
                <div key={l.produit.idProduit}
                  className="flex items-center gap-2 p-2 bg-base-100 rounded-xl border border-base-200">
 
                  {/* Mini image */}
                  <div className="w-8 h-8 rounded-lg bg-base-200 flex items-center justify-center overflow-hidden shrink-0">
                    {l.produit.photo
                      ? <img src={l.produit.photo} alt="" className="w-full h-full object-cover" />
                      : <Package size={12} className="text-base-content/30" />
                    }
                  </div>
 
                  {/* Nom + prix */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{l.produit.nomProduit ?? l.produit.reference}</p>
                    <p className="text-xs text-base-content/50">{fmt(l.produit.prixUnitaire)} F</p>
                  </div>
 
                  {/* Quantité */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button className="btn btn-ghost btn-xs btn-circle w-5 h-5 min-h-0"
                    onClick={() => l.quantite === 1 ? supprimerLigne(l.produit.idProduit) : updateQte(l.produit.idProduit, l.quantite - 1)}>
                      {l.quantite === 1 
                        ? <Trash2 size={11} className="text-error" />
                        : <span className="text-xs">−</span>
                      }
                    </button>
                    <span className="text-xs font-bold w-5 text-center">{l.quantite}</span>
                    <button className="btn btn-ghost btn-xs btn-circle w-5 h-5 min-h-0"
                      onClick={() => ajouterLigne(l.produit)}>
                      <span className="text-xs">＋</span>
                    </button>
                  </div>
 
                  {/* Total ligne */}
                  <p className="text-xs font-extrabold text-primary shrink-0">
                    {fmt(parseFloat(l.produit.prixUnitaire) * l.quantite)} F
                  </p>
                </div>
              ))}
            </div>
 
            {/* Totaux + valider */}
            <div className="px-4 py-3 border-t border-base-200 shrink-0 space-y-2">
 
              {error && (
                <div className="alert alert-error py-1.5 text-xs">
                  <AlertTriangle size={12} /> {error}
                </div>
              )}
 
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-base-content/60">
                  <span>Sous-total HT</span>
                  <span className="font-semibold">{fmt(totalHT)} F</span>
                </div>
                <div className="flex justify-between text-base-content/60">
                  <span>TVA (18%)</span>
                  <span className="font-semibold">{fmt(tva)} F</span>
                </div>
                <div className="divider my-1" />
                <div className="flex justify-between text-base font-extrabold">
                  <span>Total TTC</span>
                  <span className="text-success text-lg">{fmt(totalTTC)} F</span>
                </div>
              </div>
 
              <div className="flex gap-2 pt-1">
                <button className="btn btn-ghost btn-sm flex-1" onClick={onClose} disabled={loading}>
                  Annuler
                </button>
                <button
                  className="btn btn-primary btn-sm flex-1 gap-1"
                  onClick={handleSubmit}
                  disabled={loading || lignes.length === 0}>
                  {loading
                    ? <span className="loading loading-spinner loading-xs" />
                    : <Check size={14} />
                  }
                  Valider
                </button>
              </div>
            </div>
          </div>
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
            <option value="mobile_money">Mobile Money</option>
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