import { useState, useEffect, useCallback } from 'react'
import api from './services/api'

// Cache global partagé entre toutes les pages
const cache = {}
const subscribers = {}

function useFetch(endpoint) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (cache[endpoint]) {
      setData(cache[endpoint])
      return
    }
    if (!subscribers[endpoint]) subscribers[endpoint] = new Set()
    subscribers[endpoint].add(setData)
    return () => { subscribers[endpoint]?.delete(setData) }
  }, [endpoint])

  const doFetch = useCallback(async () => {
    if (!endpoint) return
    if (cache[endpoint]) { setData(cache[endpoint]); return }
    setLoading(true)
    try {
      const res = await api.get(endpoint)
      const result = Array.isArray(res.data) ? res.data : (res.data.data ?? [])
      cache[endpoint] = result
      subscribers[endpoint]?.forEach(cb => cb(result))
    } catch (err) {
      if (err?.response?.status === 403 || err?.response?.status === 404) {
        cache[endpoint] = []
        setData([])
      } else {
        setError('Erreur de chargement')
      }
    } finally {
      setLoading(false)
    }
  }, [endpoint])

  useEffect(() => {
    if (!endpoint) return
    if (!subscribers[endpoint]) subscribers[endpoint] = new Set()
    subscribers[endpoint].add(setData)
    if (!cache[endpoint]) doFetch()
    return () => { subscribers[endpoint]?.delete(setData) }
  }, [endpoint, doFetch])

  const refetch = useCallback(async () => {
    if (!endpoint) return
    delete cache[endpoint]
    await doFetch()
  }, [endpoint, doFetch])

  return { data, loading, error, refetch }
}

export const useVentes       = () => useFetch('/ventes')
export const useProduits     = () => useFetch('/produits')
export const useStocks       = () => useFetch('/stocks')
export const useCategories   = () => useFetch('/categories')
export const useFournisseurs = () => useFetch('/fournisseurs')
export const useCommandes    = () => useFetch('/commandes')
export const useLivraisons   = () => useFetch('/livraisons')
export const useUtilisateurs = () => {
  const user = JSON.parse(localStorage.getItem('user'))
  return useFetch(user?.role === 'gerant' ? '/utilisateurs' : null)
}

