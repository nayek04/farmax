import { createContext, useContext, useMemo, useState } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([]) // {product, qty}

  const value = useMemo(() => {
    const total = items.reduce(
      (sum, it) => sum + (it.product?.price || 0) * it.qty,
      0,
    )
    return {
      items,
      total,
      add: (product, qty = 1) => {
        setItems((prev) => {
          const idx = prev.findIndex((p) => p.product?._id === product?._id)
          if (idx >= 0) {
            const next = [...prev]
            next[idx] = { ...next[idx], qty: next[idx].qty + qty }
            return next
          }
          return [...prev, { product, qty }]
        })
      },
      setQty: (productId, qty) => {
        setItems((prev) =>
          prev
            .map((it) =>
              it.product?._id === productId ? { ...it, qty } : it,
            )
            .filter((it) => it.qty > 0),
        )
      },
      remove: (productId) => {
        setItems((prev) => prev.filter((it) => it.product?._id !== productId))
      },
      clear: () => setItems([]),
    }
  }, [items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

