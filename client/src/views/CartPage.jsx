import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../state/cart.jsx'
import { useAuth } from '../state/auth.jsx'

export function CartPage() {
  const { items, total, setQty, remove } = useCart()
  const { isAuthed } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Your cart</h2>
          <p className="text-sm text-slate-600">Review before checkout.</p>
        </div>
        <Link
          to="/products"
          className="rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-white"
        >
          Continue shopping
        </Link>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          {items.map((it) => (
            <div
              key={it.product._id}
              className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-slate-900">
                    {it.product.name}
                  </div>
                  <div className="text-sm text-slate-600">
                    {it.product.category} · ₹{it.product.price} each
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={it.qty}
                    onChange={(e) =>
                      setQty(it.product._id, Number(e.target.value || 1))
                    }
                    className="w-20 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-black outline-none focus:border-brand-500"
                  />
                  <button
                    onClick={() => remove(it.product._id)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}

          {!items.length ? (
            <div className="rounded-2xl border bg-white p-6 text-sm text-slate-600">
              Cart is empty. <Link to="/products">Browse products</Link>.
            </div>
          ) : null}
        </div>

        <aside className="space-y-3">
          <div className="mx-auto w-full max-w-3xl rounded-3xl border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Total</span>
              <span className="text-lg font-semibold text-slate-900">
                ₹{total.toFixed(0)}
              </span>
            </div>
            <button
              disabled={!items.length}
              onClick={() => {
                if (!isAuthed) navigate('/login')
                else navigate('/checkout')
              }}
              className="mt-5 w-full rounded-xl bg-emerald-600 px-4 py-4 text-base font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Checkout
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}

