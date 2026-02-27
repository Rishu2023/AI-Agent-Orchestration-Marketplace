import React, { useState, useEffect } from 'react'

const demoNodes = [
  { id: 'n1', name: 'US-East Primary', url: 'https://us-east.agenthub.io', status: 'healthy', agent_count: 342, last_heartbeat: '2024-01-15T10:29:45Z', region: 'North America', latency: 12 },
  { id: 'n2', name: 'EU-West Gateway', url: 'https://eu-west.agenthub.io', status: 'healthy', agent_count: 256, last_heartbeat: '2024-01-15T10:29:50Z', region: 'Europe', latency: 45 },
  { id: 'n3', name: 'AP-Southeast Node', url: 'https://ap-se.agenthub.io', status: 'healthy', agent_count: 189, last_heartbeat: '2024-01-15T10:29:30Z', region: 'Asia Pacific', latency: 88 },
  { id: 'n4', name: 'US-West Secondary', url: 'https://us-west.agenthub.io', status: 'degraded', agent_count: 198, last_heartbeat: '2024-01-15T10:28:00Z', region: 'North America', latency: 34 },
  { id: 'n5', name: 'EU-Central Hub', url: 'https://eu-central.agenthub.io', status: 'healthy', agent_count: 215, last_heartbeat: '2024-01-15T10:29:55Z', region: 'Europe', latency: 52 },
  { id: 'n6', name: 'SA-East Node', url: 'https://sa-east.agenthub.io', status: 'offline', agent_count: 87, last_heartbeat: '2024-01-15T09:15:00Z', region: 'South America', latency: null },
  { id: 'n7', name: 'AF-South Node', url: 'https://af-south.agenthub.io', status: 'healthy', agent_count: 64, last_heartbeat: '2024-01-15T10:29:40Z', region: 'Africa', latency: 120 },
]

const demoFederatedAgents = [
  { id: 'fa1', name: 'Global Research Agent', source_node: 'US-East Primary', category: 'research', availability: 'available', replicas: 3 },
  { id: 'fa2', name: 'Multi-lingual Translator', source_node: 'EU-West Gateway', category: 'translation', availability: 'available', replicas: 5 },
  { id: 'fa3', name: 'Distributed Data Miner', source_node: 'AP-Southeast Node', category: 'analysis', availability: 'available', replicas: 2 },
  { id: 'fa4', name: 'Federated Code Reviewer', source_node: 'US-West Secondary', category: 'coding', availability: 'degraded', replicas: 1 },
  { id: 'fa5', name: 'Cross-Region Content Gen', source_node: 'EU-Central Hub', category: 'writing', availability: 'available', replicas: 4 },
  { id: 'fa6', name: 'Global Support Bot', source_node: 'US-East Primary', category: 'support', availability: 'available', replicas: 6 },
]

const mapDots = [
  { x: 25, y: 35, region: 'North America' },
  { x: 18, y: 40, region: 'North America' },
  { x: 48, y: 32, region: 'Europe' },
  { x: 52, y: 35, region: 'Europe' },
  { x: 75, y: 42, region: 'Asia Pacific' },
  { x: 30, y: 65, region: 'South America' },
  { x: 53, y: 58, region: 'Africa' },
]

