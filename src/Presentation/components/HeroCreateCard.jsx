import { Building2, CircleHelp, Plus } from 'lucide-react'

export default function HeroCreateCard({ onAddProperty, onLearnMore }) {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-teal-900 p-6 text-white shadow-lg sm:p-8">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-12 right-10 h-48 w-48 rounded-full bg-teal-300/10 blur-2xl" />
      <div className="relative grid gap-5 lg:grid-cols-[1fr_220px] lg:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Manage Your Property</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-200">
            List your hostel and reach more tenants
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onAddProperty}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <Plus size={16} />
              Add New Property
            </button>
            <button
              type="button"
              onClick={onLearnMore}
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              <CircleHelp size={16} />
              Learn More
            </button>
          </div>
        </div>
        <div className="hidden lg:flex lg:justify-end">
          <div className="flex h-36 w-36 items-center justify-center rounded-3xl border border-white/20 bg-white/10 backdrop-blur">
            <Building2 size={56} className="text-teal-100" />
          </div>
        </div>
      </div>
    </section>
  )
}
