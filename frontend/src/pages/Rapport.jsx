import { useState, useMemo } from 'react'
import Layout from '../components/Layout'
import { useVentes } from '../hooks'
import {
  TrendingUp, DollarSign, ShoppingCart, Receipt,
  Download, RefreshCw, AlertTriangle, Check, X,
  CalendarDays, Wallet, FileText,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
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

/* ── KpiCard — identique Dashboard ── */
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

/* ── HeroBanner rapport — même style que Dashboard ── */
function HeroBanner({ stats, dateDebut, dateFin }) {
  return (
    <div className="card bg-gradient-to-br from-primary to-secondary text-primary-content shadow-lg overflow-hidden">
      <div className="card-body p-6 relative">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="mb-4 relative">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold opacity-80">Analyse financière</span>
            <span className="badge badge-sm bg-white/20 border-0 text-primary-content font-bold text-xs">RAPPORT</span>
          </div>
          <h1 className="text-2xl font-extrabold leading-tight mb-1">Rapport de bénéfices</h1>
          <p className="text-xs opacity-60 flex items-center gap-1">
            <CalendarDays size={10} />
            {dateDebut} → {dateFin}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map(({ label, value, ok }) => (
            <div key={label} className="bg-white/10 rounded-xl p-3 text-center border border-white/10">
              <p className="text-xs font-semibold uppercase tracking-wider opacity-50 truncate mb-1">{label}</p>
              <p className={`text-lg font-extrabold leading-none ${ok === false ? 'text-warning' : 'text-white'}`}>{value}</p>            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Tooltip Recharts — couleurs thème cupcake/primary ── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ backgroundColor: '#fff0f5', border: '1px solid #fbcfe8', borderRadius: 8, padding: '10px 12px', fontSize: 11 }}>
      <p style={{ fontWeight: 700, color: '#9d174d', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#be185d' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
            {p.name}
          </span>
          <span style={{ fontWeight: 700, color: '#9d174d' }}>
  {p.name === 'nbVentes' || p.name === 'annulees' ? p.value : `${fmt(p.value)} F`}
</span>
        </div>
      ))}
    </div>
  )
}

