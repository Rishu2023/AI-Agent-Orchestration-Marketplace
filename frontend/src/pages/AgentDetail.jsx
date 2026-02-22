import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'

const agentData = {
  '1': {
    id: '1',
    name: 'Research Assistant Pro',
    description: 'Comprehensive research agent that can analyze papers, summarize findings, and generate literature reviews with citations.',
    long_description: `Research Assistant Pro is an advanced AI agent designed for academics, researchers, and professionals who need to process large volumes of information quickly and accurately.

**Key Features:**
- Analyze and summarize research papers
- Generate comprehensive literature reviews
- Extract key findings and methodologies
- Create citation-ready summaries
- Compare findings across multiple sources
- Identify research gaps and opportunities

**How It Works:**
1. Provide your research topic or upload papers
2. The agent analyzes the content using advanced NLP
3. Receive structured summaries, key findings, and recommendations
4. Export results in multiple formats (PDF, Markdown, BibTeX)`,
    category: 'research',
    pricing_model: 'per_use',
    price: 0.05,
    average_rating: 4.8,
    total_reviews: 342,
    total_runs: 15420,
    model_provider: 'anthropic',
    model_name: 'claude-3',
    publisher: { name: 'AI Research Labs', avatar: '🔬' },
    tags: ['research', 'academic', 'papers', 'literature-review', 'NLP'],
    created_at: '2024-01-15',
    reviews: [
      { id: 1, user: 'Dr. Sarah Chen', rating: 5, content: 'Incredibly useful for my PhD research. Saves hours of literature review work.', date: '2024-02-10' },
      { id: 2, user: 'Mark Johnson', rating: 4, content: 'Great for quick summaries. Would love to see support for more file formats.', date: '2024-02-08' },
      { id: 3, user: 'Emily Watson', rating: 5, content: 'The citation extraction is remarkably accurate. A must-have for researchers.', date: '2024-02-05' },
    ],
  },
}

export default function AgentDetail() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('overview')

  // Use demo data
  const agent = agentData[id] || agentData['1']

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'reviews', label: `Reviews (${agent.total_reviews})` },
    { id: 'api', label: 'API' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <Link to="/marketplace" className="text-primary-600 hover:text-primary-700">Marketplace</Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-500">{agent.name}</span>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div className="text-5xl">{agent.publisher?.avatar || '🤖'}</div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{agent.name}</h1>
              <p className="text-gray-500 mt-1">by {agent.publisher?.name || 'Unknown Publisher'}</p>
              <div className="flex items-center space-x-4 mt-3">
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-400">★</span>
                  <span className="font-semibold">{agent.average_rating}</span>
                  <span className="text-gray-400">({agent.total_reviews} reviews)</span>
                </div>
                <span className="text-gray-300">|</span>
                <span className="text-gray-500">{agent.total_runs?.toLocaleString()} runs</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {agent.tags?.map((tag) => (
                  <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-3">
            <div className="text-right">
              {agent.pricing_model === 'free' ? (
                <span className="text-2xl font-bold text-green-600">Free</span>
              ) : (
                <div>
                  <span className="text-2xl font-bold text-gray-900">${agent.price}</span>
                  <span className="text-gray-500 text-sm">
                    {agent.pricing_model === 'per_use' ? '/use' : agent.pricing_model === 'subscription' ? '/mo' : ''}
                  </span>
                </div>
              )}
            </div>
            <button className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition w-full md:w-auto">
              Deploy Agent
            </button>
            <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition w-full md:w-auto">
              Try in Sandbox
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About this Agent</h2>
              <div className="prose prose-gray max-w-none">
                {agent.long_description?.split('\n').map((line, i) => (
                  <p key={`desc-${i}-${line.slice(0, 20)}`} className="text-gray-600 mb-2">{line}</p>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Details</h3>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-gray-500 text-sm">Category</dt>
                  <dd className="text-gray-900 text-sm font-medium capitalize">{agent.category}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 text-sm">Model</dt>
                  <dd className="text-gray-900 text-sm font-medium">{agent.model_name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 text-sm">Provider</dt>
                  <dd className="text-gray-900 text-sm font-medium capitalize">{agent.model_provider}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 text-sm">Published</dt>
                  <dd className="text-gray-900 text-sm font-medium">{agent.created_at}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {agent.reviews?.map((review) => (
            <div key={review.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold text-sm">{review.user[0]}</span>
                  </div>
                  <span className="font-medium text-gray-900">{review.user}</span>
                </div>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-200'}>★</span>
                  ))}
                </div>
              </div>
              <p className="text-gray-600">{review.content}</p>
              <p className="text-gray-400 text-sm mt-2">{review.date}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'api' && (
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">API Reference</h2>
          <div className="bg-gray-900 rounded-lg p-6 text-sm font-mono">
            <p className="text-green-400 mb-2"># Execute Agent</p>
            <p className="text-gray-300">POST /api/v1/agents/{agent.id}/execute</p>
            <p className="text-gray-500 mt-4 mb-2">Request Body:</p>
            <pre className="text-blue-300">{JSON.stringify({
              input: { query: "Your research topic here" },
              parameters: { max_tokens: 4096 },
            }, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  )
}
