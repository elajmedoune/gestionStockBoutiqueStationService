import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useVentes, useProduits, useStocks, useCategories } from '../hooks'
import Layout from '../components/Layout'
import {
  TrendingUp, Package, AlertTriangle, DollarSign,
  ShoppingCart, ArrowUpDown, Trophy, Calendar, ChevronRight,
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
const fmt = n => new Intl.NumberFormat('fr-FR').format(Math.round(n || 0))
const toISO = d => d.toISOString().split('T')[0]
const today = new Date()
const il90 = new Date(); il90.setDate(today.getDate() - 89)
const il7  = new Date(); il7.setDate(today.getDate() - 6)

const PERIODS = [
  { label: '7J', days: 7 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: 'Tout', days: null },
]

const DOUGHNUT_COLORS = ['#f9a8d4','#c084fc','#67e8f9','#86efac','#fcd34d','#fb923c','#f472b6']

const toDateKey = (ds, g) => {
  const d = new Date(ds)
  if (g === 'jour') return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
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
    if (g === 'jour') cur.setDate(cur.getDate() + 1)
    else if (g === 'semaine') cur.setDate(cur.getDate() + 7)
    else cur.setMonth(cur.getMonth() + 1)
  }
  return labels
}

const buildCAData = (ventes, d1s, d2s, g) => {
  const d1 = new Date(d1s); d1.setHours(0, 0, 0, 0)
  const d2 = new Date(d2s); d2.setHours(23, 59, 59, 999)
  const labels = generateLabels(d1s, d2s, g)
  const map = {}; labels.forEach(l => { map[l] = 0 })
  ventes.forEach(v => {
    if (!v.dateVente) return
    const d = new Date(v.dateVente)
    if (d < d1 || d > d2) return
    const k = toDateKey(v.dateVente, g)
    if (k in map) map[k] += parseFloat(v.montantTotal) || 0
  })
  return { labels, data: labels.map(l => map[l]) }
}

