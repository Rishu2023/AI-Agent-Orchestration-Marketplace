import React, { useState, useEffect } from 'react'

const demoPapers = [
  { id: 'p1', title: 'Scaling Laws for Neural Language Models Revisited', authors: ['Zhang, Y.', 'Li, W.', 'Chen, M.'], abstract: 'We revisit scaling laws for large language models and find that compute-optimal training requires significantly more data than previously thought. Our experiments across multiple model families reveal new insights into the relationship between model size, data, and performance.', source: 'arXiv', relevance: 97, published: '2024-01-14', tags: ['scaling', 'LLM', 'training'] },
  { id: 'p2', title: 'Constitutional AI: A Framework for Harmless and Helpful Assistants', authors: ['Bai, Y.', 'Kadavath, S.', 'Askell, A.'], abstract: 'We present a new approach to training AI assistants that are both helpful and harmless, using a constitutional framework that guides model behavior through a set of principles rather than explicit human feedback on every output.', source: 'arXiv', relevance: 95, published: '2024-01-13', tags: ['safety', 'alignment', 'RLHF'] },
  { id: 'p3', title: 'MoE-Infinity: Efficient Mixture of Experts at Scale', authors: ['Wang, R.', 'Kim, J.'], abstract: 'We introduce MoE-Infinity, a highly efficient implementation of sparse Mixture of Experts models that achieves near-linear scaling with expert count. Our approach reduces memory overhead by 60% while maintaining model quality.', source: 'arXiv', relevance: 92, published: '2024-01-12', tags: ['MoE', 'efficiency', 'architecture'] },
  { id: 'p4', title: 'ToolFormer 2.0: Teaching LLMs to Use 100+ Tools', authors: ['Patel, D.', 'Nguyen, T.', 'Schick, T.'], abstract: 'Building on ToolFormer, we demonstrate that language models can be trained to effectively use over 100 different tools, including APIs, databases, and code interpreters. Our fine-tuning approach achieves 94% tool selection accuracy.', source: 'HuggingFace', relevance: 91, published: '2024-01-11', tags: ['tool-use', 'agents', 'fine-tuning'] },
  { id: 'p5', title: 'Graph of Thoughts: Solving Complex Problems with LLMs', authors: ['Besta, M.', 'Blach, N.', 'Kubicek, A.'], abstract: 'We present Graph of Thoughts (GoT), a framework that advances reasoning in large language models by modeling information as an arbitrary graph, enabling combining and refining thoughts in complex ways beyond simple chains or trees.', source: 'arXiv', relevance: 89, published: '2024-01-10', tags: ['reasoning', 'prompting', 'graphs'] },
  { id: 'p6', title: 'AutoAgent: Automated Agent Design via LLM Self-Improvement', authors: ['Liu, X.', 'Park, S.'], abstract: 'We introduce AutoAgent, a framework that enables LLMs to automatically design, implement, and improve AI agents. The system iteratively refines agent architectures based on benchmark performance, achieving state-of-the-art results.', source: 'GitHub', relevance: 88, published: '2024-01-09', tags: ['agents', 'automation', 'self-improvement'] },
  { id: 'p7', title: 'Efficient Long-Context Attention with Dynamic Sparse Patterns', authors: ['Anderson, K.', 'Zhao, L.'], abstract: 'We propose a dynamic sparse attention mechanism that adapts its sparsity pattern based on input content, enabling efficient processing of sequences up to 1M tokens while preserving 98% of full attention quality.', source: 'arXiv', relevance: 86, published: '2024-01-08', tags: ['attention', 'long-context', 'efficiency'] },
  { id: 'p8', title: 'MultiModal RAG: Retrieval-Augmented Generation Across Modalities', authors: ['Harris, M.', 'Singh, A.', 'Chen, F.'], abstract: 'We extend retrieval-augmented generation to handle multi-modal inputs and outputs, combining text, image, and structured data retrieval into a unified framework that significantly improves knowledge-intensive tasks.', source: 'HuggingFace', relevance: 85, published: '2024-01-07', tags: ['RAG', 'multimodal', 'retrieval'] },
]

