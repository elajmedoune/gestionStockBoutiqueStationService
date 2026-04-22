import { createContext, useContext, useState } from 'react'
import { login as loginApi, logout as logoutApi } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user')
      return saved && saved !== 'undefined' ? JSON.parse(saved) : null
    } catch {
      localStorage.removeItem('user')
      return null
    }
  })

  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null
  })

  const login = async (credentials) => {
    const response = await loginApi(credentials)
    const { token, utilisateur } = response.data

    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(utilisateur)) 

    setToken(token)
    setUser(utilisateur)

    return utilisateur 
  }

  const logout = async () => {
    try {
      await logoutApi()
    } catch (e) {}

    
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
à