/* ── KpiCard ── */
function KpiCard({ label, value, sub, icon: Icon, colorClass, badgeClass, pulse }) {
  return (
    <div className="card bg-base-100 shadow-sm border border-base-200 hover:-translate-y-1 transition-transform duration-200">
      <div className="card-body p-4 gap-2">
        <div className="flex items-center justify-between">
          <div className={`p-2 rounded-xl ${badgeClass}`}>
            <Icon size={16} />
          </div>
          {pulse && (
            <span className="badge badge-error badge-xs animate-pulse">!</span>
          )}
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

/* ── HeroBanner ── */
function HeroBanner({ user, stats }) {
  return (
    <div className="card bg-gradient-to-br from-primary to-secondary text-primary-content shadow-lg mb-5 overflow-hidden">
      <div className="card-body p-6 relative">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="mb-4 relative">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold opacity-80">
              {user?.role === 'admin' ? 'Administration' : 'Mon espace'}
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
        <div className="grid grid-cols-4 gap-3">
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

/* ── PeriodBar ── */
function PeriodBar({ config, onChange }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {PERIODS.map(({ label, days }) => {
        const d1 = days ? new Date() : null
        if (d1) d1.setDate(d1.getDate() - (days - 1))
        const ad = days ? toISO(d1) : '2020-01-01'
        const isActive = config.dateDebut === ad && config.dateFin === toISO(today)
        return (
          <button
            key={label}
            onClick={() => onChange({ ...config, dateDebut: ad, dateFin: toISO(today) })}
            className={`btn btn-xs rounded-lg font-bold ${isActive ? 'btn-primary' : 'btn-ghost'}`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

/* ══ DASHBOARD ══ */
export default function Dashboard() {
  const { user } = useAuth()
  const { data: ventes,     loading: lV } = useVentes()
  const { data: produits,   loading: lP } = useProduits()
  const { data: stocks,     loading: lS } = useStocks()
  const { data: categories, loading: lC } = useCategories()

  const [caConfig, setCaConfig] = useState({
    dateDebut: toISO(il90), dateFin: toISO(today), groupBy: 'jour'
  })

  const loading = lV || lP || lS || lC

  /* ── Stats ── */
  const caTotal    = useMemo(() => ventes.reduce((s, v) => s + (parseFloat(v.montantTotal) || 0), 0), [ventes])
  const ventesAuj  = useMemo(() => { const t = new Date().toDateString(); return ventes.filter(v => v.dateVente && new Date(v.dateVente).toDateString() === t) }, [ventes])
  const caAuj      = useMemo(() => ventesAuj.reduce((s, v) => s + (parseFloat(v.montantTotal) || 0), 0), [ventesAuj])
  const ventes7j   = useMemo(() => ventes.filter(v => v.dateVente && new Date(v.dateVente) >= il7), [ventes])
  const ca7j       = useMemo(() => ventes7j.reduce((s, v) => s + (parseFloat(v.montantTotal) || 0), 0), [ventes7j])
  const stockTotal = useMemo(() => stocks.reduce((s, st) => s + (parseInt(st.quantiteInitiale) || 0), 0), [stocks])

  const alertes = useMemo(() => produits.filter(p => {
    const qte = stocks.filter(s => s.idProduit === p.idProduit).reduce((s, st) => s + (parseInt(st.quantiteInitiale) || 0), 0)
    return qte <= (parseInt(p.seuilSecurite) || 0)
  }), [produits, stocks])

  const topProduits = useMemo(() => {
    const map = {}
    ventes.forEach(v => {
      v.lignes?.forEach(l => {
        const id = l.idProduit
        if (!map[id]) map[id] = { nom: l.produit?.reference || `#${id}`, qte: 0, total: 0 }
        map[id].qte   += parseInt(l.quantite) || 0
        map[id].total += parseFloat(l.totalPartielle) || 0
      })
    })
    return Object.values(map).sort((a, b) => b.qte - a.qte).slice(0, 6)
  }, [ventes])

  const stockParCat = useMemo(() => {
    const map = {}
    categories.forEach(c => { map[c.idCategorie] = { name: c.nom ?? c.name, stock: 0 } })
    produits.forEach(p => {
      if (p.idCategorie && map[p.idCategorie]) {
        const qte = stocks.filter(s => s.idProduit === p.idProduit).reduce((s, st) => s + (parseInt(st.quantiteInitiale) || 0), 0)
        map[p.idCategorie].stock += qte
      }
    })
    const entries = Object.values(map).filter(e => e.stock > 0)
    return { labels: entries.map(e => e.name), data: entries.map(e => e.stock) }
  }, [produits, stocks, categories])

  const dernieresVentes = useMemo(() => [...ventes].slice(0, 6), [ventes])
  const caData     = useMemo(() => buildCAData(ventes, caConfig.dateDebut, caConfig.dateFin, caConfig.groupBy), [ventes, caConfig])
  const caPeriode  = useMemo(() => caData.data.reduce((s, v) => s + v, 0), [caData])

  const chartOpts = (cb) => ({
    responsive: true, maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#fff0f5',
        titleColor: '#9d174d',
        bodyColor: '#be185d',
        borderColor: '#fbcfe8',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        callbacks: { label: cb }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#9ca3af', font: { size: 9 }, maxTicksLimit: 6 } },
      y: { grid: { color: '#fce7f3' }, ticks: { color: '#9ca3af', font: { size: 9 } }, beginAtZero: true }
    }
  })

  if (loading) {
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
      <div className="max-w-6xl mx-auto space-y-5 font-sans">

        {/* Hero */}
        <HeroBanner user={user} stats={[
          { label: 'Ventes auj.', value: ventesAuj.length },
          { label: 'CA auj.',     value: `${fmt(caAuj)} F` },
          { label: 'CA 7j',       value: `${fmt(ca7j)} F` },
          { label: 'Alertes',     value: alertes.length, ok: alertes.length === 0 },
        ]} />

        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <KpiCard label="Total ventes"  value={ventes.length}        sub="transactions" icon={ShoppingCart} colorClass="text-primary"   badgeClass="bg-primary/10 text-primary" />
          <KpiCard label="CA global"     value={`${fmt(caTotal)} F`}  sub="toutes périodes" icon={DollarSign} colorClass="text-secondary" badgeClass="bg-secondary/10 text-secondary" />
          <KpiCard label="Produits"      value={produits.length}      sub="références"   icon={Package}      colorClass="text-accent"     badgeClass="bg-accent/10 text-accent" />
          <KpiCard label="Stock total"   value={fmt(stockTotal)}      sub="unités"       icon={ArrowUpDown}  colorClass="text-success"    badgeClass="bg-success/10 text-success" />
          <KpiCard label="Alertes stock" value={alertes.length}       sub="sous seuil"   icon={AlertTriangle}
            colorClass={alertes.length > 0 ? 'text-warning' : 'text-success'}
            badgeClass={alertes.length > 0 ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}
            pulse={alertes.length > 0}
          />
        </div>

        {/* Graphique CA */}
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-5">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div>
                <h2 className="card-title text-base font-extrabold">Chiffre d'affaires</h2>
                <p className="text-xs text-base-content/40">{fmt(caPeriode)} FCFA sur la période</p>
              </div>
              <PeriodBar config={caConfig} onChange={setCaConfig} />
            </div>
            <div className="flex gap-1.5 mb-3">
              {['jour', 'semaine', 'mois'].map(g => (
                <button
                  key={g}
                  onClick={() => setCaConfig({ ...caConfig, groupBy: g })}
                  className={`btn btn-xs rounded-lg font-bold ${caConfig.groupBy === g ? 'btn-secondary' : 'btn-ghost'}`}
                >
                  {g === 'jour' ? 'Jour' : g === 'semaine' ? 'Semaine' : 'Mois'}
                </button>
              ))}
            </div>
            {caData.labels.length === 0
              ? <div className="h-44 flex items-center justify-center text-base-content/30 text-sm">Aucune vente sur la période</div>
              : <div className="h-56">
                  <Bar
                    data={{
                      labels: caData.labels,
                      datasets: [{
                        data: caData.data,
                        backgroundColor: caData.data.map(v => v > 0 ? 'rgba(247,100,149,0.7)' : '#f3f4f6'),
                        hoverBackgroundColor: caData.data.map(v => v > 0 ? '#f64395' : '#e5e7eb'),
                        borderRadius: 6,
                        borderSkipped: false,
                      }]
                    }}
                    options={chartOpts(ctx => ` ${fmt(ctx.raw)} FCFA`)}
                  />
                </div>
            }
          </div>
        </div>

        {/* 3 colonnes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Stock par catégorie */}
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
                    <div className="mt-3 space-y-1.5">
                      {stockParCat.labels.map((l, i) => (
                        <div key={l} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: DOUGHNUT_COLORS[i] }} />
                            <span className="text-xs text-base-content/60 truncate max-w-[110px]">{l}</span>
                          </div>
                          <span className="text-xs font-bold text-base-content">{fmt(stockParCat.data[i])}</span>
                        </div>
                      ))}
                    </div>
                  </>
              }
            </div>
          </div>

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
                      <span className="text-xs font-bold text-base-content/30 w-4">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-base-content truncate">{p.nom}</p>
                        <p className="text-xs text-base-content/40">{fmt(p.total)} F</p>
                      </div>
                      <span className="badge badge-primary badge-sm font-bold">×{p.qte}</span>
                    </div>
                  ))
              }
            </div>
          </div>

          {/* Alertes stock */}
          <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
            <div className="card-body p-0">
              <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-base-200">
                <h2 className="font-extrabold text-sm">Alertes stock</h2>
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
                      <span className="w-2 h-2 rounded-full bg-error shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-base-content truncate">{p.reference}</p>
                        <p className="text-xs text-base-content/40">Seuil : {p.seuilSecurite}</p>
                      </div>
                      <span className="badge badge-error badge-sm font-bold">Critique</span>
                    </div>
                  ))
              }
            </div>
          </div>
        </div>

        {/* Dernières ventes */}
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
                    <th>#</th>
                    <th>Date</th>
                    <th>Mode paiement</th>
                    <th>Montant HT</th>
                    <th>TVA</th>
                    <th>Total TTC</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {dernieresVentes.length === 0
                    ? <tr><td colSpan={6} className="text-center text-base-content/40 py-6">Aucune vente</td></tr>
                    : dernieresVentes.map(v => (
                        <tr key={v.idVente} className="hover">
                          <td className="text-base-content/40 font-semibold">#{v.idVente}</td>
                          <td className="text-base-content/60">
                            {v.dateVente ? new Date(v.dateVente).toLocaleDateString('fr-FR') : '—'}
                          </td>
                          <td>
                            <span className="badge badge-secondary badge-sm font-semibold">{v.modePaiement}</span>
                          </td>
                          <td className="font-bold">{fmt(v.totalHorsTaxe)} F</td>
                          <td className="text-base-content/50">{fmt(v.tva)} F</td>
                          <td className="font-extrabold text-success">{fmt(v.totalTaxeComprise)} F</td>
                        </tr>
                      ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  )
}