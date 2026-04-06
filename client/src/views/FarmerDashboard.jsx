import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'
import { useAuth } from '../state/auth.jsx'
import { AddProduct } from './AddProduct.jsx'

const STATUS_OPTIONS = ['pending', 'shipped', 'delivered']

function toUiStatus(status) {
  if (status === 'placed' || status === 'confirmed' || status === 'packed') return 'pending'
  if (status === 'out_for_delivery') return 'shipped'
  return status
}

export function FarmerDashboard() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingProduct, setSavingProduct] = useState(false)
  const [editingId, setEditingId] = useState('')
  const [editForm, setEditForm] = useState({
    name: '',
    category: 'Vegetables',
    price: 1,
    quantity: 0,
  })

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

  async function createProduct(payload) {
    setSavingProduct(true)
    try {
      await api.post('/api/products', payload)
      await loadAll()
    } finally {
      setSavingProduct(false)
    }
  }

  function beginEdit(product) {
    setEditingId(product._id)
    setEditForm({
      name: product.name,
      category: product.category,
      price: product.price,
      quantity: product.quantity,
    })
  }

  async function saveEdit(productId) {
    await api.put(`/api/products/${productId}`, {
      ...editForm,
      price: Number(editForm.price),
      quantity: Number(editForm.quantity),
    })
    setEditingId('')
    await loadAll()
  }

  async function deleteProduct(productId) {
    await api.delete(`/api/products/${productId}`)
    await loadAll()
  }

  async function updateOrderStatus(orderId, status) {
    await api.put(`/api/orders/${orderId}`, { status })
    await loadAll()
  }

  if (loading) {
    return (
      <div className="rounded-xl border bg-white p-6 text-sm text-slate-600">
        Loading farmer dashboard...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-lg">
        <h2 className="text-2xl font-semibold text-slate-900">Farmer Dashboard</h2>
        <p className="mt-1 text-sm text-slate-600">
          Welcome {user?.name}. Manage your products and incoming orders.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          <div className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-sm">
            <div className="text-base font-semibold text-slate-900">Manage Products</div>
            <div className="mt-3 space-y-3">
              {products.map((p) => (
                <div
                  key={p._id}
                  className="rounded-xl border border-slate-200 bg-white p-4"
                >
                  {editingId === p._id ? (
                    <div className="space-y-2">
                      <input
                        value={editForm.name}
                        onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <select
                          value={editForm.category}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, category: e.target.value }))
                          }
                          className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
                        >
                          <option>Vegetables</option>
                          <option>Fruits</option>
                          <option>Dry Fruits</option>
                        </select>
                        <input
                          value={editForm.price}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, price: e.target.value }))
                          }
                          type="number"
                          min={1}
                          className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
                        />
                        <input
                          value={editForm.quantity}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, quantity: e.target.value }))
                          }
                          type="number"
                          min={0}
                          className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(p._id)}
                          className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId('')}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-slate-900">{p.name}</div>
                        <div className="text-sm text-slate-600">
                          {p.category} · ₹{p.price} · qty {p.quantity}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => beginEdit(p)}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteProduct(p._id)}
                          className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {!products.length ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                  No products yet. Add your first product from the panel.
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <aside>
          <AddProduct onSubmit={createProduct} loading={savingProduct} />
        </aside>
      </div>


    </div>
  )
}

