import React, { useState, useMemo } from 'react'
import AgentCard from '../components/AgentCard'
import SearchBar from '../components/SearchBar'

const allAgents = [
  {
    id: '1',
    name: 'Research Assistant Pro',
    description: 'Comprehensive research agent that can analyze papers, summarize findings, and generate literature reviews with citations.',
    category: 'research',
    pricing_model: 'per_use',
    price: 0.05,
    average_rating: 4.8,
    total_reviews: 342,
    total_runs: 15420,
    model_provider: 'anthropic',
    model_name: 'claude-3',
  },
  {
    id: '2',
    name: 'CodeCraft',
    description: 'AI coding assistant that writes, reviews, and refactors code across 20+ programming languages with best practices.',
    category: 'coding',
    pricing_model: 'subscription',
    price: 29.99,
    average_rating: 4.9,
    total_reviews: 891,
    total_runs: 52100,
    model_provider: 'openai',
    model_name: 'gpt-4',
  },
  {
    id: '3',
    name: 'Content Writer AI',
    description: 'Professional content writer that creates blog posts, articles, social media content, and marketing copy.',
    category: 'writing',
    pricing_model: 'per_use',
    price: 0.10,
    average_rating: 4.6,
    total_reviews: 567,
    total_runs: 28900,
    model_provider: 'openai',
    model_name: 'gpt-4',
  },
  {
    id: '4',
    name: 'Data Analyzer',
    description: 'Analyzes datasets, generates visualizations, identifies trends, and produces comprehensive analytical reports.',
    category: 'analysis',
    pricing_model: 'free',
    price: 0,
    average_rating: 4.5,
    total_reviews: 234,
    total_runs: 12300,
    model_provider: 'anthropic',
    model_name: 'claude-3',
  },
  {
    id: '5',
    name: 'Marketing Strategist',
    description: 'Creates comprehensive marketing strategies, campaign plans, audience analysis, and competitive research.',
    category: 'marketing',
    pricing_model: 'subscription',
    price: 49.99,
    average_rating: 4.7,
    total_reviews: 189,
    total_runs: 8900,
    model_provider: 'openai',
    model_name: 'gpt-4',
  },
  {
    id: '6',
    name: 'Sales Outreach Bot',
    description: 'Generates personalized sales emails, follow-ups, and prospecting messages based on lead profiles.',
    category: 'sales',
    pricing_model: 'per_use',
    price: 0.02,
    average_rating: 4.4,
    total_reviews: 156,
    total_runs: 34500,
    model_provider: 'openai',
    model_name: 'gpt-4',
  },
  {
    id: '7',
    name: 'Customer Support AI',
    description: 'Handles customer inquiries, troubleshooting, and ticket routing with empathetic, accurate responses.',
    category: 'customer_support',
    pricing_model: 'subscription',
    price: 99.99,
    average_rating: 4.3,
    total_reviews: 445,
    total_runs: 89000,
    model_provider: 'openai',
    model_name: 'gpt-4',
  },
  {
    id: '8',
    name: 'Creative Writer',
    description: 'Generates creative content including stories, poetry, scripts, and creative briefs with unique voice.',
    category: 'creative',
    pricing_model: 'free',
    price: 0,
    average_rating: 4.2,
    total_reviews: 312,
    total_runs: 19800,
    model_provider: 'anthropic',
    model_name: 'claude-3',
  },
  {
    id: '9',
    name: 'Productivity Planner',
    description: 'AI-powered task management, scheduling optimization, and productivity coaching for teams and individuals.',
    category: 'productivity',
    pricing_model: 'per_use',
    price: 0.01,
    average_rating: 4.6,
    total_reviews: 278,
    total_runs: 45600,
    model_provider: 'openai',
    model_name: 'gpt-4',
  },
]

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'research', label: '🔬 Research' },
  { value: 'writing', label: '✍️ Writing' },
  { value: 'coding', label: '💻 Coding' },
  { value: 'analysis', label: '📊 Analysis' },
  { value: 'marketing', label: '📢 Marketing' },
  { value: 'sales', label: '💼 Sales' },
  { value: 'design', label: '🎨 Design' },
  { value: 'customer_support', label: '🎧 Support' },
  { value: 'creative', label: '✨ Creative' },
  { value: 'productivity', label: '⚡ Productivity' },
]

const pricingFilters = [
  { value: '', label: 'All Pricing' },
  { value: 'free', label: 'Free' },
  { value: 'per_use', label: 'Pay Per Use' },
  { value: 'subscription', label: 'Subscription' },
  { value: 'one_time', label: 'One-Time' },
]

const providerFilters = [
  { value: '', label: 'All Providers' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'custom', label: 'Custom' },
]

export default function Marketplace() {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedPricing, setSelectedPricing] = useState('')
  const [selectedProvider, setSelectedProvider] = useState('')
  const [sortBy, setSortBy] = useState('popular')

  const filteredAgents = useMemo(() => {
    let result = [...allAgents]

    if (search) {
      const term = search.toLowerCase()
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(term) ||
          a.description.toLowerCase().includes(term)
      )
    }

    if (selectedCategory) {
      result = result.filter((a) => a.category === selectedCategory)
    }

    if (selectedPricing) {
      result = result.filter((a) => a.pricing_model === selectedPricing)
    }

    if (selectedProvider) {
      result = result.filter((a) => a.model_provider === selectedProvider)
    }

    switch (sortBy) {
      case 'popular':
        result.sort((a, b) => b.total_runs - a.total_runs)
        break
      case 'rating':
        result.sort((a, b) => b.average_rating - a.average_rating)
        break
      case 'newest':
        result.sort((a, b) => parseInt(b.id) - parseInt(a.id))
        break
      case 'price_low':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price_high':
        result.sort((a, b) => b.price - a.price)
        break
    }

    return result
  }, [search, selectedCategory, selectedPricing, selectedProvider, sortBy])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Agent Marketplace</h1>
        <p className="text-gray-500">Discover and deploy AI agents for any task</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search agents by name or description..." />
        <div className="flex flex-wrap gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Category"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <select
            value={selectedPricing}
            onChange={(e) => setSelectedPricing(e.target.value)}
            aria-label="Pricing"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {pricingFilters.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            aria-label="Provider"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {providerFilters.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort by"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="mb-4">
        <p className="text-sm text-gray-500">{filteredAgents.length} agents found</p>
      </div>

      {filteredAgents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}
