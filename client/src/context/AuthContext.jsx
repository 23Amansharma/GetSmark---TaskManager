import { createContext, useState } from 'react'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('user')
      const parsed = u && u !== 'undefined' ? JSON.parse(u) : null
      // If we have a token but no user object (stale session), clear it
      if (localStorage.getItem('token') && (!parsed || !parsed.email)) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        return null
      }
      return parsed
    } catch {
      return null
    }
  })

  const login = (newToken, newUser) => {
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}