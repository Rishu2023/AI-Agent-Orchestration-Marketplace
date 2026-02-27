import React, { useState, useEffect } from 'react'

const demoAgents = [
  { id: 'a1', name: 'Research Assistant Pro' },
  { id: 'a2', name: 'CodeCraft' },
  { id: 'a3', name: 'Content Writer AI' },
  { id: 'a4', name: 'Data Analyzer' },
  { id: 'a5', name: 'Marketing Strategist' },
]

const demoMemories = [
  { id: 'm1', key: 'user_preferences', content: 'Prefers concise responses with bullet points. Likes technical depth.', type: 'long_term', access_count: 45, last_updated: '2024-01-15T10:30:00Z', agent_id: 'a1' },
  { id: 'm2', key: 'project_context', content: 'Working on a React/Node.js SaaS platform for healthcare. Using PostgreSQL and Redis.', type: 'long_term', access_count: 32, last_updated: '2024-01-15T08:20:00Z', agent_id: 'a1' },
  { id: 'm3', key: 'last_session_notes', content: 'Discussed API architecture patterns. Decided on REST with GraphQL for complex queries.', type: 'short_term', access_count: 8, last_updated: '2024-01-14T16:45:00Z', agent_id: 'a2' },
  { id: 'm4', key: 'coding_style', content: 'Follows Airbnb JavaScript style guide. Prefers functional components with hooks. Uses TypeScript when possible.', type: 'long_term', access_count: 67, last_updated: '2024-01-14T12:00:00Z', agent_id: 'a2' },
  { id: 'm5', key: 'brand_guidelines', content: 'Tone: professional yet friendly. Avoid jargon. Use active voice. Target audience: small business owners.', type: 'long_term', access_count: 23, last_updated: '2024-01-13T14:20:00Z', agent_id: 'a3' },
  { id: 'm6', key: 'recent_topics', content: 'Blog posts about AI trends, productivity tips, and remote work best practices.', type: 'short_term', access_count: 12, last_updated: '2024-01-13T08:00:00Z', agent_id: 'a3' },
  { id: 'm7', key: 'data_sources', content: 'Primary: PostgreSQL warehouse. Secondary: CSV uploads. Tertiary: REST API endpoints from CRM.', type: 'long_term', access_count: 19, last_updated: '2024-01-12T17:30:00Z', agent_id: 'a4' },
  { id: 'm8', key: 'analysis_templates', content: 'Standard reports: weekly KPIs, monthly revenue trends, quarterly cohort analysis.', type: 'long_term', access_count: 28, last_updated: '2024-01-12T00:00:00Z', agent_id: 'a4' },
]

const demoKnowledgeBase = [
  { id: 'kb1', title: 'API Documentation', description: 'Complete REST API reference for the marketplace platform', entries: 156, last_updated: '2024-01-15T10:00:00Z' },
  { id: 'kb2', title: 'Agent Building Guide', description: 'Step-by-step guide for creating and deploying AI agents', entries: 42, last_updated: '2024-01-14T14:30:00Z' },
  { id: 'kb3', title: 'Best Practices', description: 'Collection of prompt engineering and agent design patterns', entries: 89, last_updated: '2024-01-13T09:15:00Z' },
  { id: 'kb4', title: 'FAQ Database', description: 'Frequently asked questions and answers from support tickets', entries: 234, last_updated: '2024-01-12T11:45:00Z' },
]

