// src/components/exports/ExportExcel.jsx
import * as XLSX from 'xlsx-js-style'
import { saveAs } from 'file-saver'

/* ─── Couleurs thème ─── */
const COLORS = {
  primary:    '4F46E5', // indigo
  header:     '1E1B4B', // header foncé
  subheader:  'E0E7FF', // bleu clair
  success:    '16A34A',
  warning:    'D97706',
  error:      'DC2626',
  info:       '0891B2',
  white:      'FFFFFF',
  gray:       'F1F5F9',
  grayDark:   '64748B',
  border:     'CBD5E1',
  greenLight: 'DCFCE7',
  redLight:   'FEE2E2',
  yellowLight:'FEF9C3',
  blueLight:  'DBEAFE',
}

/* ─── Helpers de style ─── */
const cell = (value, style = {}) => ({ v: value, s: style })

const bold    = (v, extra = {}) => cell(v, { font: { bold: true, ...extra.font }, ...extra })
const center  = (v, extra = {}) => cell(v, { alignment: { horizontal: 'center', vertical: 'center' }, ...extra })
const boldCenter = (v, extra = {}) => cell(v, {
  font: { bold: true, ...(extra.font || {}) },
  alignment: { horizontal: 'center', vertical: 'center' },
  ...extra,
})

const headerCell = (v) => cell(v, {
  font:      { bold: true, color: { rgb: COLORS.white }, sz: 11 },
  fill:      { fgColor: { rgb: COLORS.header } },
  alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  border:    allBorder(COLORS.primary),
})

const statLabelCell = (v, bg = COLORS.subheader) => cell(v, {
  font:      { bold: true, sz: 10, color: { rgb: COLORS.header } },
  fill:      { fgColor: { rgb: bg } },
  alignment: { horizontal: 'left', vertical: 'center' },
  border:    allBorder(COLORS.border),
})

const statValueCell = (v, bg = COLORS.white, color = COLORS.primary) => cell(v, {
  font:      { bold: true, sz: 13, color: { rgb: color } },
  fill:      { fgColor: { rgb: bg } },
  alignment: { horizontal: 'center', vertical: 'center' },
  border:    allBorder(COLORS.border),
  numFmt:    typeof v === 'number' ? '#,##0' : undefined,
})

const dataCell = (v, bg = COLORS.white, extra = {}) => cell(v, {
  fill:      { fgColor: { rgb: bg } },
  alignment: { horizontal: typeof v === 'number' ? 'right' : 'left', vertical: 'center' },
  border:    allBorder(COLORS.border),
  ...extra,
})

const numCell = (v, bg = COLORS.white) => cell(v, {
  fill:      { fgColor: { rgb: bg } },
  alignment: { horizontal: 'right', vertical: 'center' },
  border:    allBorder(COLORS.border),
  numFmt:    '#,##0',
  font:      { bold: true },
})

const allBorder = (color = COLORS.border) => ({
  top:    { style: 'thin', color: { rgb: color } },
  bottom: { style: 'thin', color: { rgb: color } },
  left:   { style: 'thin', color: { rgb: color } },
  right:  { style: 'thin', color: { rgb: color } },
})

const emptyRow = () => [cell('')]

/* ─── Détecteur de type ─── */
const detectType = (data, filename) => {
  const fn = filename.toLowerCase()
  if (fn.includes('vente'))    return 'ventes'
  if (fn.includes('commande')) return 'commandes'
  if (fn.includes('livraison'))return 'livraisons'
  if (fn.includes('stock'))    return 'stocks'
  if (fn.includes('produit'))  return 'produits'
  return 'generic'
}

/* ════════════════════════════════════
   BUILDERS PAR TYPE
════════════════════════════════════ */

