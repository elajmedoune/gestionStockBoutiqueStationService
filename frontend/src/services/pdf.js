import jsPDF from 'jspdf'
import appConfig from '../config/app'

/* ── Couleurs ── */
const BLACK  = [15, 15, 15]
const DARK   = [40, 40, 40]
const GRAY   = [120, 120, 120]
const LGRAY = [150, 150, 150]

/* ── Utilitaires ── */
const fmt = n => Math.round(n || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
const fmtDate = d => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
const fmtDateTime = d => new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
const ascii = str => str?.normalize('NFD').replace(/[\u0300-\u036f]/g, '') ?? ''

/* ── Ligne ── */
const solidLine = (doc, y, x1 = 5, x2 = 75, thick = 0.2) => {
  doc.setDrawColor(...LGRAY)
  doc.setLineWidth(thick)
  doc.setLineDashPattern([2, 2], 0)
  doc.line(x1, y, x2, y)
  doc.setLineDashPattern([], 0)
  doc.setLineWidth(0.2)
}

/* ── Charger logo ── */
const loadLogoBase64 = (logoPath) => {
  if (!logoPath) return Promise.resolve(null)
  return new Promise(resolve => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      canvas.getContext('2d').drawImage(img, 0, 0)
      resolve(canvas.toDataURL('image/png').split(',')[1])
    }
    img.onerror = () => resolve(null)
    img.src = logoPath
  })
}

/* ════════════════════════════════════
   EXPORT TICKET DE CAISSE
════════════════════════════════════ */
export const exportTicketCaisse = async (vente) => {
  const lignes  = vente.lignes ?? []
  const hauteur = Math.max(150, 90 + lignes.length * 10 + 60)
  const doc     = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [80, hauteur] })
  const logoB64 = await loadLogoBase64(appConfig.company.logo)

  let y  = 10
  const L = 6
  const R = 74
  const C = 40

  /* ══ HEADER ══ */
  // Logo
  if (logoB64) {
    doc.addImage(logoB64, 'PNG', C - 6, y, 12, 12)
    y += 16
  }

  // Nom boutique
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...BLACK)
  doc.text(ascii(appConfig.company.name).toUpperCase(), C, y, { align: 'center' })
  y += 5

  // Adresse & téléphone
  doc.setFontSize(6.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...GRAY)
  if (appConfig.company.address) {
    doc.text(ascii(appConfig.company.address), C, y, { align: 'center' })
    y += 3.5
  }
  if (appConfig.company.phone) {
    doc.text('Tel : ' + appConfig.company.phone, C, y, { align: 'center' })
    y += 3.5
  }
  if (appConfig.company.email) {
    doc.text(appConfig.company.email, C, y, { align: 'center' })
    y += 3.5
  }

  y += 3
  solidLine(doc, y, L, R, 0.4)
  y += 6

  /* ══ TITRE ══ */
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...GRAY)
  doc.text('TICKET DE CAISSE', C, y, { align: 'center' })
  y += 7

  /* ══ INFOS VENTE ══ */
  doc.setFontSize(6.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...DARK)

  // N° + Date
  doc.text('N°', L, y)
  doc.setFont('helvetica', 'bold')
  doc.text(String(vente.idVente).padStart(6, '0'), L + 8, y)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...GRAY)
  doc.text(fmtDateTime(vente.dateVente), R, y, { align: 'right' })
  y += 5

  doc.setTextColor(...DARK)
  doc.text('Caissier', L, y)
  doc.setFont('helvetica', 'bold')
  doc.text(ascii(`${vente.utilisateur?.prenom ?? ''} ${vente.utilisateur?.nom ?? ''}`), R, y, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  y += 5

  doc.text('Paiement', L, y)
  doc.setFont('helvetica', 'bold')
  doc.text(vente.modePaiement?.toUpperCase() ?? '—', R, y, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  y += 6

  solidLine(doc, y, L, R)
  y += 5

  /* ══ EN-TÊTE COLONNES ══ */
  doc.setFontSize(6)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...GRAY)
  doc.text('ARTICLE', L, y)
  doc.text('QTE', 50, y, { align: 'right' })
  doc.text('P.U', 62, y, { align: 'right' })
  doc.text('TOTAL', R, y, { align: 'right' })
  y += 4

  solidLine(doc, y, L, R)
  y += 5

  /* ══ LIGNES PRODUITS ══ */
  doc.setTextColor(...BLACK)
  lignes.forEach((l, i) => {
    const nom = ascii(l.produit?.reference ?? `Produit #${l.idProduit}`)
    const nomCourt = nom.length > 20 ? nom.substring(0, 19) + '.' : nom

    // Fond alterné léger
    if (i % 2 === 0) {
      doc.setFillColor(250, 250, 250)
      doc.rect(L - 1, y - 3.5, R - L + 2, 7, 'F')
    }

    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...BLACK)
    doc.text(nomCourt, L, y)

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...DARK)
    doc.text(String(l.quantite), 50, y, { align: 'right' })
    doc.text(fmt(l.produit?.prixUnitaire), 62, y, { align: 'right' })

    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...BLACK)
    doc.text(fmt(l.totalPartielle), R, y, { align: 'right' })

    y += 8
  })

  if (lignes.length === 0) {
    doc.setFontSize(7)
    doc.setTextColor(...GRAY)
    doc.text('-- Aucun article --', C, y, { align: 'center' })
    y += 8
  }

  solidLine(doc, y, L, R)
  y += 4

  /* ══ NB ARTICLES ══ */
  const nbArticles = lignes.reduce((s, l) => s + (parseInt(l.quantite) || 0), 0)
  doc.setFontSize(6)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...GRAY)
  doc.text(`${nbArticles} article${nbArticles > 1 ? 's' : ''}`, L, y)
  y += 6

  /* ══ SOUS-TOTAUX ══ */
  doc.setFontSize(6.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...GRAY)

  doc.text('Sous-total HT', L, y)
  doc.text(fmt(vente.totalHorsTaxe) + ' ' + appConfig.currency, R, y, { align: 'right' })
  y += 5

  doc.text(`TVA (${appConfig.tva}%)`, L, y)
  doc.text(fmt(vente.tva) + ' ' + appConfig.currency, R, y, { align: 'right' })
  y += 6

  solidLine(doc, y, L, R, 0.4)
  y += 6

  /* ══ TOTAL TTC ══ */
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...BLACK)
  doc.text('TOTAL TTC :', L, y)
  doc.text(fmt(vente.totalTaxeComprise) + ' ' + appConfig.currency, R, y, { align: 'right' })
  y += 4

  solidLine(doc, y, L, R, 0.4)
  y += 8

  /* ══ FOOTER ══ */
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...DARK)
  doc.text('Merci pour votre achat !', C, y, { align: 'center' })
  y += 5

  doc.setFontSize(6)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...LGRAY)
  doc.text("Conservez ce ticket comme preuve d'achat.", C, y, { align: 'center' })
  y += 5

  doc.setFontSize(5.5)
  doc.setTextColor(...LGRAY)
  doc.text(`${appConfig.appName}  —  ${fmtDate(new Date())}`, C, y, { align: 'center' })

  /* ══ IMPRESSION ══ */
  const blob = doc.output('blob')
  const url  = URL.createObjectURL(blob)
  const win  = window.open(url, '_blank')
  if (win) win.onload = () => { win.focus(); win.print() }
}