/* ════════════════════════════════════════════ */
export default function Rapport() {
  const { data: ventes, loading, refetch } = useVentes()

  const [periodeActive, setPeriodeActive] = useState('1M')
  const [dateDebut, setDateDebut] = useState(() => {
    const d = new Date(today); d.setDate(d.getDate() - 30); return toISO(d)
  })
  const [dateFin, setDateFin]             = useState(toISO(today))
  const [afficherAnnulees, setAfficherAnnulees] = useState(false)
  const [graphType, setGraphType]         = useState('area')

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

  /* ── Filtrage ── */
  const ventesFiltrees = useMemo(() => ventes.filter(v => {
    if (!v.dateVente) return false
    const d = v.dateVente.split('T')[0]
    return d >= dateDebut && d <= dateFin
  }), [ventes, dateDebut, dateFin])

  const ventesNormales = useMemo(() => ventesFiltrees.filter(v => v.statut !== 'annulee'), [ventesFiltrees])
  const ventesAnnulees = useMemo(() => ventesFiltrees.filter(v => v.statut === 'annulee'), [ventesFiltrees])
  const ventesAffichees = useMemo(() => afficherAnnulees ? ventesFiltrees : ventesNormales, [ventesFiltrees, ventesNormales, afficherAnnulees])
  /* ── KPIs ── */
  const caTotal     = useMemo(() => ventesAffichees.reduce((s, v) => s + parseFloat(v.totalTaxeComprise || 0), 0), [ventesAffichees])
  const totalHT     = useMemo(() => ventesAffichees.reduce((s, v) => s + parseFloat(v.totalHorsTaxe    || 0), 0), [ventesAffichees])
  const totalTVA    = useMemo(() => ventesAffichees.reduce((s, v) => s + parseFloat(v.tva              || 0), 0), [ventesAffichees])
  const benefice = useMemo(() => {
  return ventesAffichees.reduce((s, v) => {
    return s + (v.lignes?.reduce((ls, l) => {
      const prixAchat = parseFloat(l.produit?.stocks?.[0]?.prixAchat || 0)
      const prixVente = parseFloat(l.produit?.prixUnitaire || 0)
      return ls + (prixVente - prixAchat) * parseInt(l.quantite || 0)
    }, 0) || 0)
  }, 0)
}, [ventesAffichees])
  const panierMoyen = useMemo(() => ventesNormales.length ? caTotal / ventesNormales.length : 0, [caTotal, ventesNormales])
  const txAnnul     = useMemo(() => ventesFiltrees.length ? Math.round((ventesAnnulees.length / ventesFiltrees.length) * 100) : 0, [ventesFiltrees, ventesAnnulees])

  /* ── Données graphiques — tri croissant (gauche = passé) ── */
  const dataParJour = useMemo(() => {
    const map = {}
    ventesAffichees.forEach(v => {
      const raw  = new Date(v.dateVente)
      const jour = raw.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
      if (!map[jour]) map[jour] = { jour, _ts: raw.getTime(), ca: 0, benefice: 0, nbVentes: 0, annulees: 0 }
      if (raw.getTime() < map[jour]._ts) map[jour]._ts = raw.getTime()
      map[jour].ca       += parseFloat(v.totalTaxeComprise || 0)
      map[jour].benefice += v.lignes?.reduce((ls, l) => {
  const prixAchat = parseFloat(l.produit?.stocks?.[0]?.prixAchat || 0)
  return ls + (parseFloat(l.produit?.prixUnitaire || 0) - prixAchat) * parseInt(l.quantite || 0)
}, 0) || 0
      map[jour].nbVentes += 1
      if (v.statut === 'annulee') map[jour].annulees += 1
    })
    return Object.values(map).sort((a, b) => a._ts - b._ts)
  }, [ventesAffichees])

  /* ── Tableau — tri croissant ── */
  const tableauJours = useMemo(() => {
    const map = {}
    ventesAffichees.forEach(v => {
      const raw  = new Date(v.dateVente)
      const jour = raw.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
      if (!map[jour]) map[jour] = { jour, _ts: raw.getTime(), nbVentes: 0, annulees: 0, caHT: 0, tva: 0, caTTC: 0, benefice: 0 }
      if (raw.getTime() < map[jour]._ts) map[jour]._ts = raw.getTime()
      map[jour].nbVentes += 1
      if (v.statut !== 'annulee') {
        map[jour].caHT  += parseFloat(v.totalHorsTaxe    || 0)
        map[jour].tva   += parseFloat(v.tva              || 0)
        map[jour].caTTC += parseFloat(v.totalTaxeComprise|| 0)
      }
      map[jour].benefice += v.lignes?.reduce((ls, l) => {
        const prixAchat = parseFloat(l.produit?.stocks?.[0]?.prixAchat || 0)
        return ls + (parseFloat(l.produit?.prixUnitaire || 0) - prixAchat) * parseInt(l.quantite || 0)
      }, 0) || 0
      if (v.statut === 'annulee') map[jour].annulees += 1
    })
    return Object.values(map).sort((a, b) => a._ts - b._ts)
  }, [ventesAffichees])

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <span className="loading loading-spinner loading-lg text-primary" />
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
            { label: 'Ventes',   value: ventesNormales.length                   },
            { label: 'CA TTC',   value: `${fmt(caTotal)} F`                     },
            { label: 'Bénéfice', value: `${fmt(benefice)} F`                    },
            { label: 'Annulées', value: ventesAnnulees.length, ok: ventesAnnulees.length === 0 },
          ]}
        />

        {/* ══ Filtres ══ */}
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-4">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">

              {/* Périodes rapides */}
              <div className="flex gap-1.5 flex-wrap">
                {PERIODES.map(p => (
                  <button
                    key={p.label}
                    onClick={() => handlePeriode(p)}
                    className={`btn btn-xs rounded-lg font-bold ${periodeActive === p.label ? 'btn-primary' : 'btn-ghost'}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <div className="hidden sm:block w-px h-5 bg-base-300" />

              {/* Dates */}
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

              <div className="hidden sm:block w-px h-5 bg-base-300" />

              {/* Toggle annulées */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" className="checkbox checkbox-xs checkbox-warning"
                  checked={afficherAnnulees}
                  onChange={e => setAfficherAnnulees(e.target.checked)} />
                <span className="text-xs font-medium text-base-content/60">Ventes annulées</span>
                {ventesAnnulees.length > 0 && (
                  <span className="badge badge-warning badge-xs font-bold">{ventesAnnulees.length}</span>
                )}
              </label>

              <div className="ml-auto flex gap-2">
                {periodeActive === '' && (
                  <button className="btn btn-ghost btn-xs gap-1.5 text-error font-semibold"
                  onClick={() => {
                    setPeriodeActive('1M')
                    const d = new Date(today)
                    d.setDate(d.getDate() - 30)
                    setDateDebut(toISO(d))
                    setDateFin(toISO(today))
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

        {/* ══ KPI Grid ══ */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <KpiCard label="Transactions" value={afficherAnnulees ? ventesAffichees.length : ventesNormales.length} sub={afficherAnnulees ? 'toutes ventes' : 'ventes valides'} icon={ShoppingCart} colorClass="text-primary" badgeClass="bg-primary/10 text-primary" />
          <KpiCard
            label="Annulées"
            value={ventesAnnulees.length}
            sub={`${txAnnul}% du total`}
            icon={AlertTriangle}
            colorClass={ventesAnnulees.length > 0 ? 'text-warning' : 'text-success'}
            badgeClass={ventesAnnulees.length > 0 ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}
            pulse={ventesAnnulees.length > 0}
          />
          <KpiCard label="CA TTC"        value={`${fmt(caTotal)} F`}     sub="total encaissé"      icon={DollarSign}    colorClass="text-secondary"  badgeClass="bg-secondary/10 text-secondary" />
          <KpiCard label="CA HT"         value={`${fmt(totalHT)} F`}     sub="hors taxes"          icon={Receipt}       colorClass="text-accent"     badgeClass="bg-accent/10 text-accent" />
          <KpiCard label="Panier moyen"  value={`${fmt(panierMoyen)} F`} sub="par transaction"     icon={Wallet}        colorClass="text-info"       badgeClass="bg-info/10 text-info" />
          <KpiCard label="Bénéfice est." value={`${fmt(benefice)} F`} sub={caTotal > 0 ? `marge ${Math.round((benefice / caTotal) * 100)}% TTC` : 'marge 0%'} icon={TrendingUp} colorClass="text-success" badgeClass="bg-success/10 text-success" />
        </div>

        {/* ══ Graphiques ══ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* CA + Bénéfice */}
          <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <h2 className="card-title text-base font-extrabold">Chiffre d'affaires</h2>
                  <p className="text-xs text-base-content/40">{fmt(caTotal)} F sur la période</p>
                </div>
                <div className="flex gap-1.5">
                  {['area', 'bar'].map(t => (
                    <button key={t} onClick={() => setGraphType(t)}
                      className={`btn btn-xs rounded-lg font-bold ${graphType === t ? 'btn-secondary' : 'btn-ghost'}`}>
                      {t === 'area' ? 'Courbe' : 'Barres'}
                    </button>
                  ))}
                </div>
              </div>

              {dataParJour.length === 0
                ? <div className="h-44 flex items-center justify-center text-base-content/30 text-sm">Aucune vente sur la période</div>
                : <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      {graphType === 'area' ? (
                        <AreaChart data={dataParJour} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="gCA" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%"  stopColor="rgba(247,100,149,0.35)" />
                              <stop offset="95%" stopColor="rgba(247,100,149,0)"    />
                            </linearGradient>
                            <linearGradient id="gBen" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%"  stopColor="rgba(54,211,153,0.25)" />
                              <stop offset="95%" stopColor="rgba(54,211,153,0)"    />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" vertical={false} />
                          <XAxis dataKey="jour" tick={tick} tickLine={false} axisLine={false} />
                          <YAxis tick={tick} tickLine={false} axisLine={false} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11 }} formatter={v => v === 'ca' ? 'CA TTC' : 'Bénéfice'} />
                          <Area type="monotone" dataKey="ca"       name="ca"       stroke="rgba(247,100,149,1)" strokeWidth={2} fill="url(#gCA)"  dot={false} activeDot={{ r: 4 }} />
                          <Area type="monotone" dataKey="benefice" name="benefice" stroke="rgba(54,211,153,1)"  strokeWidth={2} fill="url(#gBen)" dot={false} activeDot={{ r: 4 }} />
                        </AreaChart>
                      ) : (
                        <BarChart data={dataParJour} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" vertical={false} />
                          <XAxis dataKey="jour" tick={tick} tickLine={false} axisLine={false} />
                          <YAxis tick={tick} tickLine={false} axisLine={false} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11 }} formatter={v => v === 'ca' ? 'CA TTC' : 'Bénéfice'} />
                          <Bar dataKey="ca"       name="ca"       fill="rgba(247,100,149,0.75)" radius={[6, 6, 0, 0]} />
                          <Bar dataKey="benefice" name="benefice" fill="rgba(54,211,153,0.75)"  radius={[6, 6, 0, 0]} />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
              }
            </div>
          </div>

          {/* Ventes par jour */}
          <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-5">
              <div className="mb-3">
                <h2 className="card-title text-base font-extrabold">Ventes par jour</h2>
                <p className="text-xs text-base-content/40">
                  {afficherAnnulees ? ventesAffichees.length : ventesNormales.length} {afficherAnnulees ? 'transactions (annulées incluses)' : 'transactions valides'}
                </p>
              </div>

              {dataParJour.length === 0
                ? <div className="h-44 flex items-center justify-center text-base-content/30 text-sm">Aucune vente sur la période</div>
                : <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dataParJour} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" vertical={false} />
                        <XAxis dataKey="jour" tick={tick} tickLine={false} axisLine={false} />
                        <YAxis tick={tick} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11 }} formatter={v => v === 'nbVentes' ? 'Ventes' : 'Annulées'} />
                        <Bar dataKey="nbVentes" name="nbVentes" fill="rgba(247,100,149,0.75)" radius={[6, 6, 0, 0]} />
                        {afficherAnnulees && (
                          <Bar dataKey="annulees" name="annulees" fill="rgba(248,114,114,0.65)" radius={[6, 6, 0, 0]} />
                        )}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
              }
            </div>
          </div>
        </div>

        {/* ══ Tableau détaillé ══ */}
        <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
          <div className="card-body p-0">

            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-base-200">
              <div>
                <h2 className="font-extrabold text-sm">Détail par jour</h2>
                <p className="text-xs text-base-content/40">
                  {tableauJours.length} jour{tableauJours.length > 1 ? 's' : ''} dans la période
                </p>
              </div>
              <FileText size={14} className="text-base-content/30" />
            </div>

            <div className="overflow-x-auto">
              <table className="table table-sm w-full">
                <thead className="text-xs">
                  <tr>
                    <th className="pl-5">Date</th>
                    <th className="text-center">Ventes</th>
                    <th className="text-center">Annulées</th>
                    <th className="text-right">CA HT</th>
                    <th className="text-right">TVA</th>
                    <th className="text-right">CA TTC</th>
                    <th className="text-right pr-5">Bénéfice est.</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {tableauJours.length === 0
                    ? <tr><td colSpan={7} className="text-center text-base-content/40 py-10">Aucune vente sur cette période</td></tr>
                    : tableauJours.map((j, i) => (
                      <tr key={i} className="hover">
                        <td className="pl-5 font-semibold text-base-content">{j.jour}</td>
                        <td className="text-center">
                          <span className="badge badge-success badge-sm gap-1 font-bold">
                            <Check size={9} /> {j.nbVentes - j.annulees}
                          </span>
                        </td>
                        <td className="text-center">
                          {j.annulees > 0
                            ? <span className="badge badge-warning badge-sm gap-1 font-bold"><X size={9} /> {j.annulees}</span>
                            : <span className="text-base-content/20">—</span>
                          }
                        </td>
                        <td className="text-right text-base-content/60">{fmt(j.caHT)} F</td>
                        <td className="text-right text-base-content/40">{fmt(j.tva)} F</td>
                        <td className="text-right font-extrabold text-success">{fmt(j.caTTC)} F</td>
                        <td className="text-right font-extrabold text-secondary pr-5">{fmt(j.benefice)} F</td>
                      </tr>
                    ))
                  }
                </tbody>
                {tableauJours.length > 0 && (
                  <tfoot>
                    <tr className="bg-base-200/50 text-xs font-black">
                      <td className="pl-5 py-3 text-base-content">TOTAL</td>
                      <td className="text-center">
                        <span className="badge badge-success badge-sm font-bold">{ventesNormales.length}</span>
                      </td>
                      <td className="text-center">
                        {ventesAnnulees.length > 0
                          ? <span className="badge badge-warning badge-sm font-bold">{ventesAnnulees.length}</span>
                          : <span className="text-base-content/20">—</span>
                        }
                      </td>
                      <td className="text-right text-base-content/70">{fmt(totalHT)} F</td>
                      <td className="text-right text-base-content/50">{fmt(totalTVA)} F</td>
                      <td className="text-right text-success">{fmt(caTotal)} F</td>
                      <td className="text-right text-secondary pr-5">{fmt(benefice)} F</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  )
}