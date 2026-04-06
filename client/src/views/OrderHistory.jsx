import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'

function toUiStatus(status) {
  if (status === 'placed' || status === 'confirmed' || status === 'packed') return 'pending'
  if (status === 'out_for_delivery') return 'shipped'
  return status
}

export function OrderHistory() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function run() {
      setLoading(true)
      try {
        const res = await api.get('/api/orders')
        if (!cancelled) setOrders(res.data.orders || [])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-lg">
        <h2 className="text-2xl font-semibold text-slate-900">Order History</h2>
        <p className="mt-1 text-sm text-slate-600">
          Track all your previous and current orders.
        </p>
      </div>

      <div className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-sm">
        <div className="space-y-3">
          {loading ? (
            <div className="text-sm text-slate-600">Loading orders...</div>
          ) : orders.length ? (
            orders.map((o) => (
              <div key={o._id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-xs text-slate-500">Order ID</div>
                    <div className="font-semibold text-slate-900">{o._id}</div>
                    <div className="mt-1 text-sm text-slate-600">
                      Status: <span className="font-semibold">{toUiStatus(o.status)}</span>
                    </div>
                    <div className="text-sm text-slate-600">
                      Total: <span className="font-semibold">₹{o.totalPrice}</span>
                    </div>
                  </div>
                  <div className="text-sm text-slate-600">
                    Items: <span className="font-semibold">{o.products?.length || 0}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
              No orders yet. Start by adding products to cart.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

