// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../api/services'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user,  setUser]  = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })

  async function login(email, password) {
    const data = await authApi.login({ email, password })
    const me   = await authApi.me(data.access_token)
    setToken(data.access_token)
    setUser(me)
    localStorage.setItem('token', data.access_token)
    localStorage.setItem('user',  JSON.stringify(me))
    return me
  }

  function logout() {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const value = { token, user, login, logout, isAuthenticated: !!token }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