/* ── VENTES ── */
const buildVentes = (data) => {
  const rows   = []
  const now    = new Date().toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' })
  const total  = data.reduce((s, r) => s + (Number(r['TTC (F)'] ?? r.ttc ?? r.TTC ?? 0)), 0)
  const totalHT= data.reduce((s, r) => s + (Number(r['HT (F)']  ?? r.ht ?? r.HT ?? 0)), 0)
  const totalTV= data.reduce((s, r) => s + (Number(r['TVA (F)'] ?? r.tva ?? r.TVA ?? 0)), 0)
  const nb     = data.length

  const modeCount = data.reduce((acc, r) => {
    const m = r.Mode || r.mode || 'Inconnu'
    acc[m] = (acc[m] || 0) + 1
    return acc
  }, {})

  /* Titre */
  rows.push([boldCenter('RAPPORT DES VENTES', {
    font: { bold: true, sz: 16, color: { rgb: COLORS.white } },
    fill: { fgColor: { rgb: COLORS.primary } },
    alignment: { horizontal: 'center', vertical: 'center' },
  }), ...Array(6).fill(cell(''))])
  rows.push([boldCenter(`Généré le ${now}`, {
    font: { sz: 10, color: { rgb: COLORS.grayDark } },
    alignment: { horizontal: 'center' },
  }), ...Array(6).fill(cell(''))])
  rows.push(emptyRow())

  /* KPIs */
  rows.push([boldCenter('📊 STATISTIQUES CLÉS', {
    font: { bold: true, sz: 11, color: { rgb: COLORS.header } },
    fill: { fgColor: { rgb: COLORS.subheader } },
    alignment: { horizontal: 'center' },
  }), ...Array(6).fill(cell(''))])

  rows.push([
    statLabelCell('Nb. ventes'),
    statValueCell(nb, COLORS.blueLight, COLORS.info),
    cell(''),
    statLabelCell('Total HT'),
    statValueCell(totalHT, COLORS.yellowLight, COLORS.warning),
    cell(''),
    cell(''),
  ])
  rows.push([
    statLabelCell('Total TVA (18%)'),
    statValueCell(totalTV, COLORS.redLight, COLORS.error),
    cell(''),
    statLabelCell('Total TTC'),
    statValueCell(total, COLORS.greenLight, COLORS.success),
    cell(''),
    cell(''),
  ])
  rows.push([
    statLabelCell('Panier moyen TTC'),
    statValueCell(nb ? Math.round(total / nb) : 0, COLORS.blueLight, COLORS.primary),
    cell(''),
    cell(''), cell(''), cell(''), cell(''),
  ])
  rows.push(emptyRow())

  /* Répartition par mode */
  rows.push([boldCenter('💳 RÉPARTITION PAR MODE DE PAIEMENT', {
    font: { bold: true, sz: 11, color: { rgb: COLORS.header } },
    fill: { fgColor: { rgb: COLORS.subheader } },
    alignment: { horizontal: 'center' },
  }), ...Array(6).fill(cell(''))])

  const modeColors = { 'Espèces': COLORS.greenLight, 'Carte': COLORS.blueLight, 'Mobile Money': COLORS.yellowLight }
  Object.entries(modeCount).forEach(([mode, count]) => {
    const pct = Math.round(count / nb * 100)
    const bar = '█'.repeat(Math.round(pct / 5)) + '░'.repeat(20 - Math.round(pct / 5))
    rows.push([
      statLabelCell(mode),
      statValueCell(count, modeColors[mode] || COLORS.gray, COLORS.header),
      cell(`${pct}%`, { font: { bold: true }, alignment: { horizontal: 'center' } }),
      cell(bar, { font: { color: { rgb: COLORS.primary }, sz: 8 }, alignment: { horizontal: 'left' } }),
      cell(''), cell(''), cell(''),
    ])
  })
  rows.push(emptyRow())

  /* Tableau des ventes */
  rows.push([boldCenter('📋 DÉTAIL DES VENTES', {
    font: { bold: true, sz: 11, color: { rgb: COLORS.header } },
    fill: { fgColor: { rgb: COLORS.subheader } },
    alignment: { horizontal: 'center' },
  }), ...Array(6).fill(cell(''))])

  const headers = ['#', 'Date', 'Caissier', 'Mode', 'HT (FCFA)', 'TVA (FCFA)', 'TTC (FCFA)']
  rows.push(headers.map(h => headerCell(h)))

  data.forEach((r, i) => {
    const bg = i % 2 === 0 ? COLORS.white : COLORS.gray
    rows.push([
      dataCell(r.ID || r.id || `#${i+1}`, bg, { font: { bold: true, color: { rgb: COLORS.primary } } }),
      dataCell(r.Date || r.date || '—', bg),
      dataCell(r.Caissier || r.caissier || '—', bg),
      dataCell(r.Mode || r.mode || '—', bg),
      numCell(Number(r['HT (F)'] ?? r.ht ?? r.HT ?? 0), bg),
      numCell(Number(r['TVA (F)'] ?? r.tva ?? r.TVA ?? 0), bg),
      numCell(Number(r['TTC (F)'] ?? r.ttc ?? r.TTC ?? 0), bg),
    ])
  })

  /* Total */
  rows.push([
    boldCenter('TOTAL', { font: { bold: true, color: { rgb: COLORS.white } }, fill: { fgColor: { rgb: COLORS.header } }, border: allBorder(COLORS.primary) }),
    cell('', { fill: { fgColor: { rgb: COLORS.header } } }),
    cell('', { fill: { fgColor: { rgb: COLORS.header } } }),
    cell('', { fill: { fgColor: { rgb: COLORS.header } } }),
    numCell(totalHT, COLORS.yellowLight),
    numCell(totalTV, COLORS.redLight),
    numCell(total, COLORS.greenLight),
  ])

  const merges = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 6 } },
  ]
  const cols = [{ wch: 8 }, { wch: 14 }, { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }]
  return { rows, merges, cols }
}

