import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useVentes, useProduits, useStocks, useCategories, useCommandes, useLivraisons, useUtilisateurs } from '../hooks'
import Layout from '../components/Layout'
import {
  TrendingUp, Package, AlertTriangle, DollarSign,
  ShoppingCart, ArrowUpDown, Trophy, Calendar, ChevronRight,
  Truck, Users, BarChart2, ShieldAlert, TrendingDown,
  Medal, Crown, Star,
} from 'lucide-react'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Tooltip, Legend, Filler,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Tooltip, Legend, Filler
)

/* ── Utilitaires ── */
const fmt   = n => new Intl.NumberFormat('fr-FR').format(Math.round(n || 0))
const toISO = d => d.toISOString().split('T')[0]
const today = new Date()
const il90  = new Date(); il90.setDate(today.getDate() - 89)
const il7   = new Date(); il7.setDate(today.getDate() - 6)

const PERIODS = [
  { label: '7J',   days: 7   },
  { label: '1M',   days: 30  },
  { label: '3M',   days: 90  },
  { label: 'Tout', days: null },
]

const DOUGHNUT_COLORS = ['#f9a8d4','#c084fc','#67e8f9','#86efac','#fcd34d','#fb923c','#f472b6']

const toDateKey = (ds, g) => {
  const d = new Date(ds)
  if (g === 'jour')    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
  if (g === 'semaine') {
    const j = new Date(d.getFullYear(), 0, 1)
    const w = Math.ceil(((d - j) / 86400000 + j.getDay() + 1) / 7)
    return `S${w} ${d.getFullYear()}`
  }
  return d.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
}

const generateLabels = (d1, d2, g) => {
  const labels = [], cur = new Date(d1), end = new Date(d2)
  while (cur <= end) {
    const k = toDateKey(cur.toISOString(), g)
    if (!labels.includes(k)) labels.push(k)
    if (g === 'jour')        cur.setDate(cur.getDate() + 1)
    else if (g === 'semaine') cur.setDate(cur.getDate() + 7)
    else                     cur.setMonth(cur.getMonth() + 1)
  }
  return labels
}

const buildCAData = (ventes, d1s, d2s, g) => {
  const d1 = new Date(d1s); d1.setHours(0,  0,  0,   0)
  const d2 = new Date(d2s); d2.setHours(23, 59, 59, 999)
  const labels = generateLabels(d1s, d2s, g)
  const map = {}; labels.forEach(l => { map[l] = 0 })
  ventes.forEach(v => {
    if (!v.dateVente) return
    const d = new Date(v.dateVente)
    if (d < d1 || d > d2) return
    const k = toDateKey(v.dateVente, g)
    if (k in map) map[k] += parseFloat(v.totalTaxeComprise || v.montantTotal) || 0
  })
  return { labels, data: labels.map(l => map[l]) }
}

/* ════════════════════════════════════
   COMPOSANTS PARTAGÉS
════════════════════════════════════ */

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

