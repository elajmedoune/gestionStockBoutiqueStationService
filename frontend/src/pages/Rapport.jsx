import { useState, useMemo } from 'react'
import Layout from '../components/Layout'
import { useVentes } from '../hooks'
import {
  TrendingUp, DollarSign, ShoppingCart, Receipt,
  Download, AlertTriangle, Check, X,
  CalendarDays, Wallet, FileText,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import ExportPDF from '../components/exports/ExportPDF'
import ExportExcel from '../components/exports/ExportExcel'
import ExportCSV from '../components/exports/ExportCSV'
import EmptyState from '../components/layouts/EmptyState'
import ConfirmDeleteModal from '../components/layouts/ConfirmDeleteModal'
import LoadingCard from '../components/layouts/LoadingCard'

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

const PDF_COLS = [
  { header: 'Date',         dataKey: 'jour'     },
  { header: 'Ventes',       dataKey: 'nbVentes' },
  { header: 'CA HT (F)',    dataKey: 'caHT'     },
  { header: 'TVA (F)',      dataKey: 'tva'      },
  { header: 'CA TTC (F)',   dataKey: 'caTTC'    },
  { header: 'Bénéfice (F)', dataKey: 'benefice' },
]

/* 🧁 Palette charts cupcake */
const CHART_COLORS = {
  primary:      'rgba(101,195,200,1)',     // teal
  primarySoft:  'rgba(101,195,200,0.85)',
  primaryFill:  'rgba(101,195,200,0.4)',
  benefit:      'rgba(238,175,58,0.8)',
  benefitSoft:  'rgba(238,175,58,0.8)',
  benefitFill:  'rgba(116,206,183,0.35)',
  warn:         'rgba(238,175,58,0.8)',    // ambre cupcake
}

function KpiCard({ label, value, sub, icon: Icon, colorClass, badgeClass, pulse }) {
  return (
    <div className="card bg-base-100 shadow-sm border border-base-200 hover:-translate-y-1 transition-transform duration-200">
      <div className="card-body p-4 gap-2">
        <div className="flex items-center justify-between">
          <div className={`p-2 rounded-2xl ${badgeClass}`}><Icon size={16} /></div>
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

function HeroBanner({ stats, dateDebut, dateFin }) {
  const colors = [
    { bg: 'bg-primary/15',   text: 'text-primary',   border: 'border-primary/30',   icon: <ShoppingCart  size={14} className="text-primary" /> },
    { bg: 'bg-secondary/20', text: 'text-secondary', border: 'border-secondary/40', icon: <DollarSign    size={14} className="text-secondary" /> },
    { bg: 'bg-success/15',   text: 'text-success',   border: 'border-success/30',   icon: <TrendingUp    size={14} className="text-success" /> },
    { bg: 'bg-accent/15',    text: 'text-accent',    border: 'border-accent/30',    icon: <AlertTriangle size={14} className="text-accent" /> },
  ]
  return (
    <div className="card bg-base-100 text-base-content shadow-md border border-base-300 overflow-hidden">
      <div className="card-body p-0 relative">
        <div className="bg-primary text-primary-content px-6 py-5 relative overflow-hidden">
          {/* 🧁 bulles pastel cupcake */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-secondary/20 -translate-y-1/2 translate-x-1/4 pointer-events-none blur-2xl" />
          <div className="absolute bottom-0 left-20 w-32 h-32 rounded-full bg-primary/30 translate-y-1/2 pointer-events-none blur-xl" />
          <div className="absolute top-4 left-1/2 w-24 h-24 rounded-full bg-accent/20 pointer-events-none blur-xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-white/20 rounded-2xl"><TrendingUp size={14} /></div>
              <span className="text-xs font-bold opacity-70 uppercase tracking-widest">Analyse financière</span>
              <div className="w-px h-3 bg-white/20" />
              <span className="badge badge-sm bg-white text-primary font-bold text-xs px-3">RAPPORT</span>
            </div>
            <h1 className="text-3xl font-extrabold leading-tight mb-2">Rapport de bénéfices</h1>
            <div className="flex items-center gap-1.5 text-xs opacity-60">
              <CalendarDays size={11} />
              <span>{dateDebut}</span><span>→</span><span>{dateFin}</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5">
          {stats.map(({ label, value, ok }, i) => (
            <div key={label} className={`rounded-2xl p-4 border-2 shadow-sm hover:-translate-y-1 transition-all duration-200 cursor-default ${colors[i].bg} ${colors[i].border}`}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-widest text-base-content/40">{label}</p>
                <div className={`p-1.5 rounded-2xl border ${colors[i].bg} ${colors[i].border}`}>{colors[i].icon}</div>
              </div>
              <p className={`text-2xl font-extrabold ${ok === false ? 'text-warning' : colors[i].text}`}>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-base-100 border border-primary/40 rounded-2xl p-3 shadow-lg text-xs">
      <p className="font-bold text-base-content mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-base-content/60">
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
            {p.name}
          </span>
          <span className="font-bold text-base-content">
            {p.name === 'nbVentes' || p.name === 'annulees' ? p.value : `${fmt(p.value)} F`}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function Rapport() {
  const { data: ventes, loading } = useVentes()

  const [periodeActive, setPeriodeActive] = useState('1M')
  const [dateDebut, setDateDebut] = useState(() => {
    const d = new Date(today); d.setDate(d.getDate() - 30); return toISO(d)
  })
  const [dateFin, setDateFin] = useState(toISO(today))
  const [afficherAnnulees, setAfficherAnnulees] = useState(false)
  const [graphType, setGraphType] = useState('area')
  const [exportOpen, setExportOpen] = useState(false)

  const handlePeriode = (p) => {
    setPeriodeActive(p.label)
    if (p.days === null) {
      setDateDebut(toISO(new Date(2020, 0, 1)))
    } else {
      const d = new Date(today); d.setDate(d.getDate() - p.days)
      setDateDebut(toISO(d))
    }
    setDateFin(toISO(today))
  }

  const ventesFiltrees  = useMemo(() => ventes.filter(v => { if (!v.dateVente) return false; const d = v.dateVente.split('T')[0]; return d >= dateDebut && d <= dateFin }), [ventes, dateDebut, dateFin])
  const ventesNormales  = useMemo(() => ventesFiltrees.filter(v => v.statut !== 'annulee'), [ventesFiltrees])
  const ventesAnnulees  = useMemo(() => ventesFiltrees.filter(v => v.statut === 'annulee'), [ventesFiltrees])
  const ventesAffichees = useMemo(() => afficherAnnulees ? ventesFiltrees : ventesNormales, [ventesFiltrees, ventesNormales, afficherAnnulees])

  const caTotal    = useMemo(() => ventesAffichees.reduce((s, v) => s + parseFloat(v.totalTaxeComprise || 0), 0), [ventesAffichees])
  const totalHT    = useMemo(() => ventesAffichees.reduce((s, v) => s + parseFloat(v.totalHorsTaxe    || 0), 0), [ventesAffichees])
  const totalTVA   = useMemo(() => ventesAffichees.reduce((s, v) => s + parseFloat(v.tva              || 0), 0), [ventesAffichees])
  const benefice   = useMemo(() => ventesAffichees.reduce((s, v) => s + (v.lignes?.reduce((ls, l) => {
    const pa = parseFloat(l.produit?.stocks?.[0]?.prixAchat || 0)
    return ls + (parseFloat(l.produit?.prixUnitaire || 0) - pa) * parseInt(l.quantite || 0)
  }, 0) || 0), 0), [ventesAffichees])
  const panierMoyen = useMemo(() => ventesNormales.length ? caTotal / ventesNormales.length : 0, [caTotal, ventesNormales])
  const txAnnul     = useMemo(() => ventesFiltrees.length ? Math.round((ventesAnnulees.length / ventesFiltrees.length) * 100) : 0, [ventesFiltrees, ventesAnnulees])

  const dataParJour = useMemo(() => {
    const map = {}
    ventesAffichees.forEach(v => {
      const raw  = new Date(v.dateVente)
      const jour = raw.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
      if (!map[jour]) map[jour] = { jour, _ts: raw.getTime(), ca: 0, benefice: 0, nbVentes: 0, annulees: 0 }
      if (raw.getTime() < map[jour]._ts) map[jour]._ts = raw.getTime()
      map[jour].ca       += parseFloat(v.totalTaxeComprise || 0)
      map[jour].benefice += v.lignes?.reduce((ls, l) => {
        const pa = parseFloat(l.produit?.stocks?.[0]?.prixAchat || 0)
        return ls + (parseFloat(l.produit?.prixUnitaire || 0) - pa) * parseInt(l.quantite || 0)
      }, 0) || 0
      map[jour].nbVentes += 1
      if (v.statut === 'annulee') map[jour].annulees += 1
    })
    return Object.values(map).sort((a, b) => a._ts - b._ts)
  }, [ventesAffichees])

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
        const pa = parseFloat(l.produit?.stocks?.[0]?.prixAchat || 0)
        return ls + (parseFloat(l.produit?.prixUnitaire || 0) - pa) * parseInt(l.quantite || 0)
      }, 0) || 0
      if (v.statut === 'annulee') map[jour].annulees += 1
    })
    return Object.values(map).sort((a, b) => a._ts - b._ts)
  }, [ventesAffichees])

  const exportData = tableauJours.map(j => ({
    jour:     j.jour,
    nbVentes: j.nbVentes - j.annulees,
    caHT:     Math.round(j.caHT),
    tva:      Math.round(j.tva),
    caTTC:    Math.round(j.caTTC),
    benefice: Math.round(j.benefice),
  }))

  const exportDataExcel = tableauJours.map(j => ({
    Date:           j.jour,
    Ventes:         j.nbVentes - j.annulees,
    Annulées:       j.annulees,
    'CA HT (F)':    j.caHT,
    'TVA (F)':      j.tva,
    'CA TTC (F)':   j.caTTC,
    'Bénéfice (F)': j.benefice,
  }))

  if (loading) return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6">
        <LoadingCard count={8} />
      </div>
    </Layout>
  )

  const tick = { fontSize: 9, fill: 'currentColor', opacity: 0.4 }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-5">

        <HeroBanner dateDebut={dateDebut} dateFin={dateFin}
          stats={[
            { label: 'Ventes',   value: ventesNormales.length },
            { label: 'CA TTC',   value: `${fmt(caTotal)} F` },
            { label: 'Bénéfice', value: `${fmt(benefice)} F` },
            { label: 'Annulées', value: ventesAnnulees.length, ok: ventesAnnulees.length === 0 },
          ]}
        />

        {/* Filtres */}
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-4">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
              <div className="flex gap-1.5 flex-wrap">
                {PERIODES.map(p => (
                  <button key={p.label} onClick={() => handlePeriode(p)}
                    className={`btn btn-xs font-bold ${periodeActive === p.label ? 'btn-primary' : 'btn-ghost border border-base-300'}`}>
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="hidden sm:block w-px h-5 bg-base-300" />
              <div className="flex items-center gap-2">
                <CalendarDays size={13} className="text-base-content/30" />
                <input type="date" className="input input-xs input-bordered"
                  value={dateDebut} onChange={e => { setDateDebut(e.target.value); setPeriodeActive('') }} />
                <span className="text-base-content/30 text-xs">—</span>
                <input type="date" className="input input-xs input-bordered"
                  value={dateFin} onChange={e => { setDateFin(e.target.value); setPeriodeActive('') }} />
              </div>
              <div className="hidden sm:block w-px h-5 bg-base-300" />
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" className="checkbox checkbox-xs checkbox-warning"
                  checked={afficherAnnulees} onChange={e => setAfficherAnnulees(e.target.checked)} />
                <span className="text-xs font-medium text-base-content/60">Ventes annulées</span>
                {ventesAnnulees.length > 0 && <span className="badge badge-warning badge-xs font-bold">{ventesAnnulees.length}</span>}
              </label>
              <div className="ml-auto flex gap-2">
                {periodeActive === '' && (
                  <button className="btn btn-ghost btn-xs gap-1.5 text-error font-semibold"
                    onClick={() => { setPeriodeActive('1M'); const d = new Date(today); d.setDate(d.getDate() - 30); setDateDebut(toISO(d)); setDateFin(toISO(today)) }}>
                    <X size={12} /> Effacer filtres
                  </button>
                )}
                <div className="relative">
                  <button className="btn btn-ghost btn-xs gap-1.5 font-semibold border border-base-300"
                    onClick={() => setExportOpen(!exportOpen)}>
                    <Download size={12} /> Exporter
                  </button>
                  {exportOpen && (
                    <div className="absolute right-0 mt-1 bg-base-100 rounded-2xl shadow-lg border border-base-200 w-40 p-2 flex flex-col gap-1 z-50">
                      <ExportPDF data={exportData} columns={PDF_COLS} filename="rapport" label="PDF" />
                      <ExportExcel data={exportDataExcel} filename="rapport" label="Excel" />
                      <ExportCSV data={exportData} filename="rapport" label="CSV" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <KpiCard label="Transactions"  value={afficherAnnulees ? ventesAffichees.length : ventesNormales.length} sub={afficherAnnulees ? 'toutes ventes' : 'ventes valides'} icon={ShoppingCart} colorClass="text-primary"   badgeClass="bg-primary/15 text-primary" />
          <KpiCard label="Annulées"      value={ventesAnnulees.length} sub={`${txAnnul}% du total`} icon={AlertTriangle}
            colorClass={ventesAnnulees.length > 0 ? 'text-warning' : 'text-success'}
            badgeClass={ventesAnnulees.length > 0 ? 'bg-warning/15 text-warning' : 'bg-success/15 text-success'}
            pulse={ventesAnnulees.length > 0} />
          <KpiCard label="CA TTC"        value={`${fmt(caTotal)} F`}     sub="total encaissé"  icon={DollarSign} colorClass="text-secondary" badgeClass="bg-secondary/20 text-secondary" />
          <KpiCard label="CA HT"         value={`${fmt(totalHT)} F`}     sub="hors taxes"      icon={Receipt}    colorClass="text-accent"    badgeClass="bg-accent/15 text-accent" />
          <KpiCard label="Panier moyen"  value={`${fmt(panierMoyen)} F`} sub="par transaction" icon={Wallet}     colorClass="text-info"      badgeClass="bg-info/15 text-info" />
          <KpiCard label="Bénéfice est." value={`${fmt(benefice)} F`}
            sub={caTotal > 0 ? `marge ${Math.round((benefice / caTotal) * 100)}% TTC` : 'marge 0%'}
            icon={TrendingUp} colorClass="text-success" badgeClass="bg-success/15 text-success" />
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-0">
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4 pb-3 border-b border-base-200">
                <div>
                  <h2 className="font-extrabold text-sm">Chiffre d'affaires</h2>
                  <p className="text-xs text-base-content/40">{fmt(caTotal)} F sur la période</p>
                </div>
                <div className="flex gap-1.5">
                  {['area', 'bar'].map(t => (
                    <button key={t} onClick={() => setGraphType(t)}
                      className={`btn btn-xs font-bold ${graphType === t ? 'btn-secondary' : 'btn-ghost border border-base-300'}`}>
                      {t === 'area' ? 'Courbe' : 'Barres'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-4">
                {dataParJour.length === 0
                  ? <div className="h-44 flex items-center justify-center text-base-content/30 text-sm">Aucune vente sur la période</div>
                  : <div className="h-56" style={{ minWidth: 0 }}>
                      <ResponsiveContainer width="100%" height={224}>
                        {graphType === 'area' ? (
                          <AreaChart data={dataParJour} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="gCA" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor={CHART_COLORS.primaryFill} />
                                <stop offset="95%" stopColor="rgba(101,195,200,0)" />
                              </linearGradient>
                              <linearGradient id="gBen" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor={CHART_COLORS.benefitFill} />
                                <stop offset="95%" stopColor="rgba(116,206,183,0)" />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                            <XAxis dataKey="jour" tick={tick} tickLine={false} axisLine={false} />
                            <YAxis tick={tick} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11 }} formatter={v => v === 'ca' ? 'CA TTC' : 'Bénéfice'} />
                            <Area type="monotone" dataKey="ca"       name="ca"       stroke={CHART_COLORS.primary} strokeWidth={2} fill="url(#gCA)"  dot={false} activeDot={{ r: 4 }} />
                            <Area type="monotone" dataKey="benefice" name="benefice" stroke={CHART_COLORS.benefit} strokeWidth={2} fill="url(#gBen)" dot={false} activeDot={{ r: 4 }} />
                          </AreaChart>
                        ) : (
                          <BarChart data={dataParJour} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                            <XAxis dataKey="jour" tick={tick} tickLine={false} axisLine={false} />
                            <YAxis tick={tick} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11 }} formatter={v => v === 'ca' ? 'CA TTC' : 'Bénéfice'} />
                            <Bar dataKey="ca"       name="ca"       fill={CHART_COLORS.primarySoft} radius={[8, 8, 0, 0]} />
                            <Bar dataKey="benefice" name="benefice" fill={CHART_COLORS.benefitSoft} radius={[8, 8, 0, 0]} />
                          </BarChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                }
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-0">
              <div className="px-5 pt-4 pb-3 border-b border-base-200">
                <h2 className="font-extrabold text-sm">Ventes par jour</h2>
                <p className="text-xs text-base-content/40">
                  {afficherAnnulees ? ventesAffichees.length : ventesNormales.length} {afficherAnnulees ? 'transactions (annulées incluses)' : 'transactions valides'}
                </p>
              </div>
              <div className="p-4">
                {dataParJour.length === 0
                  ? <div className="h-44 flex items-center justify-center text-base-content/30 text-sm">Aucune vente sur la période</div>
                  : <div className="h-56" style={{ minWidth: 0 }}>
                      <ResponsiveContainer width="100%" height={224}>
                        <BarChart data={dataParJour} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                          <XAxis dataKey="jour" tick={tick} tickLine={false} axisLine={false} />
                          <YAxis tick={tick} tickLine={false} axisLine={false} allowDecimals={false} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11 }} formatter={v => v === 'nbVentes' ? 'Ventes' : 'Annulées'} />
                          <Bar dataKey="nbVentes" name="nbVentes" fill={CHART_COLORS.primarySoft} radius={[8, 8, 0, 0]} />
                          {afficherAnnulees && (
                            <Bar dataKey="annulees" name="annulees" fill={CHART_COLORS.warn} radius={[8, 8, 0, 0]} />
                          )}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                }
              </div>
            </div>
          </div>
        </div>

        {/* Tableau */}
        <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
          <div className="card-body p-0">
            <div className="bg-primary text-primary-content px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/25 rounded-2xl"><FileText size={14} /></div>
                <div>
                  <h2 className="font-extrabold text-sm">Détail par jour</h2>
                  <p className="text-xs opacity-70">{tableauJours.length} jour{tableauJours.length > 1 ? 's' : ''} dans la période</p>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="table table-sm w-full">
                <thead className="text-xs">
                  <tr className="bg-base-200/50">
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
                        <td className="text-center"><span className="badge badge-success badge-sm gap-1 font-bold"><Check size={9} /> {j.nbVentes - j.annulees}</span></td>
                        <td className="text-center">
                          {j.annulees > 0
                            ? <span className="badge badge-warning badge-sm gap-1 font-bold"><X size={9} /> {j.annulees}</span>
                            : <span className="text-base-content/20">—</span>}
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
                    <tr className="bg-primary text-primary-content text-xs font-black">
                      <td className="pl-5 py-3">TOTAL</td>
                      <td className="text-center"><span className="badge badge-success badge-sm font-bold">{ventesNormales.length}</span></td>
                      <td className="text-center">
                        {ventesAnnulees.length > 0
                          ? <span className="badge badge-warning badge-sm font-bold">{ventesAnnulees.length}</span>
                          : <span className="opacity-30">—</span>}
                      </td>
                      <td className="text-right opacity-80">{fmt(totalHT)} F</td>
                      <td className="text-right opacity-60">{fmt(totalTVA)} F</td>
                      <td className="text-right text-success font-extrabold">{fmt(caTotal)} F</td>
                      <td className="text-right font-extrabold pr-5">{fmt(benefice)} F</td>
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