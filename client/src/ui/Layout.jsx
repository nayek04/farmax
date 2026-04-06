import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/auth.jsx'
import { useCart } from '../state/cart.jsx'

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-full px-3 py-2 text-sm font-semibold transition ${
          isActive
            ? 'bg-emerald-500 text-white shadow-sm'
            : 'text-slate-200 hover:bg-white/10 hover:text-white'
        }`
      }
    >
      {children}
    </NavLink>
  )
}

export function Layout() {
  const { isAuthed, user, logout } = useAuth()
  const { items } = useCart()
  const navigate = useNavigate()

  return (
    <div className="min-h-full bg-[radial-gradient(1300px_700px_at_0%_0%,rgba(16,185,129,0.25),transparent_60%),radial-gradient(1100px_650px_at_100%_5%,rgba(249,115,22,0.22),transparent_60%),radial-gradient(1200px_700px_at_50%_45%,rgba(56,189,248,0.20),transparent_60%),radial-gradient(1000px_650px_at_20%_100%,rgba(168,85,247,0.18),transparent_60%),linear-gradient(135deg,#020617_0%,#0f172a_40%,#111827_72%,#1f2937_100%)] text-slate-100">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -left-32 -top-32 h-[30rem] w-[30rem] rounded-full bg-brand-300/80 blur-3xl" />
        <div className="absolute -right-32 top-10 h-[28rem] w-[28rem] rounded-full bg-orange-300/80 blur-3xl" />
        <div className="absolute left-1/3 top-[18rem] h-[30rem] w-[30rem] rounded-full bg-sky-300/70 blur-3xl" />
        <div className="absolute right-1/4 top-[34rem] h-[28rem] w-[28rem] rounded-full bg-violet-300/65 blur-3xl" />
        <div className="absolute left-8 top-[44rem] h-[24rem] w-[24rem] rounded-full bg-rose-300/55 blur-3xl" />
        <div className="absolute left-[46%] top-[4rem] h-[12rem] w-[12rem] rounded-full border-2 border-white/20 bg-white/10 backdrop-blur-sm" />
        <div className="absolute left-[10%] top-[28rem] h-2 w-2 rounded-full bg-white/70 shadow-[0_0_35px_8px_rgba(56,189,248,0.45)]" />
        <div className="absolute right-[18%] top-[22rem] h-2 w-2 rounded-full bg-white/70 shadow-[0_0_35px_8px_rgba(16,185,129,0.45)]" />
        <div className="absolute right-[32%] top-[52rem] h-2 w-2 rounded-full bg-white/70 shadow-[0_0_35px_8px_rgba(249,115,22,0.45)]" />
      </div>

      <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-900/40 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/logo.png" 
              alt="Farmax Logo" 
              className="h-auto w-12 rounded-xl object-contain shadow-sm ring-1 ring-white/40" 
            />
            <div className="leading-tight">
              <div className="text-base font-semibold text-white">Farmax</div>
              <div className="text-xs text-slate-300">
                Direct farm-to-door delivery
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            <NavItem to="/products">Products</NavItem>
            <NavItem to="/cart">
              <span className="inline-flex items-center gap-2">
                Cart
                <span className="grid h-6 min-w-6 place-items-center rounded-full bg-emerald-500 px-2 text-xs font-bold text-white">
                  {items.length}
                </span>
              </span>
            </NavItem>
            {user?.role === 'customer' ? <NavItem to="/customer-dashboard">Dashboard</NavItem> : null}
            {user?.role === 'customer' ? <NavItem to="/orders">Orders</NavItem> : null}
            {user?.role === 'farmer' || user?.role === 'admin' ? <NavItem to="/farmer-dashboard">Dashboard</NavItem> : null}
          </nav>

          <div className="flex items-center gap-2">
            {!isAuthed ? (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10 hover:text-white"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                <div className="hidden text-sm text-slate-200 sm:block">
                  {user?.name} <span className="text-slate-400">({user?.role})</span>
                </div>
                <button
                  onClick={() => logout()}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10 hover:text-white"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}

