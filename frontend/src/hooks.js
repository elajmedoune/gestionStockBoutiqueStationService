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

  if (role === 'gerant') {
    commandes.filter(c => c.statut === 'livree').forEach(c => notifications.push({
      id: `cmd-livree-${c.idCommande}`, label: 'Commande livrée',
      message: `Commande #${c.idCommande} a été livrée`, date: c.dateLivraisonPrevue, niveau: 'success'
    }))
    const il7 = new Date(); il7.setDate(il7.getDate() - 7)
    commandes.filter(c => new Date(c.dateCommande) >= il7).forEach(c => notifications.push({
      id: `cmd-new-${c.idCommande}`, label: 'Nouvelle commande',
      message: `Commande #${c.idCommande} créée`, date: c.dateCommande, niveau: 'info'
    }))
    utilisateurs.filter(u => u.created_at && new Date(u.created_at) >= il7).forEach(u => notifications.push({
      id: `user-new-${u.idUtilisateur}`, label: 'Nouvel utilisateur',
      message: `${u.prenom} ${u.nom} a rejoint l'équipe`, date: u.created_at, niveau: 'info'
    }))
  }

  if (role === 'gestionnaire_stock') {
    livraisons.filter(l => l.statut === 'livree' || l.statut === 'reçue').forEach(l => notifications.push({
      id: `liv-recue-${l.idLivraison}`, label: 'Livraison reçue',
      message: `Livraison #${l.idLivraison} réceptionnée`, date: l.dateLivraison, niveau: 'success'
    }))
    commandes.filter(c => c.idUtilisateur === user?.idUtilisateur && c.statut === 'livree').forEach(c => notifications.push({
      id: `cmd-moi-livree-${c.idCommande}`, label: 'Commande livrée',
      message: `Votre commande #${c.idCommande} a été livrée`, date: c.dateLivraisonPrevue, niveau: 'success'
    }))
  }

  if (role === 'magasinier') {
    const todayStr = new Date().toDateString()
    commandes.filter(c => c.statut !== 'livree' && c.statut !== 'annulee' && c.dateLivraisonPrevue && new Date(c.dateLivraisonPrevue).toDateString() === todayStr).forEach(c => notifications.push({
      id: `liv-today-${c.idCommande}`, label: 'Livraison prévue',
      message: `Livraison attendue aujourd'hui — commande #${c.idCommande}`, date: c.dateLivraisonPrevue, niveau: 'warning'
    }))
  }

  if (role === 'caissier') {
    produits.filter(p => {
      const qte = stocks.filter(s => s.idProduit === p.idProduit).reduce((s, st) => s + (parseInt(st.quantiteRestante) || 0), 0)
      return qte === 0
    }).forEach(p => notifications.push({
      id: `rupture-${p.idProduit}`, label: 'Rupture de stock',
      message: `${p.reference ?? p.nomProduit} est en rupture`, date: null, niveau: 'error'
    }))
  }

  return notifications
}