import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../state/auth.jsx'

export function RequireAuth({ children, roles }) {
  const { isAuthed, user } = useAuth()
  const location = useLocation()

  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  if (roles?.length && !roles.includes(user?.role)) {
    return <Navigate to="/" replace />
  }
  return children
}