/* ── COMMANDES ── */
const buildCommandes = (data) => {
  const rows = []
  const now  = new Date().toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' })
  const total = data.reduce((s, r) => s + (Number(r.montantTotal) || 0), 0)

  const statutCount = data.reduce((acc, r) => {
    const s = r.statut || 'Inconnu'
    acc[s] = (acc[s] || 0) + 1
    return acc
  }, {})

  /* Titre */
  rows.push([boldCenter('RAPPORT DES COMMANDES', {
    font: { bold: true, sz: 16, color: { rgb: COLORS.white } },
    fill: { fgColor: { rgb: '059669' } },
    alignment: { horizontal: 'center', vertical: 'center' },
  }), ...Array(3).fill(cell(''))])
  rows.push([boldCenter(`Généré le ${now}`, {
    font: { sz: 10, color: { rgb: COLORS.grayDark } },
    alignment: { horizontal: 'center' },
  }), ...Array(3).fill(cell(''))])
  rows.push(emptyRow())

  /* KPIs */
  rows.push([boldCenter('📊 STATISTIQUES', {
    font: { bold: true, sz: 11, color: { rgb: COLORS.header } },
    fill: { fgColor: { rgb: COLORS.subheader } },
    alignment: { horizontal: 'center' },
  }), ...Array(3).fill(cell(''))])

  rows.push([statLabelCell('Nb. commandes'), statValueCell(data.length, COLORS.blueLight, COLORS.info), cell(''), cell('')])
  rows.push([statLabelCell('Montant total'), statValueCell(total, COLORS.greenLight, COLORS.success), cell(''), cell('')])
  rows.push(emptyRow())

  /* Répartition statuts */
  rows.push([boldCenter('📦 PAR STATUT', {
    font: { bold: true, sz: 11, color: { rgb: COLORS.header } },
    fill: { fgColor: { rgb: COLORS.subheader } },
    alignment: { horizontal: 'center' },
  }), ...Array(3).fill(cell(''))])

  const statutColors = {
    'En attente': COLORS.yellowLight,
    'Confirmée':  COLORS.blueLight,
    'Expédiée':   COLORS.subheader,
    'Livrée':     COLORS.greenLight,
    'Annulée':    COLORS.redLight,
  }
  Object.entries(statutCount).forEach(([statut, count]) => {
    rows.push([
      statLabelCell(statut),
      statValueCell(count, statutColors[statut] || COLORS.gray, COLORS.header),
      cell(''), cell(''),
    ])
  })
  rows.push(emptyRow())

  /* Tableau */
  rows.push([boldCenter('📋 DÉTAIL DES COMMANDES', {
    font: { bold: true, sz: 11, color: { rgb: COLORS.header } },
    fill: { fgColor: { rgb: COLORS.subheader } },
    alignment: { horizontal: 'center' },
  }), ...Array(3).fill(cell(''))])

  rows.push(['N°', 'Date', 'Statut', 'Montant (FCFA)'].map(h => headerCell(h)))

  data.forEach((r, i) => {
    const bg = i % 2 === 0 ? COLORS.white : COLORS.gray
    const sColor = {
      'Livrée': COLORS.greenLight, 'En attente': COLORS.yellowLight,
      'Annulée': COLORS.redLight,  'Confirmée': COLORS.blueLight,
    }[r.statut] || bg

    rows.push([
      dataCell(r.idCommande, bg, { font: { bold: true, color: { rgb: COLORS.primary } } }),
      dataCell(r.dateCommande, bg),
      cell(r.statut, { fill: { fgColor: { rgb: sColor } }, alignment: { horizontal: 'center' }, border: allBorder(COLORS.border), font: { bold: true } }),
      numCell(Number(r.montantTotal) || 0, bg),
    ])
  })

  rows.push([
    boldCenter('TOTAL', { font: { bold: true, color: { rgb: COLORS.white } }, fill: { fgColor: { rgb: COLORS.header } }, border: allBorder(COLORS.primary) }),
    cell('', { fill: { fgColor: { rgb: COLORS.header } } }),
    cell('', { fill: { fgColor: { rgb: COLORS.header } } }),
    numCell(total, COLORS.greenLight),
  ])

  const merges = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 3 } },
  ]
  const cols = [{ wch: 8 }, { wch: 16 }, { wch: 14 }, { wch: 18 }]
  return { rows, merges, cols }
}