function HeroBanner({ user, stats }) {
  return (
    <div className="card bg-gradient-to-br from-primary to-secondary text-primary-content shadow-lg overflow-hidden">
      <div className="card-body p-6 relative">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="mb-4 relative">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold opacity-80">
              {user?.role === 'gerant' ? 'Administration' : 'Mon espace'}
            </span>
            <span className="badge badge-sm bg-white/20 border-0 text-primary-content font-bold text-xs">
              {(user?.role ?? '').toUpperCase()}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold leading-tight mb-1">
            {user?.prenom} {user?.nom}
          </h1>
          <p className="text-xs opacity-60 flex items-center gap-1">
            <Calendar size={10} />
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {stats.map(({ label, value, ok }) => (
            <div key={label} className="bg-white/10 rounded-xl p-3 text-center border border-white/10">
              <p className="text-xs font-semibold uppercase tracking-wider opacity-50 truncate mb-1">{label}</p>
              <p className={`text-lg font-extrabold leading-none ${ok === false ? 'text-warning' : 'text-primary-content'}`}>{value}</p>            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PeriodBar({ config, onChange }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {PERIODS.map(({ label, days }) => {
        const d1 = days ? new Date() : null
        if (d1) d1.setDate(d1.getDate() - (days - 1))
        const ad = days ? toISO(d1) : '2020-01-01'
        const isActive = config.dateDebut === ad && config.dateFin === toISO(today)
        return (
          <button key={label}
            onClick={() => onChange({ ...config, dateDebut: ad, dateFin: toISO(today) })}
            className={`btn btn-xs rounded-lg font-bold ${isActive ? 'btn-primary' : 'btn-ghost'}`}>
            {label}
          </button>
        )
      })}
    </div>
  )
}

const chartOpts = (cb) => ({
  responsive: true, maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#fff0f5', titleColor: '#9d174d', bodyColor: '#be185d',
      borderColor: '#fbcfe8', borderWidth: 1, padding: 10, cornerRadius: 8,
      callbacks: { label: cb }
    }
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#9ca3af', font: { size: 9 }, maxTicksLimit: 6 } },
    y: { grid: { color: '#fce7f3' }, ticks: { color: '#9ca3af', font: { size: 9 } }, beginAtZero: true }
  }
})

/* ════════════════════════════════════
   SECTIONS RÉUTILISABLES
════════════════════════════════════ */

/* Alertes stock */
function SectionAlertes({ alertes }) {
  return (
    <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
      <div className="card-body p-0">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-base-200">
          <h2 className="font-extrabold text-sm flex items-center gap-2">
            <AlertTriangle size={14} className="text-warning" /> Alertes stock
          </h2>
          <Link to="/alertes" className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline">
            Voir tout <ChevronRight size={11} />
          </Link>
        </div>
        {alertes.length === 0
          ? <div className="p-6 text-center">
              <div className="text-2xl mb-1">✓</div>
              <p className="text-xs text-base-content/40">Aucune alerte</p>
            </div>
          : alertes.slice(0, 5).map(p => (
              <div key={p.idProduit} className="flex items-center gap-3 px-5 py-2.5 border-b border-base-200/50 hover:bg-base-200/40 transition-colors">
                <span className="w-2 h-2 rounded-full bg-error shrink-0 animate-pulse" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{p.reference ?? p.nomProduit}</p>
                  <p className="text-xs text-base-content/40">Seuil : {p.seuilSecurite ?? 0}</p>
                </div>
                <span className="badge badge-error badge-sm font-bold">Critique</span>
              </div>
            ))
        }
      </div>
    </div>
  )
}

/* Stock par catégorie donut */
function SectionStockParCat({ stockParCat }) {
  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      <div className="card-body p-5">
        <h2 className="card-title text-sm font-extrabold">Stock par catégorie</h2>
        <p className="text-xs text-base-content/40 -mt-1 mb-2">Répartition actuelle</p>
        {stockParCat.labels.length === 0
          ? <div className="h-28 flex items-center justify-center text-base-content/30 text-sm">Aucune donnée</div>
          : <>
              <div className="h-32 flex items-center justify-center">
                <Doughnut
                  data={{ labels: stockParCat.labels, datasets: [{ data: stockParCat.data, backgroundColor: DOUGHNUT_COLORS, borderWidth: 3, borderColor: 'white' }] }}
                  options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { backgroundColor: '#fff0f5', titleColor: '#9d174d', bodyColor: '#be185d', borderColor: '#fbcfe8', borderWidth: 1, padding: 8, cornerRadius: 8 } }, cutout: '68%' }}
                />
              </div>
              <div className="mt-3 space-y-2">
                {stockParCat.labels.map((l, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: DOUGHNUT_COLORS[i] }} />
                        <span className="text-xs text-base-content/60 truncate">{l}</span>
                      </div>
                      <span className="text-xs font-bold ml-2 shrink-0">{fmt(stockParCat.data[i])}</span>
                    </div>
                    <div className="w-full bg-base-200 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full transition-all duration-500" style={{
                        background: DOUGHNUT_COLORS[i],
                        width: `${Math.round((stockParCat.data[i] / Math.max(...stockParCat.data)) * 100)}%`
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </>
        }
      </div>
    </div>
  )
}

/* Dernières ventes */
function SectionDernieresVentes({ ventes }) {
  return (
    <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
      <div className="card-body p-0">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-base-200">
          <h2 className="font-extrabold text-sm">Dernières ventes</h2>
          <Link to="/ventes" className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline">
            Voir tout <ChevronRight size={11} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="table table-sm w-full">
            <thead className="text-xs">
              <tr>
                <th>#</th><th>Date</th><th>Caissier</th><th>Mode</th>
                <th className="text-right">HT</th><th className="text-right">TVA</th><th className="text-right">TTC</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {ventes.length === 0
                ? <tr><td colSpan={7} className="text-center text-base-content/40 py-6">Aucune vente</td></tr>
                : ventes.map(v => (
                    <tr key={v.idVente} className="hover">
                      <td className="text-base-content/40 font-semibold">#{v.idVente}</td>
                      <td className="text-base-content/60 text-xs">
                        {v.dateVente ? new Date(v.dateVente).toLocaleDateString('fr-FR') : '—'}
                      </td>
                      <td className="text-xs">{v.utilisateur ? `${v.utilisateur.prenom} ${v.utilisateur.nom}` : '—'}</td>
                      <td><span className="badge badge-secondary badge-sm font-semibold">{v.modePaiement}</span></td>
                      <td className="text-right font-bold">{fmt(v.totalHorsTaxe)} F</td>
                      <td className="text-right text-base-content/50">{fmt(v.tva)} F</td>
                      <td className="text-right font-extrabold text-success">{fmt(v.totalTaxeComprise)} F</td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* Dernières livraisons */
function SectionDernieresLivraisons({ livraisons }) {
  return (
    <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
      <div className="card-body p-0">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-base-200">
          <h2 className="font-extrabold text-sm flex items-center gap-2">
            <Truck size={14} className="text-info" /> Dernières livraisons
          </h2>
          <Link to="/livraisons" className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline">
            Voir tout <ChevronRight size={11} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="table table-sm w-full">
            <thead className="text-xs">
              <tr><th>#</th><th>Date</th><th>Fournisseur</th><th>Articles</th><th className="text-center">Statut</th></tr>
            </thead>
            <tbody className="text-xs">
              {livraisons.length === 0
                ? <tr><td colSpan={5} className="text-center text-base-content/40 py-6">Aucune livraison</td></tr>
                : livraisons.slice(0, 6).map(l => (
                    <tr key={l.idLivraison} className="hover">
                      <td className="text-base-content/40 font-semibold">#{l.idLivraison}</td>
                      <td className="text-base-content/60">
                        {l.dateLivraison ? new Date(l.dateLivraison).toLocaleDateString('fr-FR') : '—'}
                      </td>
                      <td className="font-semibold">{l.commande?.fournisseur?.nomFournisseur ?? '—'}</td>
                      <td><span className="badge badge-info badge-sm">{l.lignes?.length ?? 0} art.</span></td>
                      <td className="text-center">
                        <span className={`badge badge-sm font-bold ${l.statut === 'livree' || l.statut === 'reçue' ? 'badge-success' : l.statut === 'partielle' ? 'badge-warning' : 'badge-ghost'}`}>
                          {l.statut ?? 'En cours'}
                        </span>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════
   DASHBOARD PAR RÔLE
════════════════════════════════════ */

/* ── GÉRANT ── */
function DashboardGerant({ ventes, produits, stocks, categories, caissiers, user }) {
  const [caConfig, setCaConfig] = useState({ dateDebut: toISO(il90), dateFin: toISO(today), groupBy: 'jour' })

  const ventesActives  = useMemo(() => ventes.filter(v => v.statut !== 'annulee'), [ventes])
  const caTotal        = useMemo(() => ventesActives.reduce((s, v) => s + (parseFloat(v.totalTaxeComprise || v.montantTotal) || 0), 0), [ventesActives])
  const ventesAuj      = useMemo(() => { const t = new Date().toDateString(); return ventesActives.filter(v => v.dateVente && new Date(v.dateVente).toDateString() === t) }, [ventesActives])
  const caAuj          = useMemo(() => ventesAuj.reduce((s, v) => s + (parseFloat(v.totalTaxeComprise || v.montantTotal) || 0), 0), [ventesAuj])
  const ca7j           = useMemo(() => ventesActives.filter(v => v.dateVente && new Date(v.dateVente) >= il7).reduce((s, v) => s + (parseFloat(v.totalTaxeComprise || v.montantTotal) || 0), 0), [ventesActives])
  const stockTotal     = useMemo(() => stocks.reduce((s, st) => s + (parseInt(st.quantiteRestante) || 0), 0), [stocks])

  const beneficeTotal  = useMemo(() => ventesActives.reduce((s, v) => s + (v.lignes?.reduce((ls, l) => {
    const pa = parseFloat(l.produit?.stocks?.[0]?.prixAchat || 0)
    return ls + (parseFloat(l.produit?.prixUnitaire || 0) - pa) * parseInt(l.quantite || 0)
  }, 0) || 0), 0), [ventesActives])

  const alertes = useMemo(() => produits.filter(p => {
    const qte = stocks.filter(s => s.idProduit === p.idProduit).reduce((s, st) => s + (parseInt(st.quantiteRestante) || 0), 0)
    return qte <= (parseInt(p.seuilSecurite) || 0)
  }), [produits, stocks])

  const topProduits = useMemo(() => {
    const map = {}
    ventesActives.forEach(v => v.lignes?.forEach(l => {
      const id = l.idProduit
      if (!map[id]) map[id] = { nom: l.produit?.reference ?? l.produit?.nomProduit ?? `#${id}`, qte: 0, total: 0 }
      map[id].qte   += parseInt(l.quantite) || 0
      map[id].total += parseFloat(l.totalPartielle) || 0
    }))
    return Object.values(map).sort((a, b) => b.qte - a.qte).slice(0, 6)
  }, [ventesActives])

  const topCaissiers = useMemo(() => {
    const map = {}
    ventesActives.forEach(v => {
      if (!v.utilisateur) return
      const id  = v.utilisateur.idUtilisateur
      const nom = `${v.utilisateur.prenom} ${v.utilisateur.nom}`
      if (!map[id]) map[id] = { nom, ventes: 0, ca: 0 }
      map[id].ventes += 1
      map[id].ca     += parseFloat(v.totalTaxeComprise || v.montantTotal || 0)
    })
    return Object.values(map).sort((a, b) => b.ca - a.ca).slice(0, 5)
  }, [ventesActives])

  const stockParCat = useMemo(() => {
    const map = {}
    categories.forEach(c => { map[c.idCategorie] = { name: c.libelle ?? c.nom, stock: 0 } })
    produits.forEach(p => {
      if (p.idCategorie && map[p.idCategorie]) {
        const qte = stocks.filter(s => s.idProduit === p.idProduit).reduce((s, st) => s + (parseInt(st.quantiteRestante) || 0), 0)
        map[p.idCategorie].stock += qte
      }
    })
    const entries = Object.values(map).filter(e => e.stock > 0)
    return { labels: entries.map(e => e.name), data: entries.map(e => e.stock) }
  }, [produits, stocks, categories])

  const caData    = useMemo(() => buildCAData(ventesActives, caConfig.dateDebut, caConfig.dateFin, caConfig.groupBy), [ventesActives, caConfig])
  const caPeriode = useMemo(() => caData.data.reduce((s, v) => s + v, 0), [caData])

  const MEDAL_ICONS = [
    <Crown size={13} className="text-yellow-500" />,
    <Medal size={13} className="text-gray-400" />,
    <Medal size={13} className="text-amber-600" />,
    <Star  size={13} className="text-base-content/30" />,
    <Star  size={13} className="text-base-content/30" />,
  ]

  return (
    <div className="space-y-5">
      <HeroBanner user={user} stats={[        { label: 'Ventes auj.', value: ventesAuj.length },
        { label: 'CA auj.',     value: `${fmt(caAuj)} F` },
        { label: 'CA 7j',       value: `${fmt(ca7j)} F` },
        { label: 'Bénéfice',    value: `${fmt(beneficeTotal)} F` },
        { label: 'Alertes',     value: alertes.length, ok: alertes.length === 0 },
      ]} />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiCard label="Total ventes"  value={ventes.length}        sub="transactions"    icon={ShoppingCart}  colorClass="text-primary"   badgeClass="bg-primary/10 text-primary" />
        <KpiCard label="CA global"     value={`${fmt(caTotal)} F`}  sub="toutes périodes" icon={DollarSign}    colorClass="text-secondary" badgeClass="bg-secondary/10 text-secondary" />
        <KpiCard label="Produits"      value={produits.length}      sub="références"      icon={Package}       colorClass="text-accent"    badgeClass="bg-accent/10 text-accent" />
        <KpiCard label="Stock total"   value={fmt(stockTotal)}      sub="unités"          icon={ArrowUpDown}   colorClass="text-success"   badgeClass="bg-success/10 text-success" />
        <KpiCard label="Alertes stock" value={alertes.length}       sub="sous seuil"      icon={AlertTriangle}
          colorClass={alertes.length > 0 ? 'text-warning' : 'text-success'}
          badgeClass={alertes.length > 0 ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}
          pulse={alertes.length > 0} />
      </div>

      {/* Graphique CA */}
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body p-5">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
            <div>
              <h2 className="card-title text-base font-extrabold">Chiffre d'affaires</h2>
              <p className="text-xs text-base-content/40">{fmt(caPeriode)} F sur la période</p>
            </div>
            <PeriodBar config={caConfig} onChange={setCaConfig} />
              {/* ✅ Dates personnalisées */}
  <div className="flex items-center gap-1.5">
    <input
      type="date"
      className="input input-xs input-bordered"
      value={caConfig.dateDebut}
      max={caConfig.dateFin}
      onChange={e => setCaConfig({ ...caConfig, dateDebut: e.target.value })}
    />
    <span className="text-xs text-base-content/40">→</span>
    <input
      type="date"
      className="input input-xs input-bordered"
      value={caConfig.dateFin}
      min={caConfig.dateDebut}
      max={toISO(today)}
      onChange={e => setCaConfig({ ...caConfig, dateFin: e.target.value })}
    />
  </div>

          </div>
          <div className="flex gap-1.5 mb-3">
            {['jour', 'semaine', 'mois'].map(g => (
              <button key={g} onClick={() => setCaConfig({ ...caConfig, groupBy: g })}
                className={`btn btn-xs rounded-lg font-bold ${caConfig.groupBy === g ? 'btn-secondary' : 'btn-ghost'}`}>
                {g === 'jour' ? 'Jour' : g === 'semaine' ? 'Semaine' : 'Mois'}
              </button>
            ))}
          </div>
          {caData.labels.length === 0
            ? <div className="h-44 flex items-center justify-center text-base-content/30 text-sm">Aucune vente sur la période</div>
            : <div className="h-56">
                <Bar data={{
                  labels: caData.labels,
                  datasets: [{ data: caData.data, backgroundColor: caData.data.map(v => v > 0 ? 'rgba(247,100,149,0.7)' : '#f3f4f6'), hoverBackgroundColor: caData.data.map(v => v > 0 ? '#f64395' : '#e5e7eb'), borderRadius: 6, borderSkipped: false }]
                }} options={chartOpts(ctx => ` ${fmt(ctx.raw)} F`)} />
              </div>
          }
        </div>
      </div>

      {/* 3 colonnes : stock + top produits + top caissiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <SectionStockParCat stockParCat={stockParCat} />

        {/* Top produits */}
        <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
          <div className="card-body p-0">
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-base-200">
              <div>
                <h2 className="font-extrabold text-sm">Top produits</h2>
                <p className="text-xs text-base-content/40">Les plus vendus</p>
              </div>
              <Trophy size={14} className="text-warning" />
            </div>
            {topProduits.length === 0
              ? <div className="p-6 text-center text-sm text-base-content/40">Aucune vente</div>
              : topProduits.map((p, i) => (
                  <div key={p.nom} className="flex items-center gap-3 px-5 py-2.5 border-b border-base-200/50 hover:bg-base-200/40 transition-colors">
                    <span className="text-xs font-black text-base-content/30 w-4">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{p.nom}</p>
                      <p className="text-xs text-base-content/40">{fmt(p.total)} F</p>
                    </div>
                    <span className="badge badge-primary badge-sm font-bold">×{p.qte}</span>
                  </div>
                ))
            }
          </div>
        </div>

        {/* Top caissiers */}
        <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
          <div className="card-body p-0">
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-base-200">
              <div>
                <h2 className="font-extrabold text-sm">Top caissiers</h2>
                <p className="text-xs text-base-content/40">Par chiffre d'affaires</p>
              </div>
              <Crown size={14} className="text-yellow-500" />
            </div>
            {topCaissiers.length === 0
              ? <div className="p-6 text-center text-sm text-base-content/40">Aucune donnée</div>
              : topCaissiers.map((c, i) => (
                  <div key={c.nom} className="flex items-center gap-3 px-5 py-2.5 border-b border-base-200/50 hover:bg-base-200/40 transition-colors">
                    <span className="shrink-0">{MEDAL_ICONS[i]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{c.nom}</p>
                      <p className="text-xs text-base-content/40">{c.ventes} vente(s)</p>
                    </div>
                    <span className="text-xs font-extrabold text-success shrink-0">{fmt(c.ca)} F</span>
                  </div>
                ))
            }
          </div>
        </div>
      </div>

      {/* Alertes + dernières ventes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SectionAlertes alertes={alertes} />
        <div className="md:col-span-2">
          <SectionDernieresVentes ventes={[...ventesActives].slice(0, 6)} />
        </div>
      </div>
    </div>
  )
}

/* ── CAISSIER ── */
function DashboardCaissier({ ventes, produits, stocks, user }) {
  const ventesActives = useMemo(() => ventes.filter(v => v.statut !== 'annulee'), [ventes])

  const mesVentes = useMemo(() =>
    ventesActives.filter(v => v.utilisateur?.idUtilisateur === user?.idUtilisateur),
    [ventesActives, user])

  const mesVentesAuj = useMemo(() => {
    const t = new Date().toDateString()
    return mesVentes.filter(v => v.dateVente && new Date(v.dateVente).toDateString() === t)
  }, [mesVentes])

  const maCaAuj = useMemo(() => mesVentesAuj.reduce((s, v) => s + (parseFloat(v.totalTaxeComprise || v.montantTotal) || 0), 0), [mesVentesAuj])
  const maCaTotal = useMemo(() => mesVentes.reduce((s, v) => s + (parseFloat(v.totalTaxeComprise || v.montantTotal) || 0), 0), [mesVentes])
  const panierMoyen = useMemo(() => mesVentes.length ? maCaTotal / mesVentes.length : 0, [maCaTotal, mesVentes])
  const [caConfig, setCaConfig] = useState({ dateDebut: toISO(il90), dateFin: toISO(today), groupBy: 'jour' })
  const caData    = useMemo(() => buildCAData(mesVentes, caConfig.dateDebut, caConfig.dateFin, caConfig.groupBy), [mesVentes, caConfig])
  const caPeriode = useMemo(() => caData.data.reduce((s, v) => s + v, 0), [caData])

  const alertes = useMemo(() => produits.filter(p => {
    const qte = stocks.filter(s => s.idProduit === p.idProduit).reduce((s, st) => s + (parseInt(st.quantiteRestante) || 0), 0)
    return qte <= (parseInt(p.seuilSecurite) || 0)
  }), [produits, stocks])

  return (
    <div className="space-y-5">
      <HeroBanner user={user} stats={[
        { label: 'Mes ventes auj.', value: mesVentesAuj.length },
        { label: 'CA auj.',         value: `${fmt(maCaAuj)} F` },
        { label: 'Total mes ventes', value: mesVentes.length },
        { label: 'Alertes stock',   value: alertes.length, ok: alertes.length === 0 },
      ]} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Ventes auj."   value={mesVentesAuj.length}    sub="aujourd'hui"    icon={ShoppingCart}  colorClass="text-primary"   badgeClass="bg-primary/10 text-primary" />
        <KpiCard label="CA aujourd'hui" value={`${fmt(maCaAuj)} F`}   sub="encaissé"       icon={DollarSign}    colorClass="text-secondary" badgeClass="bg-secondary/10 text-secondary" />
        <KpiCard label="Panier moyen"  value={`${fmt(panierMoyen)} F`} sub="par transaction" icon={TrendingUp}   colorClass="text-accent"    badgeClass="bg-accent/10 text-accent" />
        <KpiCard label="Alertes stock" value={alertes.length}          sub="produits critiques" icon={AlertTriangle}
          colorClass={alertes.length > 0 ? 'text-warning' : 'text-success'}
          badgeClass={alertes.length > 0 ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}
          pulse={alertes.length > 0} />
      </div>

      {/* GRAPHIQUE MES VENTES */}
<div className="card bg-base-100 shadow-sm border border-base-200">
  <div className="card-body p-5">
    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
      <div>
        <h2 className="card-title text-base font-extrabold">Mes ventes</h2>
        <p className="text-xs text-base-content/40">{fmt(caPeriode)} F sur la période</p>
      </div>
      <PeriodBar config={caConfig} onChange={setCaConfig} />
        {/* ✅ Dates personnalisées */}
  <div className="flex items-center gap-1.5">
    <input
      type="date"
      className="input input-xs input-bordered"
      value={caConfig.dateDebut}
      max={caConfig.dateFin}
      onChange={e => setCaConfig({ ...caConfig, dateDebut: e.target.value })}
    />
    <span className="text-xs text-base-content/40">→</span>
    <input
      type="date"
      className="input input-xs input-bordered"
      value={caConfig.dateFin}
      min={caConfig.dateDebut}
      max={toISO(today)}
      onChange={e => setCaConfig({ ...caConfig, dateFin: e.target.value })}
    />
  </div>
    </div>
    <div className="flex gap-1.5 mb-3">
      {['jour', 'semaine', 'mois'].map(g => (
        <button key={g} onClick={() => setCaConfig({ ...caConfig, groupBy: g })}
          className={`btn btn-xs rounded-lg font-bold ${caConfig.groupBy === g ? 'btn-secondary' : 'btn-ghost'}`}>
          {g === 'jour' ? 'Jour' : g === 'semaine' ? 'Semaine' : 'Mois'}
        </button>
      ))}
    </div>
    {caData.labels.length === 0
      ? <div className="h-44 flex items-center justify-center text-base-content/30 text-sm">Aucune vente sur la période</div>
      : <div className="h-56">
          <Bar data={{
            labels: caData.labels,
            datasets: [{ 
              data: caData.data, 
              backgroundColor: caData.data.map(v => v > 0 ? 'rgba(247,100,149,0.7)' : '#f3f4f6'), 
              hoverBackgroundColor: caData.data.map(v => v > 0 ? '#f64395' : '#e5e7eb'), 
              borderRadius: 6, borderSkipped: false 
            }]
          }} options={chartOpts(ctx => ` ${fmt(ctx.raw)} F`)} />
        </div>
    }
  </div>
</div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <SectionDernieresVentes ventes={mesVentes.slice(0, 6)} />
        </div>
        <SectionAlertes alertes={alertes} />
      </div>
    </div>
  )
}

/* ── GESTIONNAIRE DE STOCK ── */
function DashboardGestionnaire({ produits, stocks, categories, commandes, livraisons, user }) {
  const stockTotal   = useMemo(() => stocks.reduce((s, st) => s + (parseInt(st.quantiteRestante) || 0), 0), [stocks])
  const enRupture    = useMemo(() => stocks.filter(s => (parseInt(s.quantiteRestante) || 0) === 0), [stocks])
  const sousSeuil    = useMemo(() => stocks.filter(s => {
    const r = parseInt(s.quantiteRestante) || 0
    const seuil = parseInt(s.seuilSecurite ?? s.seuilAlerte ?? 5)
    return r > 0 && r <= seuil
  }), [stocks])

  const alertes = useMemo(() => produits.filter(p => {
    const qte = stocks.filter(s => s.idProduit === p.idProduit).reduce((s, st) => s + (parseInt(st.quantiteRestante) || 0), 0)
    return qte <= (parseInt(p.seuilSecurite) || 0)
  }), [produits, stocks])

  const stockParCat = useMemo(() => {
    const map = {}
    categories.forEach(c => { map[c.idCategorie] = { name: c.libelle ?? c.nom, stock: 0 } })
    produits.forEach(p => {
      if (p.idCategorie && map[p.idCategorie]) {
        const qte = stocks.filter(s => s.idProduit === p.idProduit).reduce((s, st) => s + (parseInt(st.quantiteRestante) || 0), 0)
        map[p.idCategorie].stock += qte
      }
    })
    const entries = Object.values(map).filter(e => e.stock > 0)
    return { labels: entries.map(e => e.name), data: entries.map(e => e.stock) }
  }, [produits, stocks, categories])

  const topConsommes = useMemo(() => {
    return stocks.map(s => {
      const init     = parseInt(s.quantiteInitiale) || 0
      const restante = parseInt(s.quantiteRestante) || 0
      const consomme = init - restante
      const produit  = produits.find(p => p.idProduit === s.idProduit)
      return { nom: produit?.nomProduit ?? produit?.reference ?? `#${s.idProduit}`, consomme, restante, init }
    }).filter(x => x.consomme > 0).sort((a, b) => b.consomme - a.consomme).slice(0, 6)
  }, [stocks, produits])

  const commandesEnCours = useMemo(() =>
    commandes.filter(c => c.statut !== 'livree' && c.statut !== 'annulee'),
    [commandes])

  return (
    <div className="space-y-5">
      <div className="card bg-gradient-to-br from-accent to-secondary text-primary-content shadow-lg overflow-hidden">
        <div className="card-body p-6 relative">
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold opacity-80">Gestion des stocks</span>
              <span className="badge badge-sm bg-white/20 border-0 text-primary-content font-bold text-xs">GESTIONNAIRE</span>
            </div>
            <h1 className="text-2xl font-extrabold leading-tight mb-1">{user?.prenom} {user?.nom}</h1>
            <p className="text-xs opacity-60 flex items-center gap-1">
              <Calendar size={10} />
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Produits',    value: produits.length },
              { label: 'Stock total', value: fmt(stockTotal) },
              { label: 'Ruptures',    value: enRupture.length, ok: enRupture.length === 0 },
              { label: 'Sous seuil',  value: sousSeuil.length, ok: sousSeuil.length === 0 },
            ].map(({ label, value, ok }) => (
              <div key={label} className="bg-white/10 rounded-xl p-3 text-center border border-white/10">
                <p className="text-xs font-semibold uppercase tracking-wider opacity-50 truncate mb-1">{label}</p>
                <p className={`text-lg font-extrabold leading-none ${ok === false ? 'text-warning' : 'text-primary-content'}`}>{value}</p>              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Produits"      value={produits.length}            sub="références"         icon={Package}       colorClass="text-accent"    badgeClass="bg-accent/10 text-accent" />
        <KpiCard label="Stock total"   value={fmt(stockTotal)}            sub="unités restantes"   icon={ArrowUpDown}   colorClass="text-primary"   badgeClass="bg-primary/10 text-primary" />
        <KpiCard label="Ruptures"      value={enRupture.length}           sub="stock à zéro"       icon={TrendingDown}
          colorClass={enRupture.length > 0 ? 'text-error' : 'text-success'}
          badgeClass={enRupture.length > 0 ? 'bg-error/10 text-error' : 'bg-success/10 text-success'}
          pulse={enRupture.length > 0} />
        <KpiCard label="Cmdes en cours" value={commandesEnCours.length}  sub="à réceptionner"     icon={Truck}         colorClass="text-info"      badgeClass="bg-info/10 text-info" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SectionStockParCat stockParCat={stockParCat} />

        {/* Top consommés */}
        <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
          <div className="card-body p-0">
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-base-200">
              <div>
                <h2 className="font-extrabold text-sm">Top consommés</h2>
                <p className="text-xs text-base-content/40">Produits les plus utilisés</p>
              </div>
              <BarChart2 size={14} className="text-accent" />
            </div>
            {topConsommes.length === 0
              ? <div className="p-6 text-center text-sm text-base-content/40">Aucune consommation</div>
              : topConsommes.map((p, i) => {
                  const ratio = p.init > 0 ? Math.round((p.consomme / p.init) * 100) : 0
                  return (
                    <div key={i} className="px-5 py-2.5 border-b border-base-200/50 hover:bg-base-200/40 transition-colors">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold truncate flex-1">{p.nom}</span>
                        <span className="text-xs text-base-content/40 ml-2 shrink-0">{fmt(p.consomme)} / {fmt(p.init)}</span>
                      </div>
                      <div className="w-full bg-base-200 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full" style={{
                          width: `${ratio}%`,
                          background: ratio >= 80 ? 'rgba(248,114,114,0.8)' : ratio >= 50 ? 'rgba(251,191,36,0.8)' : 'rgba(54,211,153,0.8)'
                        }} />
                      </div>
                    </div>
                  )
                })
            }
          </div>
        </div>

        <SectionAlertes alertes={alertes} />
      </div>

      <SectionDernieresLivraisons livraisons={livraisons} />
    </div>
  )
}

/* ── MAGASINIER ── */
function DashboardMagasinier({ produits, stocks, livraisons, user }) {
  const stockTotal = useMemo(() => stocks.reduce((s, st) => s + (parseInt(st.quantiteRestante) || 0), 0), [stocks])
  const enRupture  = useMemo(() => stocks.filter(s => (parseInt(s.quantiteRestante) || 0) === 0), [stocks])
  const sousSeuil  = useMemo(() => stocks.filter(s => {
    const r = parseInt(s.quantiteRestante) || 0
    const seuil = parseInt(s.seuilSecurite ?? s.seuilAlerte ?? 5)
    return r > 0 && r <= seuil
  }), [stocks])

  const alertes = useMemo(() => produits.filter(p => {
    const qte = stocks.filter(s => s.idProduit === p.idProduit).reduce((s, st) => s + (parseInt(st.quantiteRestante) || 0), 0)
    return qte <= (parseInt(p.seuilSecurite) || 0)
  }), [produits, stocks])

  return (
    <div className="space-y-5">
      <div className="card bg-gradient-to-br from-success to-accent text-primary-content shadow-lg overflow-hidden">
        <div className="card-body p-6 relative">
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold opacity-80">Magasin</span>
              <span className="badge badge-sm bg-white/20 border-0 text-primary-content font-bold text-xs">MAGASINIER</span>
            </div>
            <h1 className="text-2xl font-extrabold leading-tight mb-1">{user?.prenom} {user?.nom}</h1>
            <p className="text-xs opacity-60 flex items-center gap-1">
              <Calendar size={10} />
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Stock total', value: fmt(stockTotal) },
              { label: 'Ruptures',    value: enRupture.length, ok: enRupture.length === 0 },
              { label: 'Sous seuil',  value: sousSeuil.length, ok: sousSeuil.length === 0 },
              { label: 'Livraisons',  value: livraisons.length },
            ].map(({ label, value, ok }) => (
              <div key={label} className="bg-white/10 rounded-xl p-3 text-center border border-white/10">
                <p className="text-xs font-semibold uppercase tracking-wider opacity-50 truncate mb-1">{label}</p>
                <p className={`text-lg font-extrabold leading-none ${ok === false ? 'text-warning' : 'text-primary-content'}`}>{value}</p>              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <KpiCard label="Stock total"  value={fmt(stockTotal)}  sub="unités restantes"  icon={ArrowUpDown}   colorClass="text-success"   badgeClass="bg-success/10 text-success" />
        <KpiCard label="Ruptures"     value={enRupture.length} sub="stock à zéro"      icon={TrendingDown}
          colorClass={enRupture.length > 0 ? 'text-error' : 'text-success'}
          badgeClass={enRupture.length > 0 ? 'bg-error/10 text-error' : 'bg-success/10 text-success'}
          pulse={enRupture.length > 0} />
        <KpiCard label="Sous seuil"   value={sousSeuil.length} sub="à réapprovisionner" icon={ShieldAlert}
          colorClass={sousSeuil.length > 0 ? 'text-warning' : 'text-success'}
          badgeClass={sousSeuil.length > 0 ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}
          pulse={sousSeuil.length > 0} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionAlertes alertes={alertes} />
        <SectionDernieresLivraisons livraisons={livraisons} />
      </div>
    </div>
  )
}

/* ════════════════════════════════════
   PAGE PRINCIPALE
════════════════════════════════════ */
export default function Dashboard() {
  const { user }                            = useAuth()
  const { data: ventes,     loading: lV }   = useVentes()
  const { data: produits,   loading: lP }   = useProduits()
  const { data: stocks,     loading: lS }   = useStocks()
  const { data: categories, loading: lC }   = useCategories()
  const { data: commandes,  loading: lCom } = useCommandes()
  const { data: livraisons, loading: lL }   = useLivraisons()
  const { data: utilisateurs, loading: lU }    = useUtilisateurs()

  const loading = lV || lP || lS || lC || lCom || lL || lU
  const role    = user?.role

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div className="max-w-6xl mx-auto font-sans">
        {(role === 'gerant' || role === 'admin') && (
          <DashboardGerant
          ventes={ventes} produits={produits}
          stocks={stocks} categories={categories}
          caissiers={utilisateurs} 
          user={user} />
        )}
        {role === 'caissier' && (
          <DashboardCaissier
            ventes={ventes} produits={produits}
            stocks={stocks} user={user} />
        )}
        {role === 'gestionnaire_stock' && (
          <DashboardGestionnaire
            produits={produits} stocks={stocks}
            categories={categories} commandes={commandes}
            livraisons={livraisons}
            user={user} />
        )}
        {role === 'magasinier' && (
          <DashboardMagasinier
            produits={produits} stocks={stocks}
            livraisons={livraisons}
            user={user} />
        )}
      </div>
    </Layout>
  )
}