export const useNotifications = (user, { commandes = [], livraisons = [], utilisateurs = [], produits = [], stocks = [] }) => {
  const role = user?.role
  const notifications = []
  const il7 = new Date(); il7.setDate(il7.getDate() - 7)
  const today = new Date(); today.setHours(0, 0, 0, 0)

  // ── Alertes stock (tous les rôles sauf caissier) ──
  if (role !== 'caissier') {
    produits.forEach(p => {
      const qte = stocks.filter(s => s.idProduit === p.idProduit).reduce((s, st) => s + (parseInt(st.quantiteRestante) || 0), 0)
      const seuil = parseInt(p.seuilSecurite ?? 5)
      if (qte === 0) {
        notifications.push({
          id: `rupture-${p.idProduit}`,
          label: 'Rupture de stock',
          message: `${p.nomProduit ?? p.reference} est en rupture de stock`,
          date: null,
          niveau: 'error',
          icone: 'rupture'
        })
      } else if (qte <= seuil) {
        notifications.push({
          id: `seuil-${p.idProduit}`,
          label: 'Stock sous seuil',
          message: `${p.nomProduit ?? p.reference} — ${qte} unités restantes (seuil: ${seuil})`,
          date: null,
          niveau: 'warning',
          icone: 'seuil'
        })
      }
    })
  }

  // ── Caissier ──
  if (role === 'caissier') {
    produits.filter(p => {
      const qte = stocks.filter(s => s.idProduit === p.idProduit).reduce((s, st) => s + (parseInt(st.quantiteRestante) || 0), 0)
      return qte === 0
    }).forEach(p => notifications.push({
      id: `rupture-${p.idProduit}`,
      label: 'Rupture de stock',
      message: `${p.nomProduit ?? p.reference} est en rupture`,
      date: null,
      niveau: 'error',
      icone: 'rupture'
    }))
  }

  // ── Gérant ──
  if (role === 'gerant') {
    // Commandes en retard
    commandes.filter(c => {
      const prevue = c.dateLivraisonPrevue ? new Date(c.dateLivraisonPrevue) : null
      return prevue && prevue < today && c.statut !== 'livree' && c.statut !== 'annulee'
    }).forEach(c => {
      const jours = Math.floor((today - new Date(c.dateLivraisonPrevue)) / (1000 * 60 * 60 * 24))
      notifications.push({
        id: `cmd-retard-${c.idCommande}`,
        label: 'Commande en retard',
        message: `Commande #${c.idCommande} — ${jours} jour(s) de retard`,
        date: c.dateLivraisonPrevue,
        niveau: 'error',
        icone: 'retard'
      })
    })

    // Nouvelles commandes (7 derniers jours)
    commandes.filter(c => new Date(c.dateCommande) >= il7).forEach(c => notifications.push({
      id: `cmd-new-${c.idCommande}`,
      label: 'Nouvelle commande',
      message: `Commande #${c.idCommande} créée — ${c.statut}`,
      date: c.dateCommande,
      niveau: 'info',
      icone: 'commande'
    }))

    // Commandes livrées
    commandes.filter(c => c.statut === 'livree').forEach(c => notifications.push({
      id: `cmd-livree-${c.idCommande}`,
      label: 'Commande livrée',
      message: `Commande #${c.idCommande} a été livrée`,
      date: c.dateLivraisonPrevue,
      niveau: 'success',
      icone: 'livraison'
    }))

    // Nouveaux utilisateurs
    utilisateurs.filter(u => u.created_at && new Date(u.created_at) >= il7).forEach(u => notifications.push({
      id: `user-new-${u.idUtilisateur}`,
      label: 'Nouvel utilisateur',
      message: `${u.prenom} ${u.nom} a rejoint l'équipe`,
      date: u.created_at,
      niveau: 'info',
      icone: 'utilisateur'
    }))
  }

  // ── Gestionnaire stock ──
  if (role === 'gestionnaire_stock') {
    // Livraisons reçues
    livraisons.filter(l => l.statut === 'livree').forEach(l => notifications.push({
      id: `liv-recue-${l.idLivraison}`,
      label: 'Livraison reçue',
      message: `Livraison #${l.idLivraison} réceptionnée`,
      date: l.dateLivraison,
      niveau: 'success',
      icone: 'livraison'
    }))

    // Commandes en retard
    commandes.filter(c => {
      const prevue = c.dateLivraisonPrevue ? new Date(c.dateLivraisonPrevue) : null
      return prevue && prevue < today && c.statut !== 'livree' && c.statut !== 'annulee'
    }).forEach(c => {
      const jours = Math.floor((today - new Date(c.dateLivraisonPrevue)) / (1000 * 60 * 60 * 24))
      notifications.push({
        id: `cmd-retard-${c.idCommande}`,
        label: 'Commande en retard',
        message: `Commande #${c.idCommande} — ${jours} jour(s) de retard`,
        date: c.dateLivraisonPrevue,
        niveau: 'error',
        icone: 'retard'
      })
    })
  }

  // ── Magasinier ──
  if (role === 'magasinier') {
    // Livraisons à réceptionner aujourd'hui
    commandes.filter(c => {
      if (c.statut === 'livree' || c.statut === 'annulee') return false
      const prevue = c.dateLivraisonPrevue ? new Date(c.dateLivraisonPrevue) : null
      if (!prevue) return false
      const prevueDay = new Date(prevue); prevueDay.setHours(0, 0, 0, 0)
      return prevueDay.getTime() === today.getTime()
    }).forEach(c => notifications.push({
      id: `liv-today-${c.idCommande}`,
      label: 'Livraison prévue aujourd\'hui',
      message: `Commande #${c.idCommande} attendue aujourd'hui`,
      date: c.dateLivraisonPrevue,
      niveau: 'warning',
      icone: 'livraison'
    }))

    // Livraisons en attente de validation
    livraisons.filter(l => l.statut === 'en_attente').forEach(l => notifications.push({
      id: `liv-attente-${l.idLivraison}`,
      label: 'Livraison à valider',
      message: `Livraison #${l.idLivraison} en attente de réception`,
      date: l.dateLivraison,
      niveau: 'warning',
      icone: 'livraison'
    }))
  }

  return notifications
}