export default function MemoryManagement() {
  const [agents, setAgents] = useState([])
  const [selectedAgent, setSelectedAgent] = useState('')
  const [memories, setMemories] = useState([])
  const [knowledgeBase, setKnowledgeBase] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [kbSearchQuery, setKbSearchQuery] = useState('')
  const [showStoreModal, setShowStoreModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingMemory, setEditingMemory] = useState(null)
  const [storeForm, setStoreForm] = useState({ key: '', content: '', type: 'long_term' })

  useEffect(() => {
    fetchAgents()
    fetchKnowledgeBase()
  }, [])

  useEffect(() => {
    if (selectedAgent) {
      fetchMemories(selectedAgent)
    }
  }, [selectedAgent])

  async function fetchAgents() {
    try {
      const res = await fetch('/api/v1/agents')
      if (res.ok) {
        const data = await res.json()
        const agentList = Array.isArray(data) ? data : data.agents ?? []
        setAgents(agentList)
        if (agentList.length > 0) setSelectedAgent(agentList[0].id)
      } else {
        setAgents(demoAgents)
        setSelectedAgent(demoAgents[0].id)
      }
    } catch {
      setAgents(demoAgents)
      setSelectedAgent(demoAgents[0].id)
    }
  }

  async function fetchMemories(agentId) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/v1/memory/${agentId}`)
      if (res.ok) {
        const data = await res.json()
        setMemories(Array.isArray(data) ? data : data.memories ?? [])
      } else {
        setMemories(demoMemories.filter((m) => m.agent_id === agentId))
      }
    } catch {
      setMemories(demoMemories.filter((m) => m.agent_id === agentId))
    } finally {
      setLoading(false)
    }
  }

  async function fetchKnowledgeBase() {
    try {
      const res = await fetch('/api/v1/memory/knowledge-base')
      if (res.ok) {
        const data = await res.json()
        setKnowledgeBase(Array.isArray(data) ? data : data.items ?? [])
      } else {
        setKnowledgeBase(demoKnowledgeBase)
      }
    } catch {
      setKnowledgeBase(demoKnowledgeBase)
    }
  }

  async function handleStoreMemory(e) {
    e.preventDefault()
    try {
      const res = await fetch(`/api/v1/memory/${selectedAgent}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storeForm),
      })
      if (res.ok) {
        const newMem = await res.json()
        setMemories((prev) => [newMem, ...prev])
      }
    } catch {
      setMemories((prev) => [
        { id: `m-${Date.now()}`, key: storeForm.key, content: storeForm.content, type: storeForm.type, access_count: 0, last_updated: new Date().toISOString(), agent_id: selectedAgent },
        ...prev,
      ])
    }
    setStoreForm({ key: '', content: '', type: 'long_term' })
    setShowStoreModal(false)
  }

  async function handleEditMemory(e) {
    e.preventDefault()
    if (!editingMemory) return
    try {
      const res = await fetch(`/api/v1/memory/${selectedAgent}/${editingMemory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: editingMemory.key, content: editingMemory.content, type: editingMemory.type }),
      })
      if (res.ok) {
        setMemories((prev) => prev.map((m) => (m.id === editingMemory.id ? { ...editingMemory, last_updated: new Date().toISOString() } : m)))
      }
    } catch {
      setMemories((prev) => prev.map((m) => (m.id === editingMemory.id ? { ...editingMemory, last_updated: new Date().toISOString() } : m)))
    }
    setEditingMemory(null)
    setShowEditModal(false)
  }

  async function handleDeleteMemory(memoryId) {
    if (!confirm('Are you sure you want to delete this memory?')) return
    try {
      const res = await fetch(`/api/v1/memory/${selectedAgent}/${memoryId}`, { method: 'DELETE' })
      if (res.ok) {
        setMemories((prev) => prev.filter((m) => m.id !== memoryId))
      }
    } catch {
      setMemories((prev) => prev.filter((m) => m.id !== memoryId))
    }
  }

  function openEditModal(memory) {
    setEditingMemory({ ...memory })
    setShowEditModal(true)
  }

  const filteredMemories = memories.filter((m) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return m.key.toLowerCase().includes(q) || m.content.toLowerCase().includes(q) || m.type.toLowerCase().includes(q)
  })

  const filteredKB = knowledgeBase.filter((kb) => {
    if (!kbSearchQuery) return true
    const q = kbSearchQuery.toLowerCase()
    return kb.title.toLowerCase().includes(q) || kb.description.toLowerCase().includes(q)
  })

  const totalMemories = memories.length
  const longTermCount = memories.filter((m) => m.type === 'long_term').length
  const shortTermCount = memories.filter((m) => m.type === 'short_term').length
  const totalAccesses = memories.reduce((sum, m) => sum + (m.access_count || 0), 0)

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  if (loading && memories.length === 0 && agents.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="animate-spin inline-block w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full mb-4" />
        <p className="text-gray-500">Loading memory management...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Memory Management</h1>
          <p className="text-gray-500">View, edit, and manage agent memories and knowledge</p>
        </div>
        <button
          onClick={() => setShowStoreModal(true)}
          className="mt-4 sm:mt-0 bg-primary-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition"
          disabled={!selectedAgent}
        >
          + Store Memory
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Memory Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Total Memories</p>
          <p className="text-2xl font-bold text-gray-900">{totalMemories}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Long-term</p>
          <p className="text-2xl font-bold text-primary-600">{longTermCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Short-term</p>
          <p className="text-2xl font-bold text-purple-600">{shortTermCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Total Accesses</p>
          <p className="text-2xl font-bold text-gray-900">{totalAccesses.toLocaleString()}</p>
        </div>
      </div>

      {/* Agent Selector + Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <select
          value={selectedAgent}
          onChange={(e) => setSelectedAgent(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 sm:w-64"
        >
          <option value="">Select an agent</option>
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>{agent.name}</option>
          ))}
        </select>
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memories by key, content, or type..."
            className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Memory List Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Memories</h2>
        </div>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full mb-3" />
            <p className="text-gray-500 text-sm">Loading memories...</p>
          </div>
        ) : filteredMemories.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-6 py-3 text-gray-500 font-medium">Key</th>
                  <th className="px-6 py-3 text-gray-500 font-medium">Content</th>
                  <th className="px-6 py-3 text-gray-500 font-medium">Type</th>
                  <th className="px-6 py-3 text-gray-500 font-medium text-right">Accesses</th>
                  <th className="px-6 py-3 text-gray-500 font-medium">Last Updated</th>
                  <th className="px-6 py-3 text-gray-500 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMemories.map((mem) => (
                  <tr key={mem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-800">{mem.key}</code>
                    </td>
                    <td className="px-6 py-3 text-gray-700 max-w-xs truncate">{mem.content}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        mem.type === 'long_term' ? 'bg-primary-100 text-primary-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {mem.type === 'long_term' ? 'Long-term' : 'Short-term'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right text-gray-600">{mem.access_count}</td>
                    <td className="px-6 py-3 text-gray-500">{formatDate(mem.last_updated)}</td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(mem)}
                          className="text-primary-600 hover:text-primary-800 text-xs font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteMemory(mem.id)}
                          className="text-red-600 hover:text-red-800 text-xs font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🧠</div>
            {selectedAgent ? (
              <>
                <p className="text-gray-900 font-medium">No memories found</p>
                <p className="text-gray-500 text-sm mt-1">
                  {searchQuery ? 'Try a different search term' : 'Store a memory to get started'}
                </p>
              </>
            ) : (
              <>
                <p className="text-gray-900 font-medium">Select an agent</p>
                <p className="text-gray-500 text-sm mt-1">Choose an agent above to view its memories</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Knowledge Base */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Knowledge Base</h2>
          <div className="relative sm:w-64">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={kbSearchQuery}
              onChange={(e) => setKbSearchQuery(e.target.value)}
              placeholder="Search knowledge base..."
              className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        {filteredKB.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6">
            {filteredKB.map((kb) => (
              <div key={kb.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{kb.title}</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{kb.entries} entries</span>
                </div>
                <p className="text-sm text-gray-500 mb-3">{kb.description}</p>
                <p className="text-xs text-gray-400">Updated {formatDate(kb.last_updated)}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📚</div>
            <p className="text-gray-500">{kbSearchQuery ? 'No matching knowledge base entries' : 'No knowledge base entries available'}</p>
          </div>
        )}
      </div>

      {/* Store Memory Modal */}
      {showStoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Store Memory</h3>
              <button onClick={() => setShowStoreModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleStoreMemory}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Key</label>
              <input
                type="text"
                value={storeForm.key}
                onChange={(e) => setStoreForm({ ...storeForm, key: e.target.value })}
                placeholder="e.g., user_preferences"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
                required
              />
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <textarea
                value={storeForm.content}
                onChange={(e) => setStoreForm({ ...storeForm, content: e.target.value })}
                placeholder="Enter memory content..."
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4 resize-none"
                required
              />
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={storeForm.type}
                onChange={(e) => setStoreForm({ ...storeForm, type: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
              >
                <option value="long_term">Long-term</option>
                <option value="short_term">Short-term</option>
              </select>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowStoreModal(false)} className="flex-1 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition">
                  Store Memory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Memory Modal */}
      {showEditModal && editingMemory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Memory</h3>
              <button onClick={() => { setShowEditModal(false); setEditingMemory(null) }} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleEditMemory}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Key</label>
              <input
                type="text"
                value={editingMemory.key}
                onChange={(e) => setEditingMemory({ ...editingMemory, key: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
                required
              />
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <textarea
                value={editingMemory.content}
                onChange={(e) => setEditingMemory({ ...editingMemory, content: e.target.value })}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4 resize-none"
                required
              />
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={editingMemory.type}
                onChange={(e) => setEditingMemory({ ...editingMemory, type: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
              >
                <option value="long_term">Long-term</option>
                <option value="short_term">Short-term</option>
              </select>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowEditModal(false); setEditingMemory(null) }} className="flex-1 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
