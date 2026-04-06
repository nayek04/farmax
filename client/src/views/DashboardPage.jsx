import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'
import { useAuth } from '../state/auth.jsx'

export function DashboardPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState('products')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [form, setForm] = useState({
    name: '',
    category: 'Vegetables',
    price: 50,
    quantity: 10,
    images: '',
  })
  const [loading, setLoading] = useState(true)

  async function loadAll() {
    setLoading(true)
    try {
      const [p, o] = await Promise.all([
        api.get('/api/products?mine=1'),
        api.get('/api/orders'),
      ])
      setProducts(p.data.products || [])
      setOrders(o.data.orders || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  async function createProduct(e) {
    e.preventDefault()
    const payload = {
      ...form,
      images: form.images
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    }
    await api.post('/api/products', payload)
    setForm({
      name: '',
      category: 'Vegetables',
      price: 50,
      quantity: 10,
      images: '',
    })
    await loadAll()
  }

  async function updateOrderStatus(orderId, status) {
    await api.put(`/api/orders/${orderId}`, { status })
    await loadAll()
  }

  if (loading) {
    return (
      <div className="rounded-xl border bg-white p-6 text-sm text-slate-600">
        Loading dashboard…
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Dashboard
          </h2>
          <p className="text-sm text-slate-600">
            Signed in as <span className="font-semibold">{user?.name}</span> (
            {user?.role})
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTab('products')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              tab === 'products'
                ? 'bg-slate-900 text-white'
                : 'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setTab('orders')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              tab === 'orders'
                ? 'bg-slate-900 text-white'
                : 'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
            }`}
          >
            Orders
          </button>
        </div>
      </div>

      {tab === 'products' ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-3">
            {products.map((p) => (
              <div
                key={p._id}
                className="rounded-2xl border bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold text-slate-900">
                      {p.name}
                    </div>
                    <div className="text-sm text-slate-600">
                      {p.category} · ₹{p.price} · qty {p.quantity}
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    {p.farmerId?.name ? `Farmer: ${p.farmerId.name}` : null}
                  </div>
                </div>
              </div>
            ))}
            {!products.length ? (
              <div className="rounded-2xl border bg-white p-6 text-sm text-slate-600">
                No products yet.
              </div>
            ) : null}
          </div>

          <aside>
            <form
              onSubmit={createProduct}
              className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"
            >
              <div className="text-sm font-semibold text-slate-900">
                Add product
              </div>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Name"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
                required
              />
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              >
                <option>Vegetables</option>
                <option>Fruits</option>
                <option>Dry Fruits</option>
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: Number(e.target.value) }))
                  }
                  type="number"
                  min={1}
                  placeholder="Price"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-black outline-none focus:border-brand-500"
                  required
                />
                <input
                  value={form.quantity}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, quantity: Number(e.target.value) }))
                  }
                  type="number"
                  min={0}
                  placeholder="Quantity (kg)"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-black outline-none focus:border-brand-500"
                  required
                />
              </div>
              <input
                value={form.images}
                onChange={(e) =>
                  setForm((f) => ({ ...f, images: e.target.value }))
                }
                placeholder="Image URLs (comma-separated, optional)"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
              <button className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700">
                Create
              </button>
              <div className="text-xs text-slate-500">
                Smart pricing is disabled in this build.
              </div>
            </form>
          </aside>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div
              key={o._id}
              className="rounded-2xl border bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm text-slate-500">Order</div>
                  <div className="font-semibold text-slate-900">{o._id}</div>
                  <div className="mt-1 text-sm text-slate-600">
                    Status: <span className="font-semibold">{o.status}</span>
                  </div>
                  <div className="text-sm text-slate-600">
                    Total: <span className="font-semibold">₹{o.totalPrice}</span>
                  </div>
                  <div className="text-sm text-slate-600">
                    Payment:{' '}
                    <span className="font-semibold">
                      {String(o.paymentMethod || '').toUpperCase() || '—'}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600">
                    ETA: <span className="font-semibold">{o.estimatedDelivery}</span>
                  </div>
                </div>

                {(user?.role === 'farmer' || user?.role === 'admin') && (
                  <div className="flex flex-wrap gap-2">
                    {['placed', 'confirmed', 'packed', 'out_for_delivery', 'delivered'].map(
                      (s) => (
                        <button
                          key={s}
                          onClick={() => updateOrderStatus(o._id, s)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                        >
                          {s}
                        </button>
                      ),
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          {!orders.length ? (
            <div className="rounded-2xl border bg-white p-6 text-sm text-slate-600">
              No orders yet.
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

