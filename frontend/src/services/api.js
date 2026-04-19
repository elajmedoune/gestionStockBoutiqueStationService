import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
})

// Ajouter le token automatiquement à chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Gérer les erreurs automatiquement
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth
export const login = (credentials) => api.post('/login', credentials)
export const logout = () => api.post('/logout')
export const getMe = () => api.get('/me')

// Ventes
export const getVentes = () => api.get('/ventes')
export const getVente = (id) => api.get(`/ventes/${id}`)
export const createVente = (data) => api.post('/ventes', data)
export const deleteVente = (id) => api.delete(`/ventes/${id}`)

// Commandes
export const getCommandes = () => api.get('/commandes')
export const getCommande = (id) => api.get(`/commandes/${id}`)
export const createCommande = (data) => api.post('/commandes', data)
export const updateCommande = (id, data) => api.put(`/commandes/${id}`, data)
export const deleteCommande = (id) => api.delete(`/commandes/${id}`)

// Livraisons
export const getLivraisons = () => api.get('/livraisons')
export const getLivraison = (id) => api.get(`/livraisons/${id}`)
export const createLivraison = (data) => api.post('/livraisons', data)
export const deleteLivraison = (id) => api.delete(`/livraisons/${id}`)

export default api