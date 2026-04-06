import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { api } from '../lib/api.js'
import { useAuth } from '../state/auth.jsx'
import { dashboardPathForRole } from '../lib/dashboard.js'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/api/login', { email, password })
      login({ token: res.data.token, user: res.data.user })
      navigate(from === '/' ? dashboardPathForRole(res.data.user?.role) : from, {
        replace: true,
      })
    } catch (err) {
      setError(err?.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-3xl border border-white/70 bg-white/80 p-7 shadow-lg shadow-emerald-100/40 backdrop-blur">
        <h2 className="text-2xl font-semibold text-slate-900">Login</h2>
        <p className="mt-1 text-sm text-slate-600">
          Welcome back to Farmax.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <div>
            <label className="text-sm font-medium text-slate-900">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="mt-2 w-full rounded-2xl border border-slate-900/20 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-900">
              Password
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="mt-2 w-full rounded-2xl border border-slate-900/20 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900"
              placeholder="••••••••"
              required
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button
            disabled={loading}
            className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>

        <div className="mt-4 text-sm text-slate-600">
          No account?{' '}
          <Link className="font-semibold text-brand-700" to="/signup">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}

