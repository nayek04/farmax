import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../lib/api.js'
import { useCart } from '../state/cart.jsx'

function categoryPill(category) {
  if (category === 'Vegetables') return 'bg-emerald-100 text-emerald-900 ring-emerald-200/70'
  if (category === 'Fruits') return 'bg-orange-100 text-orange-900 ring-orange-200/70'
  if (category === 'Dry Fruits') return 'bg-amber-100 text-amber-900 ring-amber-200/70'
  return 'bg-slate-100 text-slate-900 ring-slate-200/70'
}

export function ProductDetailsPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [recs, setRecs] = useState([])
  const [loading, setLoading] = useState(true)
  const { add } = useCart()

  useEffect(() => {
    let cancelled = false
    async function run() {
      setLoading(true)
      try {
        const res = await api.get(`/api/products/${id}`)
        if (!cancelled) setProduct(res.data.product)
        const rec = await api.get(`/api/ai/recommendations?seedProductId=${id}`)
        if (!cancelled) setRecs(rec.data.recommendations || [])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <div className="rounded-xl border bg-white p-6 text-sm text-slate-600">
        Loading…
      </div>
    )
  }
  if (!product) {
    return (
      <div className="rounded-xl border bg-white p-6 text-sm text-slate-600">
        Product not found. <Link to="/products">Back</Link>
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="overflow-hidden rounded-3xl bg-white/70 shadow-sm ring-1 ring-white/50">
          <div className="relative h-44">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-white/10 to-orange-500/20" />
            {product.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0">
                <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full bg-brand-200/70 blur-3xl" />
                <div className="absolute left-6 top-6 rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-slate-800 shadow-sm ring-1 ring-white/40">
                  Farmax
                </div>
              </div>
            )}
          </div>

          <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                {product.name}
              </h2>
              <div className="mt-2 inline-flex items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold shadow-sm ring-1 ${categoryPill(
                    product.category,
                  )}`}
                >
                  {product.category}
                </span>
                <span className="text-xs text-slate-500">
                  Direct from farmer
                </span>
              </div>
            </div>
            <div className="rounded-full bg-slate-900 px-4 py-2 text-base font-bold text-white shadow-sm">
              ₹{product.price}
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-white/40">
              <div className="text-xs font-semibold text-slate-500">Stock</div>
              <div className="mt-1 text-lg font-bold text-slate-900">
                {product.quantity}
              </div>
            </div>
            <div className="rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-white/40">
              <div className="text-xs font-semibold text-slate-500">ETA</div>
              <div className="mt-1 text-lg font-bold text-slate-900">
                6–24h
              </div>
            </div>
            <div className="rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-white/40">
              <div className="text-xs font-semibold text-slate-500">Quality</div>
              <div className="mt-1 text-lg font-bold text-slate-900">
                Farm fresh
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <button
              onClick={() => add(product, 1)}
              className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              Add to cart
            </button>
            <Link
              to="/cart"
              className="rounded-full border border-white/60 bg-white/70 px-6 py-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-white"
            >
              Go to cart
            </Link>
          </div>
          </div>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-3xl bg-white/70 p-6 shadow-sm ring-1 ring-white/50">
          <div className="text-sm font-semibold text-slate-900">
            Estimated delivery
          </div>
          <div className="mt-1 text-sm text-slate-600">
            Direct from the farm. Typical ETA: 6–24 hours.
          </div>
        </div>

        <div className="rounded-3xl bg-white/70 p-6 shadow-sm ring-1 ring-white/50">
          <div className="text-sm font-semibold text-slate-900">
            Recommended with this
          </div>
          <div className="mt-3 space-y-2">
            {recs.slice(0, 5).map((p) => (
              <Link
                key={p._id}
                to={`/products/${p._id}`}
                className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/60 px-3 py-2 text-sm shadow-sm hover:bg-white"
              >
                <span className="font-medium text-slate-900">{p.name}</span>
                <span className="text-slate-500">₹{p.price}</span>
              </Link>
            ))}
            {!recs.length ? (
              <div className="text-sm text-slate-500">No suggestions yet.</div>
            ) : null}
          </div>
        </div>
      </aside>
    </div>
  )
}

