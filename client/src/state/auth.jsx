import { createContext, useContext, useMemo, useState } from 'react'
import { clearSession, getToken, getUser, setSession } from '../lib/storage.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getToken())
  const [user, setUser] = useState(getUser())

  const value = useMemo(() => {
    return {
      token,
      user,
      isAuthed: Boolean(token),
      login: ({ token: nextToken, user: nextUser }) => {
        setSession({ token: nextToken, user: nextUser })
        setToken(nextToken)
        setUser(nextUser)
      },
      logout: () => {
        clearSession()
        setToken('')
        setUser(null)
      },
    }
  }, [token, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

