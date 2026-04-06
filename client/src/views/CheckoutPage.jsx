import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api.js'
import { useCart } from '../state/cart.jsx'

export function CheckoutPage() {
  const { items, total, clear } = useCart()
  const [shipping, setShipping] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
  })
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [upiMode, setUpiMode] = useState('any_app')
  const [upiId, setUpiId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [placedOrder, setPlacedOrder] = useState(null)
  const navigate = useNavigate()

  const formattedAddress = [
    shipping.fullName?.trim(),
    shipping.phone?.trim() ? `Phone: ${shipping.phone.trim()}` : '',
    shipping.addressLine1?.trim(),
    shipping.addressLine2?.trim(),
    [shipping.city?.trim(), shipping.state?.trim(), shipping.country?.trim()]
      .filter(Boolean)
      .join(', '),
    shipping.pincode?.trim() ? `PIN: ${shipping.pincode.trim()}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  const isValid =
    shipping.fullName.trim().length >= 2 &&
    shipping.addressLine1.trim().length >= 3 &&
    shipping.city.trim().length >= 2 &&
    shipping.state.trim().length >= 2 &&
    shipping.country.trim().length >= 2 &&
    /^[0-9]{4,10}$/.test(shipping.pincode.trim())

  async function placeOrder() {
    if (!items.length) return
    if (!isValid) {
      setError('Please fill all required address fields and a valid pincode.')
      return
    }
    if (paymentMethod === 'upi' && upiMode === 'upi_id' && !upiId.trim()) {
      setError('Please enter your UPI ID.')
      return
    }

    setError('')
    setLoading(true)
    try {
      const payload = {
        address: formattedAddress,
        paymentMethod,
        paymentMeta:
          paymentMethod === 'upi'
            ? {
                upiMode,
                upiId: upiMode === 'upi_id' ? upiId.trim() : '',
              }
            : {},
        products: items.map((it) => ({
          productId: it.product._id,
          qty: it.qty,
        })),
      }
      const res = await api.post('/api/orders', payload)
      clear()
      setPlacedOrder(res.data.order || null)
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (placedOrder) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl border border-emerald-200 bg-white/90 p-6 shadow-lg shadow-emerald-100/50 backdrop-blur">
          <div className="text-2xl font-semibold text-emerald-700">Order placed</div>
          <p className="mt-2 text-sm text-slate-700">
            Your order has been placed successfully. We will start processing it soon.
          </p>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <div>
              <span className="font-semibold text-slate-900">Order ID:</span>{' '}
              {placedOrder._id || '—'}
            </div>
            <div className="mt-1">
              <span className="font-semibold text-slate-900">Status:</span>{' '}
              {placedOrder.status || 'placed'}
            </div>
            <div className="mt-1">
              <span className="font-semibold text-slate-900">Total:</span> ₹
              {Number(placedOrder.totalPrice || 0).toFixed(0)}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/products')}
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Continue shopping
            </button>
            <button
              onClick={() => navigate('/cart')}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Go to cart
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-lg shadow-emerald-100/40 backdrop-blur">
          <h2 className="text-2xl font-semibold text-slate-900">Checkout</h2>
          <p className="mt-1 text-sm text-slate-600">
            Direct farm-to-customer delivery. No warehouse.
          </p>

          <div className="mt-4">
            <label className="text-sm font-medium text-slate-900">
              Delivery address
            </label>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <input
                  value={shipping.fullName}
                  onChange={(e) =>
                    setShipping((s) => ({ ...s, fullName: e.target.value }))
                  }
                  placeholder="Full name"
                  className="w-full rounded-2xl border border-slate-900/20 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900"
                />
              </div>
              <div className="sm:col-span-2">
                <input
                  value={shipping.phone}
                  onChange={(e) =>
                    setShipping((s) => ({ ...s, phone: e.target.value }))
                  }
                  placeholder="Phone (optional)"
                  className="w-full rounded-2xl border border-slate-900/20 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900"
                />
              </div>
              <div className="sm:col-span-2">
                <input
                  value={shipping.addressLine1}
                  onChange={(e) =>
                    setShipping((s) => ({
                      ...s,
                      addressLine1: e.target.value,
                    }))
                  }
                  placeholder="Address line 1 (house no, street)"
                  className="w-full rounded-2xl border border-slate-900/20 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900"
                />
              </div>
              <div className="sm:col-span-2">
                <input
                  value={shipping.addressLine2}
                  onChange={(e) =>
                    setShipping((s) => ({
                      ...s,
                      addressLine2: e.target.value,
                    }))
                  }
                  placeholder="Address line 2 (landmark, area) (optional)"
                  className="w-full rounded-2xl border border-slate-900/20 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900"
                />
              </div>
              <div>
                <input
                  value={shipping.city}
                  onChange={(e) =>
                    setShipping((s) => ({ ...s, city: e.target.value }))
                  }
                  placeholder="City"
                  className="w-full rounded-2xl border border-slate-900/20 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900"
                />
              </div>
              <div>
                <input
                  value={shipping.state}
                  onChange={(e) =>
                    setShipping((s) => ({ ...s, state: e.target.value }))
                  }
                  placeholder="State"
                  className="w-full rounded-2xl border border-slate-900/20 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900"
                />
              </div>
              <div>
                <input
                  value={shipping.country}
                  onChange={(e) =>
                    setShipping((s) => ({ ...s, country: e.target.value }))
                  }
                  placeholder="Country"
                  className="w-full rounded-2xl border border-slate-900/20 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900"
                />
              </div>
              <div>
                <input
                  value={shipping.pincode}
                  onChange={(e) =>
                    setShipping((s) => ({ ...s, pincode: e.target.value }))
                  }
                  placeholder="Pincode"
                  inputMode="numeric"
                  className="w-full rounded-xl border border-slate-900/20 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium text-slate-900">
              Payment
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-900/20 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-900"
            >
              <option value="cod">Cash on delivery (COD)</option>
              <option value="upi">UPI</option>
            </select>
            {paymentMethod === 'upi' ? (
              <div className="mt-3 space-y-2">
                <div className="grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <label className="flex items-center gap-2 text-sm text-slate-800">
                    <input
                      type="radio"
                      name="upiMode"
                      value="any_app"
                      checked={upiMode === 'any_app'}
                      onChange={() => setUpiMode('any_app')}
                    />
                    Use any UPI app (PhonePe / Google Pay / Paytm / BHIM)
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-800">
                    <input
                      type="radio"
                      name="upiMode"
                      value="upi_id"
                      checked={upiMode === 'upi_id'}
                      onChange={() => setUpiMode('upi_id')}
                    />
                    Enter UPI ID
                  </label>
                </div>

                {upiMode === 'upi_id' ? (
                  <input
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="UPI ID (e.g. name@bank)"
                    className="w-full rounded-2xl border border-slate-900/20 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900"
                  />
                ) : null}
              </div>
            ) : (
              <div className="mt-2 text-xs text-slate-500">
                Pay when the order is delivered.
              </div>
            )}
          </div>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-lg shadow-emerald-100/40 backdrop-blur">
          <div className="text-sm font-semibold text-slate-900">Order</div>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            {items.map((it) => (
              <div key={it.product._id} className="flex justify-between gap-3">
                <span className="truncate">
                  {it.product.name} × {it.qty}
                </span>
                <span className="text-slate-900">
                  ₹{(it.product.price * it.qty).toFixed(0)}
                </span>
              </div>
            ))}
            <div className="mt-2 border-t pt-3 flex justify-between">
              <span>Total</span>
              <span className="text-base font-semibold text-slate-900">
                ₹{total.toFixed(0)}
              </span>
            </div>
          </div>

          <button
            disabled={
              !items.length ||
              loading
            }
            onClick={placeOrder}
            className="mt-5 w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading ? 'Placing order…' : 'Place order'}
          </button>
          {error ? (
            <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {error}
            </div>
          ) : null}

        </div>
      </aside>
    </div>
  )
}

