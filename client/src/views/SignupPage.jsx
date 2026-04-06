import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api.js'
import { useAuth } from '../state/auth.jsx'
import { dashboardPathForRole } from '../lib/dashboard.js'

export function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('customer')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/api/signup', { name, email, password, role })
      login({ token: res.data.token, user: res.data.user })
      navigate(dashboardPathForRole(res.data.user?.role), { replace: true })
    } catch (err) {
      setError(err?.response?.data?.error || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-3xl border border-white/70 bg-white/80 p-7 shadow-lg shadow-emerald-100/40 backdrop-blur">
        <h2 className="text-2xl font-semibold text-slate-900">Create account</h2>
        <p className="mt-1 text-sm text-slate-600">
          Join as a customer or a farmer.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <div>
            <label className="text-sm font-medium text-slate-900">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-900/20 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-900">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="mt-2 w-full rounded-2xl border border-slate-900/20 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900"
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
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-900">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-900/20 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-900"
            >
              <option value="customer">Customer</option>
              <option value="farmer">Farmer</option>
            </select>
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
            {loading ? 'Creating…' : 'Sign up'}
          </button>
        </form>

        <div className="mt-4 text-sm text-slate-600">
          Already have an account?{' '}
          <Link className="font-semibold text-brand-700" to="/login">
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}