/* ── LIVRAISONS ── */
const buildLivraisons = (data) => {
  const rows  = []
  const now   = new Date().toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' })
  const total = data.reduce((s, r) => s + (Number(r.montantTotal) || 0), 0)

  rows.push([boldCenter('RAPPORT DES LIVRAISONS', {
    font: { bold: true, sz: 16, color: { rgb: COLORS.white } },
    fill: { fgColor: { rgb: 'D97706' } },
    alignment: { horizontal: 'center', vertical: 'center' },
  }), ...Array(4).fill(cell(''))])
  rows.push([boldCenter(`Généré le ${now}`, {
    font: { sz: 10, color: { rgb: COLORS.grayDark } },
    alignment: { horizontal: 'center' },
  }), ...Array(4).fill(cell(''))])
  rows.push(emptyRow())

  rows.push([boldCenter('📊 STATISTIQUES', {
    font: { bold: true, sz: 11, color: { rgb: COLORS.header } },
    fill: { fgColor: { rgb: COLORS.subheader } },
    alignment: { horizontal: 'center' },
  }), ...Array(4).fill(cell(''))])

  rows.push([statLabelCell('Nb. livraisons'), statValueCell(data.length, COLORS.blueLight, COLORS.info), cell(''), cell(''), cell('')])
  rows.push([statLabelCell('Montant total'),  statValueCell(total, COLORS.greenLight, COLORS.success), cell(''), cell(''), cell('')])
  rows.push(emptyRow())

  rows.push(['#', 'Commande', 'Date livraison', 'Montant (FCFA)', 'Statut'].map(h => headerCell(h)))

  data.forEach((r, i) => {
    const bg = i % 2 === 0 ? COLORS.white : COLORS.gray
    const sColor = { 'Livrée': COLORS.greenLight, 'En attente': COLORS.yellowLight, 'Annulée': COLORS.redLight }[r.statut] || bg
    rows.push([
      dataCell(r.idLivraison, bg, { font: { bold: true, color: { rgb: COLORS.primary } } }),
      dataCell(r.idCommande, bg),
      dataCell(r.dateLivraison, bg),
      numCell(Number(r.montantTotal) || 0, bg),
      cell(r.statut, { fill: { fgColor: { rgb: sColor } }, alignment: { horizontal: 'center' }, border: allBorder(COLORS.border), font: { bold: true } }),
    ])
  })

  rows.push([
    boldCenter('TOTAL', { font: { bold: true, color: { rgb: COLORS.white } }, fill: { fgColor: { rgb: COLORS.header } }, border: allBorder(COLORS.primary) }),
    cell('', { fill: { fgColor: { rgb: COLORS.header } } }),
    cell('', { fill: { fgColor: { rgb: COLORS.header } } }),
    numCell(total, COLORS.greenLight),
    cell('', { fill: { fgColor: { rgb: COLORS.header } } }),
  ])

  const merges = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 4 } },
  ]
  const cols = [{ wch: 8 }, { wch: 14 }, { wch: 16 }, { wch: 18 }, { wch: 14 }]
  return { rows, merges, cols }
}

/* ── GÉNÉRIQUE ── */
const buildGeneric = (data) => {
  if (!data.length) return { rows: [], merges: [], cols: [] }
  const keys = Object.keys(data[0])
  const rows = []
  rows.push(keys.map(k => headerCell(k)))
  data.forEach((r, i) => {
    const bg = i % 2 === 0 ? COLORS.white : COLORS.gray
    rows.push(keys.map(k => dataCell(r[k], bg)))
  })
  const cols = keys.map(() => ({ wch: 16 }))
  return { rows, merges: [], cols }
}

/* ════════════════════════════════════
   COMPOSANT
════════════════════════════════════ */
function ExportExcel({ data = [], filename = 'export', label = 'Excel' }) {
  const handleExport = () => {
    const type = detectType(data, filename)
    let rows, merges, cols

    if      (type === 'ventes')     ({ rows, merges, cols } = buildVentes(data))
    else if (type === 'commandes')  ({ rows, merges, cols } = buildCommandes(data))
    else if (type === 'livraisons') ({ rows, merges, cols } = buildLivraisons(data))
    else                            ({ rows, merges, cols } = buildGeneric(data))

    const ws = XLSX.utils.aoa_to_sheet(rows)
    ws['!merges'] = merges
    ws['!cols']   = cols

    /* Hauteurs des lignes */
    ws['!rows'] = rows.map((_, i) => ({ hpt: i === 0 ? 30 : 20 }))

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Rapport')

    /* Onglet données brutes */
    const wsRaw = XLSX.utils.json_to_sheet(data)
    XLSX.utils.book_append_sheet(wb, wsRaw, 'Données brutes')

    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array', cellStyles: true })
    const blob   = new Blob([buffer], { type: 'application/octet-stream' })
    saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  return (
    <button className="btn btn-sm btn-success gap-1" onClick={handleExport}>
      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      {label}
    </button>
  )
}

export default ExportExcel