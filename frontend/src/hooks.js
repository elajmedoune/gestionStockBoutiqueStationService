import { useState, useEffect, useCallback } from 'react'
import api from './services/api'

function useFetch(endpoint) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get(endpoint)
      setData(Array.isArray(res.data) ? res.data : (res.data.data ?? []))
    } catch {
      setError('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }, [endpoint])

  useEffect(() => { fetch() }, [fetch])

  return { data, loading, error, refetch: fetch }
}

export const useVentes    = () => useFetch('/ventes')
export const useProduits  = () => useFetch('/produits')
export const useStocks    = () => useFetch('/stocks')
export const useCategories= () => useFetch('/categories')
export const useFournisseurs = () => useFetch('/fournisseurs')
export const useCommandes = () => useFetch('/commandes')
export const useLivraisons= () => useFetch('/livraisons')