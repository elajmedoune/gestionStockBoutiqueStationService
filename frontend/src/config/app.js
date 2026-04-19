// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION DE L'ENTREPRISE CLIENTE
// Modifie uniquement ce fichier pour personnaliser l'application
// ─────────────────────────────────────────────────────────────────────────────
const appConfig = {
  // Nom du logiciel (ne pas modifier)
  appName: 'Gestion Stock',

  // Informations de l'entreprise cliente
  company: {
    name:    'Boutique Station Service',  // ← Nom affiché partout
    slogan:  'Station Service',           // ← Sous-titre dans la sidebar
    logo:    '/cs-logo.jpg',                        // ← Mettre '/logo.png' quand disponible
    email:   '',                          // ← Optionnel — apparaît dans les PDFs
    phone:   '',                          // ← Optionnel — apparaît dans les PDFs
    address: 'Thiés, Sénégal',            // ← Optionnel — apparaît dans les PDFs
  },

  // Monnaie affichée dans l'app et les PDFs
  currency: 'FCFA',

  // TVA appliquée
  tva: 18,
}

export default appConfig