export default function FederationDashboard() {
  const [nodes, setNodes] = useState([])
  const [federatedAgents, setFederatedAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedNode, setExpandedNode] = useState(null)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [registerForm, setRegisterForm] = useState({ name: '', url: '', region: '' })

  useEffect(() => {
    fetchFederationData()
  }, [])

  async function fetchFederationData() {
    setLoading(true)
    setError(null)
    try {
      const [nodesRes, agentsRes] = await Promise.allSettled([
        fetch('/api/v1/federation/nodes'),
        fetch('/api/v1/federation/agents'),
      ])

      if (nodesRes.status === 'fulfilled' && nodesRes.value.ok) {
        const data = await nodesRes.value.json()
        setNodes(Array.isArray(data) ? data : data.nodes ?? [])
      } else {
        setNodes(demoNodes)
      }

      if (agentsRes.status === 'fulfilled' && agentsRes.value.ok) {
        const data = await agentsRes.value.json()
        setFederatedAgents(Array.isArray(data) ? data : data.agents ?? [])
      } else {
        setFederatedAgents(demoFederatedAgents)
      }
    } catch {
      setError('Failed to load federation data. Showing demo data.')
      setNodes(demoNodes)
      setFederatedAgents(demoFederatedAgents)
    } finally {
      setLoading(false)
    }
  }

  async function handleRegisterNode(e) {
    e.preventDefault()
    try {
      const res = await fetch('/api/v1/federation/nodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm),
      })
      if (res.ok) {
        const newNode = await res.json()
        setNodes((prev) => [...prev, newNode])
      }
    } catch {
      setNodes((prev) => [
        ...prev,
        { id: `n-${Date.now()}`, name: registerForm.name, url: registerForm.url, status: 'healthy', agent_count: 0, last_heartbeat: new Date().toISOString(), region: registerForm.region, latency: null },
      ])
    }
    setRegisterForm({ name: '', url: '', region: '' })
    setShowRegisterModal(false)
  }

  const statusColor = (status) => {
    switch (status) {
      case 'healthy': return 'bg-green-500'
      case 'available': return 'bg-green-500'
      case 'degraded': return 'bg-yellow-500'
      default: return 'bg-red-500'
    }
  }

  const statusBadge = (status) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800'
      case 'available': return 'bg-green-100 text-green-800'
      case 'degraded': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-red-100 text-red-800'
    }
  }

  const totalAgentCount = nodes.reduce((sum, n) => sum + (n.agent_count || 0), 0)
  const healthyNodes = nodes.filter((n) => n.status === 'healthy').length
  const healthPct = nodes.length > 0 ? Math.round((healthyNodes / nodes.length) * 100) : 0

  function formatTimeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const secs = Math.floor(diff / 1000)
    if (secs < 60) return `${secs}s ago`
    const mins = Math.floor(secs / 60)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    return `${hrs}h ago`
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="animate-spin inline-block w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full mb-4" />
        <p className="text-gray-500">Loading federation network...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Federation Network</h1>
          <p className="text-gray-500">Monitor and manage the distributed agent network</p>
        </div>
        <button
          onClick={() => setShowRegisterModal(true)}
          className="mt-4 sm:mt-0 bg-primary-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition"
        >
          + Register Node
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Network Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Total Nodes</p>
          <p className="text-2xl font-bold text-gray-900">{nodes.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Federated Agents</p>
          <p className="text-2xl font-bold text-gray-900">{totalAgentCount.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Network Health</p>
          <p className={`text-2xl font-bold ${healthPct >= 80 ? 'text-green-600' : healthPct >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
            {healthPct}%
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Healthy Nodes</p>
          <p className="text-2xl font-bold text-green-600">{healthyNodes}/{nodes.length}</p>
        </div>
      </div>

      {/* World Map Visualization */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Global Network Map</h2>
        <div className="relative bg-gradient-to-b from-primary-50 to-blue-50 rounded-lg overflow-hidden" style={{ paddingBottom: '45%' }}>
          {/* Simple world map outline */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 50" preserveAspectRatio="xMidYMid meet">
            {/* Grid lines */}
            <line x1="0" y1="25" x2="100" y2="25" stroke="#e0e7ff" strokeWidth="0.2" strokeDasharray="1,1" />
            <line x1="50" y1="0" x2="50" y2="50" stroke="#e0e7ff" strokeWidth="0.2" strokeDasharray="1,1" />
            {/* Continental shapes (simplified) */}
            <ellipse cx="25" cy="30" rx="12" ry="10" fill="#c7d2fe" opacity="0.4" />
            <ellipse cx="50" cy="28" rx="8" ry="12" fill="#c7d2fe" opacity="0.4" />
            <ellipse cx="75" cy="32" rx="14" ry="10" fill="#c7d2fe" opacity="0.4" />
            <ellipse cx="28" cy="58" rx="6" ry="8" fill="#c7d2fe" opacity="0.3" />
            <ellipse cx="55" cy="50" rx="7" ry="6" fill="#c7d2fe" opacity="0.3" />
            {/* Node dots */}
            {mapDots.map((dot, i) => {
              const matchingNodes = nodes.filter((n) => n.region === dot.region)
              const worstStatus = matchingNodes.some((n) => n.status === 'offline') ? 'offline' : matchingNodes.some((n) => n.status === 'degraded') ? 'degraded' : 'healthy'
              return (
                <g key={i}>
                  <circle cx={dot.x} cy={dot.y} r="1.8" fill={worstStatus === 'healthy' ? '#22c55e' : worstStatus === 'degraded' ? '#eab308' : '#ef4444'} opacity="0.3">
                    <animate attributeName="r" values="1.8;3;1.8" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={dot.x} cy={dot.y} r="1" fill={worstStatus === 'healthy' ? '#22c55e' : worstStatus === 'degraded' ? '#eab308' : '#ef4444'} />
                </g>
              )
            })}
            {/* Connection lines between nodes */}
            <line x1="25" y1="35" x2="48" y2="32" stroke="#6366f1" strokeWidth="0.15" opacity="0.3" />
            <line x1="48" y1="32" x2="75" y2="42" stroke="#6366f1" strokeWidth="0.15" opacity="0.3" />
            <line x1="52" y1="35" x2="75" y2="42" stroke="#6366f1" strokeWidth="0.15" opacity="0.3" />
            <line x1="25" y1="35" x2="30" y2="65" stroke="#6366f1" strokeWidth="0.15" opacity="0.3" />
            <line x1="48" y1="32" x2="53" y2="58" stroke="#6366f1" strokeWidth="0.15" opacity="0.3" />
          </svg>
        </div>
        <div className="flex flex-wrap gap-4 mt-4 text-xs">
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500" /> Healthy</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-yellow-500" /> Degraded</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500" /> Offline</div>
        </div>
      </div>

      {/* Connected Nodes */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Connected Nodes</h2>
        </div>
        {nodes.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {nodes.map((node) => (
              <div key={node.id}>
                <button
                  onClick={() => setExpandedNode(expandedNode === node.id ? null : node.id)}
                  className="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 text-left"
                >
                  <span className={`flex-shrink-0 w-3 h-3 rounded-full ${statusColor(node.status)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{node.name}</p>
                    <p className="text-xs text-gray-500">{node.region}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge(node.status)}`}>
                    {node.status}
                  </span>
                  <span className="text-sm text-gray-500">{node.agent_count} agents</span>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedNode === node.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedNode === node.id && (
                  <div className="px-6 pb-4 bg-gray-50">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Name</p>
                        <p className="font-medium text-gray-900">{node.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1">URL</p>
                        <p className="font-medium text-gray-900 truncate">{node.url}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Agent Count</p>
                        <p className="font-medium text-gray-900">{node.agent_count}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Last Heartbeat</p>
                        <p className="font-medium text-gray-900">{formatTimeAgo(node.last_heartbeat)}</p>
                      </div>
                      {node.latency != null && (
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Latency</p>
                          <p className="font-medium text-gray-900">{node.latency}ms</p>
                        </div>
                      )}
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Region</p>
                        <p className="font-medium text-gray-900">{node.region}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🌐</div>
            <p className="text-gray-500">No nodes connected</p>
          </div>
        )}
      </div>

      {/* Federated Agents */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Federated Agents</h2>
        </div>
        {federatedAgents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-6 py-3 text-gray-500 font-medium">Agent</th>
                  <th className="px-6 py-3 text-gray-500 font-medium">Source Node</th>
                  <th className="px-6 py-3 text-gray-500 font-medium">Category</th>
                  <th className="px-6 py-3 text-gray-500 font-medium">Status</th>
                  <th className="px-6 py-3 text-gray-500 font-medium text-right">Replicas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {federatedAgents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-900">{agent.name}</td>
                    <td className="px-6 py-3 text-gray-600">{agent.source_node}</td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        {agent.category}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge(agent.availability)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusColor(agent.availability)}`} />
                        {agent.availability}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right text-gray-600">{agent.replicas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🤖</div>
            <p className="text-gray-500">No federated agents available</p>
          </div>
        )}
      </div>

      {/* Register Node Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Register Node</h3>
              <button onClick={() => setShowRegisterModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleRegisterNode}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Node Name</label>
              <input
                type="text"
                value={registerForm.name}
                onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                placeholder="e.g., US-Central Node"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
                required
              />
              <label className="block text-sm font-medium text-gray-700 mb-2">Node URL</label>
              <input
                type="url"
                value={registerForm.url}
                onChange={(e) => setRegisterForm({ ...registerForm, url: e.target.value })}
                placeholder="https://your-node.example.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
                required
              />
              <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
              <select
                value={registerForm.region}
                onChange={(e) => setRegisterForm({ ...registerForm, region: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
                required
              >
                <option value="">Select region</option>
                <option value="North America">North America</option>
                <option value="Europe">Europe</option>
                <option value="Asia Pacific">Asia Pacific</option>
                <option value="South America">South America</option>
                <option value="Africa">Africa</option>
                <option value="Middle East">Middle East</option>
                <option value="Oceania">Oceania</option>
              </select>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowRegisterModal(false)} className="flex-1 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition">
                  Register Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
