import { useState } from 'react'

const EMPTY_FORM = {
  name: '',
  category: 'Vegetables',
  price: 50,
  quantity: 10,
  imageUrl: '',
}

export function AddProduct({ onSubmit, loading = false }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result || ''))
      reader.onerror = () => reject(new Error('Could not read image'))
      reader.readAsDataURL(file)
    })
  }

  async function onImagePick(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setUploading(true)
    try {
      const dataUrl = await fileToDataUrl(file)
      setForm((prev) => ({ ...prev, imageUrl: dataUrl }))
    } catch {
      setError('Image upload failed. Try a different file.')
    } finally {
      setUploading(false)
    }
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    try {
      await onSubmit({
        name: form.name.trim(),
        category: form.category,
        price: Number(form.price),
        quantity: Number(form.quantity),
        images: form.imageUrl.trim() ? [form.imageUrl.trim()] : [],
      })
      setForm(EMPTY_FORM)
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not add product')
    }
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-sm space-y-3"
    >
      <div className="text-sm font-semibold text-slate-900">Add product</div>
      <input
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        placeholder="Product name"
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500"
        required
      />
      <select
        value={form.category}
        onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500"
      >
        <option>Vegetables</option>
        <option>Fruits</option>
        <option>Dry Fruits</option>
      </select>

      <div className="grid grid-cols-2 gap-2">
        <input
          value={form.price}
          onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          type="number"
          min={1}
          placeholder="Price"
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-black outline-none focus:border-brand-500"
          required
        />
        <input
          value={form.quantity}
          onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
          type="number"
          min={0}
          placeholder="Quantity (kg)"
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-black outline-none focus:border-brand-500"
          required
        />
      </div>

      <input
        value={form.imageUrl}
        onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
        placeholder="Image URL (optional)"
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500"
      />
      <input
        type="file"
        accept="image/*"
        onChange={onImagePick}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
      />

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </div>
      ) : null}

      <button
        disabled={loading || uploading}
        className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {loading || uploading ? 'Saving…' : 'Add Product'}
      </button>
    </form>
  )
}

