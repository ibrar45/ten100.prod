const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'published', label: 'Published' },
  { key: 'draft', label: 'Draft' },
]

export default function ListingFilterBar({ activeFilter, onFilterChange }) {
  return (
    <section className="flex flex-wrap items-center gap-2">
      {FILTERS.map((filter) => {
        const active = activeFilter === filter.key
        return (
          <button
            key={filter.key}
            type="button"
            onClick={() => onFilterChange(filter.key)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              active
                ? 'bg-teal-800 text-white shadow'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {filter.label}
          </button>
        )
      })}
    </section>
  )
}