const demoTrendingModels = [
  { id: 'tm1', name: 'Llama-3.1-405B-Instruct', provider: 'Meta', stars: 12450, trend: 98, category: 'LLM' },
  { id: 'tm2', name: 'Mixtral-8x22B-v0.3', provider: 'Mistral AI', stars: 8920, trend: 95, category: 'MoE' },
  { id: 'tm3', name: 'Qwen2-72B-Instruct', provider: 'Alibaba', stars: 7340, trend: 92, category: 'LLM' },
  { id: 'tm4', name: 'DeepSeek-Coder-V2-Instruct', provider: 'DeepSeek', stars: 6180, trend: 90, category: 'Code' },
  { id: 'tm5', name: 'Phi-3-medium-128k', provider: 'Microsoft', stars: 5420, trend: 87, category: 'Small LM' },
  { id: 'tm6', name: 'CodeGemma-7B-IT', provider: 'Google', stars: 4890, trend: 84, category: 'Code' },
]

const demoAutoAgents = [
  { id: 'aa1', name: 'ScalingLaw Analyzer', source_paper: 'Scaling Laws for Neural Language Models Revisited', status: 'active', created_at: '2024-01-14T15:00:00Z', capabilities: ['data analysis', 'benchmarking'] },
  { id: 'aa2', name: 'SafeGuard Agent', source_paper: 'Constitutional AI: A Framework for Harmless and Helpful Assistants', status: 'active', created_at: '2024-01-13T12:00:00Z', capabilities: ['content filtering', 'safety checks'] },
  { id: 'aa3', name: 'ToolMaster 100+', source_paper: 'ToolFormer 2.0: Teaching LLMs to Use 100+ Tools', status: 'testing', created_at: '2024-01-11T09:00:00Z', capabilities: ['tool selection', 'API integration'] },
  { id: 'aa4', name: 'GoT Reasoner', source_paper: 'Graph of Thoughts: Solving Complex Problems with LLMs', status: 'active', created_at: '2024-01-10T11:00:00Z', capabilities: ['complex reasoning', 'graph analysis'] },
]

const sources = ['All', 'arXiv', 'HuggingFace', 'GitHub']

function getSourceBadge(source) {
  switch (source) {
    case 'arXiv': return 'bg-red-100 text-red-700'
    case 'HuggingFace': return 'bg-yellow-100 text-yellow-700'
    case 'GitHub': return 'bg-gray-100 text-gray-700'
    default: return 'bg-gray-100 text-gray-600'
  }
}

function getRelevanceBadge(score) {
  if (score >= 95) return 'bg-emerald-100 text-emerald-700'
  if (score >= 90) return 'bg-green-100 text-green-700'
  if (score >= 85) return 'bg-blue-100 text-blue-700'
  return 'bg-gray-100 text-gray-600'
}

