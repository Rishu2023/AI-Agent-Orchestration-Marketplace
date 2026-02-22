import { useState, useEffect } from 'react'
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react'
import AgentCard from '../components/AgentCard'
import { useApi } from '../hooks/useApi'

const CATEGORIES = [
  'All', 'Customer Support', 'Data Analysis', 'Code Assistant',
  'Content Creation', 'Research', 'Finance', 'Healthcare', 'Legal',
  'Marketing', 'Education', 'Productivity', 'Other',
]
const PRICING_FILTERS = [
  { value: '', label: 'All Pricing' },
  { value: 'free', label: 'Free' },
  { value: 'per_use', label: 'Per Use' },
  { value: 'subscription', label: 'Subscription' },
]

export default function Marketplace() {
  const [agents, setAgents] = useState([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [pricing, setPricing] = useState('')
  const [page, setPage] = useState(1)
  const [featured, setFeatured] = useState([])
  const { loading, get } = useApi()

  const pageSize = 12

  useEffect(() => {
    fetchFeatured()
  }, [])

  useEffect(() => {
    fetchAgents()
  }, [search, category, pricing, page])

  async function fetchFeatured() {
    try {
      const data = await get('/marketplace/featured')
      setFeatured(data)
    } catch (_) {}
  }

  async function fetchAgents() {
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (category) params.set('category', category)
      if (pricing) params.set('pricing_type', pricing)
      params.set('page', page)
      params.set('page_size', pageSize)
      const data = await get(`/marketplace/agents?${params}`)
      setAgents(data.items)
      setTotal(data.total)
    } catch (_) {}
  }

  function handleSearch(e) {
    setSearch(e.target.value)
    setPage(1)
  }

  function handleCategory(cat) {
    setCategory(cat === 'All' ? '' : cat)
    setPage(1)
  }

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            <span className="text-yellow-400 font-medium text-sm uppercase tracking-wide">AI Agent Marketplace</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Discover & Deploy <span className="text-blue-300">AI Agents</span>
          </h1>
          <p className="text-blue-200 text-lg mb-8 max-w-2xl mx-auto">
            Browse hundreds of specialized AI agents for every use case. Deploy instantly, customize freely.
          </p>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search agents..."
              value={search}
              onChange={handleSearch}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-lg"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Featured */}
        {featured.length > 0 && !search && !category && page === 1 && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-500" /> Featured Agents
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured.slice(0, 3).map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategory(cat)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  (cat === 'All' && !category) || cat === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-gray-400" />
            <select
              value={pricing}
              onChange={(e) => { setPricing(e.target.value); setPage(1) }}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PRICING_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">{total} agents found</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse h-48" />
            ))}
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-lg font-medium">No agents found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > pageSize && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {Math.ceil(total / pageSize)}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(total / pageSize)}
              className="px-4 py-2 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
