import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api.js'
import { useCart } from '../state/cart.jsx'

const CATEGORIES = ['All', 'Vegetables', 'Fruits', 'Dry Fruits']

function categoryStyle(category) {
  if (category === 'Vegetables')
    return {
      chip: 'bg-transparent text-emerald-200 ring-emerald-400/40',
      media: 'from-emerald-500/25 to-lime-400/25',
    }
  if (category === 'Fruits')
    return {
      chip: 'bg-transparent text-orange-200 ring-orange-400/40',
      media: 'from-orange-500/25 to-rose-400/25',
    }
  if (category === 'Dry Fruits')
    return {
      chip: 'bg-transparent text-amber-200 ring-amber-400/40',
      media: 'from-amber-500/25 to-yellow-400/25',
    }
  return {
    chip: 'bg-transparent text-slate-200 ring-slate-400/40',
    media: 'from-slate-200/40 to-slate-100/40',
  }
}

export function ProductsPage() {
  const [products, setProducts] = useState([])
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const { add } = useCart()

  useEffect(() => {
    let cancelled = false
    async function run() {
      setLoading(true)
      try {
        const res = await api.get('/api/products')
        if (!cancelled) setProducts(res.data.products || [])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return products.filter((p) => {
      const matchText =
        !needle ||
        p.name?.toLowerCase().includes(needle) ||
        p.category?.toLowerCase().includes(needle)
      const matchCategory = category === 'All' || p.category === category
      return matchText && matchCategory
    })
  }, [products, q, category])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Products</h2>
          <p className="text-sm text-slate-300">
            Delivered directly from farms.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search..."
            className="w-full rounded-full border border-white/15 bg-slate-900/40 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-400 outline-none shadow-sm ring-1 ring-white/10 focus:border-brand-500 sm:w-72"
          />
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const active = category === c
              const style = categoryStyle(c === 'All' ? '' : c)
              return (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`rounded-full px-3 py-2 text-sm font-semibold shadow-sm ring-1 transition ${
                    active
                      ? 'bg-emerald-500 text-white ring-emerald-500'
                      : `${style.chip} hover:bg-slate-800/70`
                  }`}
                >
                  {c}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-3xl bg-slate-900/45 shadow-sm ring-1 ring-white/10"
            >
              <div className="h-28 bg-gradient-to-br from-slate-700/60 to-slate-800/60" />
              <div className="space-y-3 p-5">
                <div className="h-4 w-2/3 rounded bg-slate-600/70" />
                <div className="h-4 w-1/3 rounded bg-slate-600/70" />
                <div className="h-9 w-full rounded-xl bg-slate-600/70" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <div
              key={p._id}
              className="group overflow-hidden rounded-3xl bg-slate-900/45 shadow-sm ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative h-28">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${
                    categoryStyle(p.category).media
                  }`}
                />
                {p.images?.[0] ? (
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="absolute inset-0 h-full w-full object-cover opacity-90"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0">
                    <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/20 blur-2xl transition group-hover:scale-110" />
                    <div className="absolute left-5 top-7 text-sm font-semibold text-white/70">
                      Farmax
                    </div>
                  </div>
                )}
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-white">
                      {p.name}
                    </div>
                    <div
                      className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold shadow-sm ring-1 ${categoryStyle(
                        p.category,
                      ).chip}`}
                    >
                      {p.category}
                    </div>
                  </div>
                  <div className="rounded-full bg-emerald-500 px-3 py-1 text-sm font-bold text-white shadow-sm">
                    ₹{p.price}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-sm text-slate-300">
                  <span>Stock</span>
                  <span className="font-semibold text-white">
                    {p.quantity}
                  </span>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link
                    to={`/products/${p._id}`}
                    className="flex-1 rounded-full border border-white/20 bg-slate-800/60 px-3 py-2 text-center text-sm font-semibold text-slate-100 shadow-sm hover:bg-slate-800"
                  >
                    Details
                  </Link>
                  <button
                    onClick={() => add(p, 1)}
                    className="flex-1 rounded-full bg-emerald-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
          {!filtered.length ? (
            <div className="col-span-full rounded-2xl bg-slate-900/45 p-6 text-sm text-slate-300 shadow-sm ring-1 ring-white/10">
              No products found.
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