export default function ResearchPage() {
  const [papers, setPapers] = useState([])
  const [trendingModels, setTrendingModels] = useState([])
  const [autoAgents, setAutoAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSource, setActiveSource] = useState('All')
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState(null)

  useEffect(() => {
    fetchResearchData()
  }, [])

  async function fetchResearchData() {
    setLoading(true)
    setError(null)
    try {
      const [papersRes, modelsRes, agentsRes] = await Promise.allSettled([
        fetch('/api/v1/research/papers'),
        fetch('/api/v1/research/trending-models'),
        fetch('/api/v1/research/auto-agents'),
      ])

      if (papersRes.status === 'fulfilled' && papersRes.value.ok) {
        const data = await papersRes.value.json()
        setPapers(Array.isArray(data) ? data : data.papers ?? [])
      } else {
        setPapers(demoPapers)
      }

      if (modelsRes.status === 'fulfilled' && modelsRes.value.ok) {
        const data = await modelsRes.value.json()
        setTrendingModels(Array.isArray(data) ? data : data.models ?? [])
      } else {
        setTrendingModels(demoTrendingModels)
      }

      if (agentsRes.status === 'fulfilled' && agentsRes.value.ok) {
        const data = await agentsRes.value.json()
        setAutoAgents(Array.isArray(data) ? data : data.agents ?? [])
      } else {
        setAutoAgents(demoAutoAgents)
      }
    } catch {
      setError('Failed to load research data. Showing demo data.')
      setPapers(demoPapers)
      setTrendingModels(demoTrendingModels)
      setAutoAgents(demoAutoAgents)
    } finally {
      setLoading(false)
    }
  }

  async function handleTriggerScan() {
    setScanning(true)
    setScanResult(null)
    try {
      const res = await fetch('/api/v1/research/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (res.ok) {
        const data = await res.json()
        setScanResult(data)
      } else {
        setScanResult({ status: 'completed', new_papers: 3, new_models: 2, message: 'Research scan completed (demo)' })
      }
    } catch {
      setScanResult({ status: 'completed', new_papers: 3, new_models: 2, message: 'Research scan completed (demo)' })
    } finally {
      setScanning(false)
    }
  }

  const filteredPapers = papers.filter(paper => {
    const matchesSource = activeSource === 'All' || paper.source === activeSource
    const matchesSearch = searchQuery === '' ||
      paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.authors.some(a => a.toLowerCase().includes(searchQuery.toLowerCase())) ||
      paper.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesSource && matchesSearch
  })

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="animate-spin inline-block w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full mb-4" />
        <p className="text-gray-500">Loading research data...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Research Hub</h1>
          <p className="text-gray-500">Discover latest AI research, trending models, and auto-generated agents</p>
        </div>
        <button
          onClick={handleTriggerScan}
          disabled={scanning}
          className="mt-4 md:mt-0 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {scanning ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              Scanning...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Trigger Research Scan
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {scanResult && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {scanResult.message} — Found {scanResult.new_papers} new papers, {scanResult.new_models} new models
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search papers by title, author, or tag..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {sources.map(source => (
            <button
              key={source}
              onClick={() => setActiveSource(source)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                activeSource === source ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {source}
            </button>
          ))}
        </div>
      </div>

      {/* Papers Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Latest AI Papers</h2>
        {filteredPapers.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredPapers.map(paper => (
              <div key={paper.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-sm font-semibold text-gray-900 leading-snug">{paper.title}</h3>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${getRelevanceBadge(paper.relevance)}`}>
                    {paper.relevance}%
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-2">{paper.authors.join(', ')}</p>
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">{paper.abstract}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getSourceBadge(paper.source)}`}>
                      {paper.source}
                    </span>
                    {paper.tags?.slice(0, 3).map(tag => (
                      <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">{paper.published}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 text-center py-12">
            <div className="text-4xl mb-3">📄</div>
            <p className="text-gray-500">No papers match your search</p>
          </div>
        )}
      </div>

      {/* Trending Models */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Trending Models</h2>
        {trendingModels.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trendingModels.map(model => (
              <div key={model.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{model.name}</p>
                    <p className="text-xs text-gray-500">{model.provider}</p>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 flex-shrink-0">
                    {model.category}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {model.stars.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    Trend: {model.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 text-center py-12">
            <div className="text-4xl mb-3">🤖</div>
            <p className="text-gray-500">No trending models available</p>
          </div>
        )}
      </div>

      {/* Auto-generated Agents */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Auto-generated Agents</h2>
        {autoAgents.length > 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {autoAgents.map(agent => (
                <div key={agent.id} className="px-6 py-4 hover:bg-gray-50 transition">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-lg flex-shrink-0">
                      🤖
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-gray-900">{agent.name}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          agent.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {agent.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">From: {agent.source_paper}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-2">
                      {agent.capabilities.map(cap => (
                        <span key={cap} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          {cap}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {new Date(agent.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 text-center py-12">
            <div className="text-4xl mb-3">⚙️</div>
            <p className="text-gray-500">No auto-generated agents yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
