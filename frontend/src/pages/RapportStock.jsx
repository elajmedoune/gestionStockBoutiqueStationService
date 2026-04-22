import { useState, useMemo } from 'react'
import Layout from '../components/Layout'
import { useStocks, useProduits, useCommandes, useLivraisons } from '../hooks'
import {
  Package, AlertTriangle, TrendingDown, TrendingUp,
  ArrowDownCircle, ArrowUpCircle, BarChart2,
  RefreshCw, Download, CalendarDays, X,
  ShieldAlert, CheckCircle, Clock, Layers,
  FileText, BoxSelect,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts'

/* ── Utilitaires ── */
const fmt   = n => new Intl.NumberFormat('fr-FR').format(Math.round(n || 0))
const toISO = d => d.toISOString().split('T')[0]
const today = new Date()

const PERIODES = [
  { label: '7J',   days: 7   },
  { label: '1M',   days: 30  },
  { label: '3M',   days: 90  },
  { label: '6M',   days: 180 },
  { label: '1An',  days: 365 },
  { label: 'Tout', days: null },
]

const COLORS_PIE = [
  'rgba(247,100,149,0.85)',
  'rgba(54,211,153,0.85)',
  'rgba(56,189,248,0.85)',
  'rgba(251,191,36,0.85)',
  'rgba(167,139,250,0.85)',
  'rgba(248,114,114,0.85)',
  'rgba(52,211,153,0.85)',
]

/* ── KpiCard ── */
function KpiCard({ label, value, sub, icon: Icon, colorClass, badgeClass, pulse }) {
  return (
    <div className="card bg-base-100 shadow-sm border border-base-200 hover:-translate-y-1 transition-transform duration-200">
      <div className="card-body p-4 gap-2">
        <div className="flex items-center justify-between">
          <div className={`p-2 rounded-xl ${badgeClass}`}>
            <Icon size={16} />
          </div>
          {pulse && <span className="badge badge-error badge-xs animate-pulse">!</span>}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-base-content/40">{label}</p>
          <p className={`text-2xl font-extrabold leading-tight ${colorClass}`}>{value}</p>
          <p className="text-xs text-base-content/40 mt-0.5">{sub}</p>
        </div>
      </div>
    </div>
  )
}

/* ── HeroBanner stock ── */
function HeroBanner({ stats, dateDebut, dateFin }) {
  return (
    <div className="card bg-gradient-to-br from-accent to-secondary text-primary-content shadow-lg overflow-hidden">
      <div className="card-body p-6 relative">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="mb-4 relative">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold opacity-80">Gestion des stocks</span>
            <span className="badge badge-sm bg-white/20 border-0 text-primary-content font-bold text-xs">RAPPORT</span>
          </div>
          <h1 className="text-2xl font-extrabold leading-tight mb-1">Rapport de Stock</h1>
          <p className="text-xs opacity-60 flex items-center gap-1">
            <CalendarDays size={10} />
            {dateDebut} → {dateFin}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map(({ label, value, ok }) => (
            <div key={label} className="bg-white/10 rounded-xl p-3 text-center border border-white/10">
              <p className="text-xs font-semibold uppercase tracking-wider opacity-50 truncate mb-1">{label}</p>
              <p className={`text-lg font-extrabold leading-none ${ok === false ? 'text-warning' : 'text-white'}`}>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Tooltip Recharts ── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 12px', fontSize: 11 }}>
      <p style={{ fontWeight: 700, color: '#166534', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#15803d' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
            {p.name}
          </span>
          <span style={{ fontWeight: 700, color: '#166534' }}>{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

/* ════════════════════════════════════════════ */
export default function RapportStock() {
  const { data: stocks,     loading: lS } = useStocks()
  const { data: produits,   loading: lP } = useProduits()
  const { data: commandes,  loading: lC } = useCommandes()
  const { data: livraisons, loading: lL } = useLivraisons()

  const [periodeActive, setPeriodeActive] = useState('1M')
  const [dateDebut, setDateDebut] = useState(() => {
    const d = new Date(today); d.setDate(d.getDate() - 30); return toISO(d)
  })
  const [dateFin, setDateFin] = useState(toISO(today))

  const handlePeriode = (p) => {
    setPeriodeActive(p.label)
    if (p.days === null) {
      setDateDebut(toISO(new Date(2020, 0, 1)))
    } else {
      const d = new Date(today)
      d.setDate(d.getDate() - p.days)
      setDateDebut(toISO(d))
    }
    setDateFin(toISO(today))
  }

  /* ── État des stocks ── */
  const stocksAvecProduit = useMemo(() =>
    stocks.filter(s => s.produit || produits.find(p => p.idProduit === s.idProduit)),
    [stocks, produits]
  )

  const enRupture     = useMemo(() => stocks.filter(s => (parseInt(s.quantiteRestante) || 0) === 0), [stocks])
  const sousSeuil     = useMemo(() => stocks.filter(s => {
    const restante = parseInt(s.quantiteRestante) || 0
    const seuil    = parseInt(s.seuilSecurite ?? s.seuilAlerte ?? 5)
    return restante > 0 && restante <= seuil
  }), [stocks])
  const enBonneSante  = useMemo(() => stocks.filter(s => {
    const restante = parseInt(s.quantiteRestante) || 0
    const seuil    = parseInt(s.seuilSecurite ?? s.seuilAlerte ?? 5)
    return restante > seuil
  }), [stocks])

  const totalUnites   = useMemo(() => stocks.reduce((s, st) => s + (parseInt(st.quantiteRestante) || 0), 0), [stocks])
  const totalInitial  = useMemo(() => stocks.reduce((s, st) => s + (parseInt(st.quantiteInitiale) || 0), 0), [stocks])
  const tauxConsomm   = totalInitial > 0 ? Math.round(((totalInitial - totalUnites) / totalInitial) * 100) : 0

  /* ── Entrées (livraisons reçues dans la période) ── */
  const livraisonsFiltrees = useMemo(() => livraisons.filter(l => {
    const d = (l.dateLivraison ?? l.createdAt ?? '').split('T')[0]
    return d >= dateDebut && d <= dateFin
  }), [livraisons, dateDebut, dateFin])

  /* ── Commandes dans la période ── */
  const commandesFiltrees = useMemo(() => commandes.filter(c => {
    const d = (c.dateCommande ?? c.createdAt ?? '').split('T')[0]
    return d >= dateDebut && d <= dateFin
  }), [commandes, dateDebut, dateFin])

  /* ── Stocks par catégorie ── */
  const stockParCategorie = useMemo(() => {
    const map = {}
    produits.forEach(p => {
      const cat  = p.categorie?.libelle ?? p.categorie?.nom ?? 'Autre'
      const stk  = stocks.filter(s => s.idProduit === p.idProduit)
      const qte  = stk.reduce((s, st) => s + (parseInt(st.quantiteRestante) || 0), 0)
      if (!map[cat]) map[cat] = { cat, quantite: 0, produits: 0 }
      map[cat].quantite += qte
      map[cat].produits += 1
    })
    return Object.values(map).sort((a, b) => b.quantite - a.quantite)
  }, [produits, stocks])

  /* ── Top produits les plus consommés ── */
  const topConsommes = useMemo(() => {
    return stocks
      .map(s => {
        const init     = parseInt(s.quantiteInitiale) || 0
        const restante = parseInt(s.quantiteRestante) || 0
        const consomme = init - restante
        const produit  = produits.find(p => p.idProduit === s.idProduit)
        return { nom: produit?.nomProduit ?? produit?.reference ?? `#${s.idProduit}`, consomme, restante, init }
      })
      .filter(x => x.consomme > 0)
      .sort((a, b) => b.consomme - a.consomme)
      .slice(0, 8)
  }, [stocks, produits])

  /* ── Mouvements entrées/sorties par jour ── */
  const mouvementsParJour = useMemo(() => {
    const map = {}
    livraisonsFiltrees.forEach(l => {
      const d = (l.dateLivraison ?? l.createdAt ?? '').split('T')[0]
      const label = new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
      if (!map[label]) map[label] = { jour: label, _ts: new Date(d).getTime(), entrees: 0, sorties: 0 }
      const qte = l.lignes?.reduce((s, lg) => s + (parseInt(lg.quantiteLivree ?? lg.quantite) || 0), 0) ?? 0
      map[label].entrees += qte
    })
    return Object.values(map).sort((a, b) => a._ts - b._ts)
  }, [livraisonsFiltrees])

  const loading = lS || lP || lC || lL
  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <span className="loading loading-spinner loading-lg text-accent" />
      </div>
    </Layout>
  )

  const tick = { fontSize: 9, fill: 'currentColor', opacity: 0.4 }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-5 font-sans">

        {/* ══ Hero ══ */}
        <HeroBanner
          dateDebut={dateDebut}
          dateFin={dateFin}
          stats={[
            { label: 'Produits',     value: produits.length                              },
            { label: 'Unités dispo', value: fmt(totalUnites)                             },
            { label: 'En rupture',   value: enRupture.length, ok: enRupture.length === 0 },
            { label: 'Sous seuil',   value: sousSeuil.length, ok: sousSeuil.length === 0 },
          ]}
        />

        {/* ══ Filtres période ══ */}
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-4">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
              <div className="flex gap-1.5 flex-wrap">
                {PERIODES.map(p => (
                  <button key={p.label} onClick={() => handlePeriode(p)}
                    className={`btn btn-xs rounded-lg font-bold ${periodeActive === p.label ? 'btn-accent' : 'btn-ghost'}`}>
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="hidden sm:block w-px h-5 bg-base-300" />
              <div className="flex items-center gap-2">
                <CalendarDays size={13} className="text-base-content/30" />
                <input type="date" className="input input-xs input-bordered rounded-lg"
                  value={dateDebut}
                  onChange={e => { setDateDebut(e.target.value); setPeriodeActive('') }} />
                <span className="text-base-content/30 text-xs">—</span>
                <input type="date" className="input input-xs input-bordered rounded-lg"
                  value={dateFin}
                  onChange={e => { setDateFin(e.target.value); setPeriodeActive('') }} />
              </div>
              <div className="ml-auto flex gap-2">
                {periodeActive === '' && (
                  <button className="btn btn-ghost btn-xs gap-1.5 text-error font-semibold"
                    onClick={() => {
                      setPeriodeActive('1M')
                      const d = new Date(today); d.setDate(d.getDate() - 30)
                      setDateDebut(toISO(d)); setDateFin(toISO(today))
                    }}>
                    <X size={12} /> Effacer filtres
                  </button>
                )}
                <button className="btn btn-ghost btn-xs gap-1.5 font-semibold">
                  <Download size={12} /> Exporter
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ══ KPIs ══ */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <KpiCard label="Total produits"   value={produits.length}       sub="références"           icon={Package}       colorClass="text-accent"   badgeClass="bg-accent/10 text-accent" />
          <KpiCard label="Unités en stock"  value={fmt(totalUnites)}      sub="quantités restantes"  icon={Layers}        colorClass="text-primary"  badgeClass="bg-primary/10 text-primary" />
          <KpiCard label="En rupture"       value={enRupture.length}      sub="stock à 0"            icon={TrendingDown}  colorClass={enRupture.length > 0 ? 'text-error' : 'text-success'}    badgeClass={enRupture.length > 0 ? 'bg-error/10 text-error' : 'bg-success/10 text-success'}   pulse={enRupture.length > 0} />
          <KpiCard label="Sous seuil"       value={sousSeuil.length}      sub="à réapprovisionner"   icon={ShieldAlert}   colorClass={sousSeuil.length > 0 ? 'text-warning' : 'text-success'}  badgeClass={sousSeuil.length > 0 ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'} pulse={sousSeuil.length > 0} />
          <KpiCard label="Taux consommation" value={`${tauxConsomm}%`}   sub="du stock initial"     icon={BarChart2}     colorClass="text-secondary" badgeClass="bg-secondary/10 text-secondary" />
          <KpiCard label="Livraisons reçues" value={livraisonsFiltrees.length} sub="sur la période"  icon={ArrowDownCircle} colorClass="text-info"   badgeClass="bg-info/10 text-info" />
        </div>

        {/* ══ Alertes stock ══ */}
        {(enRupture.length > 0 || sousSeuil.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Rupture */}
            {enRupture.length > 0 && (
              <div className="card bg-base-100 shadow-sm border border-error/30 overflow-hidden">
                <div className="card-body p-0">
                  <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-base-200 bg-error/5">
                    <AlertTriangle size={14} className="text-error" />
                    <h2 className="font-extrabold text-sm text-error">Ruptures de stock</h2>
                    <span className="badge badge-error badge-sm ml-auto">{enRupture.length}</span>
                  </div>
                  <div className="overflow-x-auto max-h-52 overflow-y-auto">
                    <table className="table table-xs w-full">
                      <thead><tr className="bg-base-200/50">
                        <th>Produit</th>
                        <th>Catégorie</th>
                        <th className="text-right">Stock initial</th>
                        <th className="text-center">Statut</th>
                      </tr></thead>
                      <tbody>
                        {enRupture.map((s, i) => {
                          const p = produits.find(pr => pr.idProduit === s.idProduit)
                          return (
                            <tr key={i} className="hover">
                              <td className="font-bold">{p?.nomProduit ?? p?.reference ?? `#${s.idProduit}`}</td>
                              <td className="text-base-content/50">{p?.categorie?.libelle ?? '—'}</td>
                              <td className="text-right">{fmt(s.quantiteInitiale)}</td>
                              <td className="text-center"><span className="badge badge-error badge-xs font-bold">Rupture</span></td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Sous seuil */}
            {sousSeuil.length > 0 && (
              <div className="card bg-base-100 shadow-sm border border-warning/30 overflow-hidden">
                <div className="card-body p-0">
                  <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-base-200 bg-warning/5">
                    <ShieldAlert size={14} className="text-warning" />
                    <h2 className="font-extrabold text-sm text-warning">Sous seuil de sécurité</h2>
                    <span className="badge badge-warning badge-sm ml-auto">{sousSeuil.length}</span>
                  </div>
                  <div className="overflow-x-auto max-h-52 overflow-y-auto">
                    <table className="table table-xs w-full">
                      <thead><tr className="bg-base-200/50">
                        <th>Produit</th>
                        <th className="text-right">Restant</th>
                        <th className="text-right">Seuil</th>
                        <th className="text-center">Urgence</th>
                      </tr></thead>
                      <tbody>
                        {sousSeuil.map((s, i) => {
                          const p       = produits.find(pr => pr.idProduit === s.idProduit)
                          const seuil   = parseInt(s.seuilSecurite ?? s.seuilAlerte ?? 5)
                          const restant = parseInt(s.quantiteRestante) || 0
                          const ratio   = Math.round((restant / seuil) * 100)
                          return (
                            <tr key={i} className="hover">
                              <td className="font-bold">{p?.nomProduit ?? p?.reference ?? `#${s.idProduit}`}</td>
                              <td className="text-right font-extrabold text-warning">{restant}</td>
                              <td className="text-right text-base-content/50">{seuil}</td>
                              <td className="text-center">
                                <span className={`badge badge-xs font-bold ${ratio <= 30 ? 'badge-error' : 'badge-warning'}`}>
                                  {ratio <= 30 ? 'Critique' : 'Attention'}
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ Graphiques ══ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Stock par catégorie — Barres */}
          <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-5">
              <div className="mb-3">
                <h2 className="card-title text-base font-extrabold">Stock par catégorie</h2>
                <p className="text-xs text-base-content/40">{stockParCategorie.length} catégories</p>
              </div>
              {stockParCategorie.length === 0
                ? <div className="h-44 flex items-center justify-center text-base-content/30 text-sm">Aucune donnée</div>
                : <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stockParCategorie} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" vertical={false} />
                        <XAxis dataKey="cat" tick={tick} tickLine={false} axisLine={false} />
                        <YAxis tick={tick} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="quantite" name="Unités" fill="rgba(54,211,153,0.75)" radius={[6,6,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
              }
            </div>
          </div>

          {/* Répartition — Donut */}
          <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-5">
              <div className="mb-3">
                <h2 className="card-title text-base font-extrabold">Répartition du stock</h2>
                <p className="text-xs text-base-content/40">Par catégorie</p>
              </div>
              {stockParCategorie.length === 0
                ? <div className="h-44 flex items-center justify-center text-base-content/30 text-sm">Aucune donnée</div>
                : <div className="flex items-center gap-4 h-56">
                    <ResponsiveContainer width="60%" height="100%">
                      <PieChart>
                        <Pie data={stockParCategorie} dataKey="quantite" nameKey="cat"
                          cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                          {stockParCategorie.map((_, i) => (
                            <Cell key={i} fill={COLORS_PIE[i % COLORS_PIE.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v, n) => [fmt(v), n]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-col gap-1.5 overflow-y-auto max-h-52 w-40">
                      {stockParCategorie.map((c, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS_PIE[i % COLORS_PIE.length] }} />
                          <span className="truncate text-base-content/70 font-medium">{c.cat}</span>
                          <span className="ml-auto font-bold text-base-content shrink-0">{fmt(c.quantite)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
              }
            </div>
          </div>

          {/* Entrées de stock (livraisons) */}
          <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-5">
              <div className="mb-3">
                <h2 className="card-title text-base font-extrabold">Entrées de stock</h2>
                <p className="text-xs text-base-content/40">{livraisonsFiltrees.length} livraison(s) sur la période</p>
              </div>
              {mouvementsParJour.length === 0
                ? <div className="h-44 flex items-center justify-center text-base-content/30 text-sm">Aucune livraison sur la période</div>
                : <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mouvementsParJour} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" vertical={false} />
                        <XAxis dataKey="jour" tick={tick} tickLine={false} axisLine={false} />
                        <YAxis tick={tick} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="entrees" name="Unités reçues" fill="rgba(56,189,248,0.75)" radius={[6,6,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
              }
            </div>
          </div>

          {/* Top consommés */}
          <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-5">
              <div className="mb-3">
                <h2 className="card-title text-base font-extrabold">Top produits consommés</h2>
                <p className="text-xs text-base-content/40">Depuis le début du stock</p>
              </div>
              {topConsommes.length === 0
                ? <div className="h-44 flex items-center justify-center text-base-content/30 text-sm">Aucune consommation enregistrée</div>
                : <div className="space-y-2 overflow-y-auto max-h-56">
                    {topConsommes.map((p, i) => {
                      const ratio = p.init > 0 ? Math.round((p.consomme / p.init) * 100) : 0
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-xs font-black text-base-content/30 w-4 text-right shrink-0">{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-0.5">
                              <span className="text-xs font-bold truncate">{p.nom}</span>
                              <span className="text-xs text-base-content/50 shrink-0 ml-2">{fmt(p.consomme)} / {fmt(p.init)}</span>
                            </div>
                            <div className="w-full bg-base-200 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${ratio}%`, background: ratio >= 80 ? 'rgba(248,114,114,0.8)' : ratio >= 50 ? 'rgba(251,191,36,0.8)' : 'rgba(54,211,153,0.8)' }} />
                            </div>
                          </div>
                          <span className={`text-xs font-extrabold shrink-0 w-10 text-right ${ratio >= 80 ? 'text-error' : ratio >= 50 ? 'text-warning' : 'text-success'}`}>{ratio}%</span>
                        </div>
                      )
                    })}
                  </div>
              }
            </div>
          </div>
        </div>

        {/* ══ Tableau état complet des stocks ══ */}
        <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
          <div className="card-body p-0">
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-base-200">
              <div>
                <h2 className="font-extrabold text-sm">État complet des stocks</h2>
                <p className="text-xs text-base-content/40">{produits.length} produit(s) suivi(s)</p>
              </div>
              <FileText size={14} className="text-base-content/30" />
            </div>
            <div className="overflow-x-auto">
              <table className="table table-sm w-full">
                <thead className="text-xs">
                  <tr>
                    <th className="pl-5">Produit</th>
                    <th>Catégorie</th>
                    <th className="text-right">Stock initial</th>
                    <th className="text-right">Consommé</th>
                    <th className="text-right">Restant</th>
                    <th className="text-right">Seuil</th>
                    <th className="text-center pr-5">Statut</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {produits.length === 0
                    ? <tr><td colSpan={7} className="text-center text-base-content/40 py-10">Aucun produit</td></tr>
                    : produits.map((p, i) => {
                        const stk       = stocks.filter(s => s.idProduit === p.idProduit)
                        const initial   = stk.reduce((s, st) => s + (parseInt(st.quantiteInitiale) || 0), 0)
                        const restante  = stk.reduce((s, st) => s + (parseInt(st.quantiteRestante) || 0), 0)
                        const consomme  = initial - restante
                        const seuil     = stk[0] ? parseInt(stk[0].seuilSecurite ?? stk[0].seuilAlerte ?? 5) : 5
                        const statut    = restante === 0 ? 'rupture' : restante <= seuil ? 'critique' : 'ok'
                        return (
                          <tr key={i} className={`hover ${statut === 'rupture' ? 'bg-error/5' : statut === 'critique' ? 'bg-warning/5' : ''}`}>
                            <td className="pl-5 font-bold">{p.nomProduit ?? p.reference}</td>
                            <td className="text-base-content/50">{p.categorie?.libelle ?? p.categorie?.nom ?? '—'}</td>
                            <td className="text-right">{fmt(initial)}</td>
                            <td className="text-right text-base-content/60">{fmt(consomme)}</td>
                            <td className={`text-right font-extrabold ${statut === 'rupture' ? 'text-error' : statut === 'critique' ? 'text-warning' : 'text-success'}`}>
                              {fmt(restante)}
                            </td>
                            <td className="text-right text-base-content/40">{seuil}</td>
                            <td className="text-center pr-5">
                              {statut === 'rupture' && <span className="badge badge-error badge-xs font-bold">Rupture</span>}
                              {statut === 'critique' && <span className="badge badge-warning badge-xs font-bold">Critique</span>}
                              {statut === 'ok' && <span className="badge badge-success badge-xs font-bold">OK</span>}
                            </td>
                          </tr>
                        )
                      })
                  }
                </tbody>
                {produits.length > 0 && (
                  <tfoot>
                    <tr className="bg-base-200/50 text-xs font-black">
                      <td className="pl-5 py-3">TOTAL</td>
                      <td />
                      <td className="text-right">{fmt(totalInitial)}</td>
                      <td className="text-right text-base-content/60">{fmt(totalInitial - totalUnites)}</td>
                      <td className="text-right text-success">{fmt(totalUnites)}</td>
                      <td />
                      <td className="text-center pr-5">
                        <div className="flex gap-1 justify-center flex-wrap">
                          <span className="badge badge-success badge-xs">{enBonneSante.length} OK</span>
                          {sousSeuil.length > 0 && <span className="badge badge-warning badge-xs">{sousSeuil.length} ⚠</span>}
                          {enRupture.length > 0 && <span className="badge badge-error badge-xs">{enRupture.length} ✕</span>}
                        </div>
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>

        {/* ══ Historique livraisons ══ */}
        {livraisonsFiltrees.length > 0 && (
          <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
            <div className="card-body p-0">
              <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-base-200">
                <div>
                  <h2 className="font-extrabold text-sm flex items-center gap-2">
                    <ArrowDownCircle size={14} className="text-info" /> Historique des livraisons
                  </h2>
                  <p className="text-xs text-base-content/40">{livraisonsFiltrees.length} livraison(s) sur la période</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="table table-sm w-full">
                  <thead className="text-xs">
                    <tr>
                      <th className="pl-5">#</th>
                      <th>Date</th>
                      <th>Fournisseur</th>
                      <th>Commande</th>
                      <th className="text-center">Articles</th>
                      <th className="text-center pr-5">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {livraisonsFiltrees.slice(0, 20).map((l, i) => (
                      <tr key={i} className="hover">
                        <td className="pl-5 font-bold text-base-content/50">#{l.idLivraison}</td>
                        <td className="text-base-content/70">
                          {l.dateLivraison
                            ? new Date(l.dateLivraison).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                            : '—'}
                        </td>
                        <td className="font-semibold">{l.commande?.fournisseur?.nomFournisseur ?? l.fournisseur?.nomFournisseur ?? '—'}</td>
                        <td className="text-base-content/50">#{l.idCommande ?? '—'}</td>
                        <td className="text-center">
                          <span className="badge badge-info badge-xs font-bold">
                            {l.lignes?.length ?? 0} art.
                          </span>
                        </td>
                        <td className="text-center pr-5">
                          <span className={`badge badge-xs font-bold ${l.statut === 'livree' || l.statut === 'reçue' ? 'badge-success' : l.statut === 'partielle' ? 'badge-warning' : 'badge-ghost'}`}>
                            {l.statut ?? 'En cours'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  )
}à