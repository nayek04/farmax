import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <div className="space-y-10">
      <section className="grid gap-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/45 px-3 py-1 text-sm font-semibold text-slate-100 shadow-sm ring-1 ring-white/10">
            <span className="h-2 w-2 rounded-full bg-brand-600" />
            Farm-to-door, no warehouse
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">
            Fresh produce from local farmers,
            <span className="bg-gradient-to-r from-emerald-700 via-brand-600 to-orange-600 bg-clip-text text-transparent">
              {' '}
              delivered fast.
            </span>
          </h1>
          <p className="mt-4 text-lg text-slate-300">
            Buy vegetables, fruits, and dry fruits directly from farms. Track
            orders, get AI recommendations, and enjoy transparent pricing.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/products"
              className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600"
            >
              Browse products
            </Link>
            <Link
              to="/signup"
              className="rounded-full border border-white/20 bg-slate-900/45 px-6 py-3 text-sm font-semibold text-slate-100 shadow-sm hover:bg-slate-800/70"
            >
              Create account
            </Link>
          </div>

        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <CategoryTile
          title="Vegetables"
          subtitle="Daily staples, farm-fresh"
          gradient="from-emerald-600 to-lime-500"
          to="/products"
        />
        <CategoryTile
          title="Fruits"
          subtitle="Seasonal & sweet"
          gradient="from-orange-500 to-rose-500"
          to="/products"
        />
        <CategoryTile
          title="Dry Fruits"
          subtitle="Premium, packed & clean"
          gradient="from-amber-500 to-yellow-400"
          to="/products"
        />
      </section>
    </div>
  )
}

function CategoryTile({ title, subtitle, gradient, to }) {
  return (
    <Link
      to={to}
      className="group relative overflow-hidden rounded-3xl bg-slate-900/45 p-6 shadow-sm ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20`}
      />
      <div className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-white/20 blur-2xl transition group-hover:scale-110" />
      <div className="relative">
        <div className="text-lg font-semibold text-white">{title}</div>
        <div className="mt-1 text-sm text-slate-300">{subtitle}</div>
        <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white">
          Explore
          <span className="transition group-hover:translate-x-0.5">→</span>
        </div>
      </div>
    </Link>
  )
}

