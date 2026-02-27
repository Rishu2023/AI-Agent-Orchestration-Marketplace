import React, { useState, useEffect } from 'react'

const demoUsers = [
  { id: 'u1', username: 'alice_dev', email: 'alice@example.com', plan: 'pro', credits: 4500, agents_published: 7, join_date: '2023-06-15', last_active: '2024-01-15T14:30:00Z', status: 'active' },
  { id: 'u2', username: 'bob_builder', email: 'bob@example.com', plan: 'enterprise', credits: 12000, agents_published: 15, join_date: '2023-03-01', last_active: '2024-01-15T12:00:00Z', status: 'active' },
  { id: 'u3', username: 'charlie_ai', email: 'charlie@example.com', plan: 'free', credits: 50, agents_published: 1, join_date: '2024-01-01', last_active: '2024-01-14T08:20:00Z', status: 'active' },
  { id: 'u4', username: 'spam_user_99', email: 'spam99@example.com', plan: 'free', credits: 0, agents_published: 0, join_date: '2024-01-10', last_active: '2024-01-10T01:00:00Z', status: 'banned' },
  { id: 'u5', username: 'dana_ops', email: 'dana@example.com', plan: 'pro', credits: 2200, agents_published: 4, join_date: '2023-09-20', last_active: '2024-01-15T16:45:00Z', status: 'active' },
]

const demoAgents = [
  { id: 'a1', name: 'Customer Support AI', creator: 'alice_dev', version: '2.1.0', executions: 89000, rating: 4.8, status: 'published', origin_node: 'us-east-1' },
  { id: 'a2', name: 'CodeCraft', creator: 'bob_builder', version: '3.0.1', executions: 52100, rating: 4.6, status: 'featured', origin_node: 'eu-west-1' },
  { id: 'a3', name: 'Data Analyzer', creator: 'dana_ops', version: '1.5.0', executions: 15400, rating: 4.3, status: 'published', origin_node: 'us-east-1' },
  { id: 'a4', name: 'Spam Bot', creator: 'spam_user_99', version: '0.1.0', executions: 2, rating: 1.0, status: 'flagged', origin_node: 'ap-south-1' },
  { id: 'a5', name: 'Research Assistant Pro', creator: 'charlie_ai', version: '1.0.0', executions: 8900, rating: 4.5, status: 'published', origin_node: 'us-east-1' },
]

const demoWorkflows = [
  { id: 'w1', name: 'Content Pipeline', execution_count: 12400, success_rate: 97.2, status: 'running' },
  { id: 'w2', name: 'Data ETL Nightly', execution_count: 8900, success_rate: 99.1, status: 'completed' },
  { id: 'w3', name: 'Customer Onboarding', execution_count: 3200, success_rate: 85.5, status: 'running' },
  { id: 'w4', name: 'Broken Import Job', execution_count: 450, success_rate: 12.3, status: 'failed' },
]

const demoCredits = { total_supply: 2500000, velocity: 3.2 }

const demoCreditLedger = [
  { id: 'cl1', type: 'mint', amount: 50000, admin: 'superadmin', reason: 'Monthly allocation', created_at: '2024-01-15T10:00:00Z' },
  { id: 'cl2', type: 'burn', amount: 1200, admin: 'superadmin', reason: 'Spam account cleanup', created_at: '2024-01-14T09:30:00Z' },
  { id: 'cl3', type: 'transfer', amount: 500, admin: 'superadmin', reason: 'Bonus for top contributor', created_at: '2024-01-13T15:00:00Z' },
  { id: 'cl4', type: 'mint', amount: 10000, admin: 'superadmin', reason: 'Partnership credit grant', created_at: '2024-01-12T11:00:00Z' },
  { id: 'cl5', type: 'burn', amount: 300, admin: 'superadmin', reason: 'Fraudulent account credits', created_at: '2024-01-11T14:20:00Z' },
]

const demoFederationNodes = [
  { id: 'n1', name: 'US East Primary', url: 'https://us-east.agents.example.com', status: 'connected', agents_count: 142, last_sync: '2024-01-15T16:50:00Z' },
  { id: 'n2', name: 'EU West Secondary', url: 'https://eu-west.agents.example.com', status: 'connected', agents_count: 89, last_sync: '2024-01-15T16:48:00Z' },
  { id: 'n3', name: 'AP South Candidate', url: 'https://ap-south.agents.example.com', status: 'pending', agents_count: 0, last_sync: null },
]

const demoAnnouncements = [
  { id: 'ann1', title: 'Scheduled Maintenance Jan 20', content: 'The platform will undergo maintenance from 2:00 AM to 4:00 AM UTC.', type: 'warning', target_tier: 'all', created_at: '2024-01-15T08:00:00Z' },
  { id: 'ann2', title: 'New Agent SDK v3 Released', content: 'We have released SDK v3 with improved performance and new capabilities.', type: 'info', target_tier: 'pro', created_at: '2024-01-12T10:00:00Z' },
  { id: 'ann3', title: 'Holiday Credit Bonus', content: 'All users receive 100 bonus credits for the holiday season.', type: 'success', target_tier: 'all', created_at: '2024-01-01T00:00:00Z' },
]

const demoAuditLogs = [
  { id: 'al1', admin: 'superadmin', action: 'ban_user', target_type: 'user', target_id: 'u4', details: 'Banned for spamming', ip_address: '192.168.1.10', created_at: '2024-01-15T14:00:00Z' },
  { id: 'al2', admin: 'superadmin', action: 'mint_credits', target_type: 'system', target_id: 'system', details: 'Minted 50000 credits', ip_address: '192.168.1.10', created_at: '2024-01-15T10:00:00Z' },
  { id: 'al3', admin: 'superadmin', action: 'remove_agent', target_type: 'agent', target_id: 'a4', details: 'Removed flagged agent', ip_address: '192.168.1.10', created_at: '2024-01-14T16:30:00Z' },
  { id: 'al4', admin: 'superadmin', action: 'toggle_kill_switch', target_type: 'system', target_id: 'maintenance_mode', details: 'Enabled maintenance mode', ip_address: '192.168.1.10', created_at: '2024-01-14T02:00:00Z' },
  { id: 'al5', admin: 'superadmin', action: 'create_announcement', target_type: 'announcement', target_id: 'ann1', details: 'Created maintenance announcement', ip_address: '192.168.1.10', created_at: '2024-01-13T08:00:00Z' },
  { id: 'al6', admin: 'superadmin', action: 'approve_node', target_type: 'federation', target_id: 'n2', details: 'Approved EU West node', ip_address: '10.0.0.5', created_at: '2024-01-12T12:00:00Z' },
]

const demoKillSwitches = [
  { id: 'ks1', key: 'agent_executions', name: 'Agent Executions', description: 'Disable all agent executions platform-wide', is_active: false },
  { id: 'ks2', key: 'workflow_executions', name: 'Workflow Executions', description: 'Disable all workflow executions', is_active: false },
  { id: 'ks3', key: 'fine_tuning', name: 'Fine Tuning', description: 'Disable model fine-tuning jobs', is_active: false },
  { id: 'ks4', key: 'federation_sync', name: 'Federation Sync', description: 'Pause federation node synchronization', is_active: false },
  { id: 'ks5', key: 'maintenance_mode', name: 'Maintenance Mode', description: 'Enable full platform maintenance mode', is_active: false },
]

const TABS = ['Users', 'Agents', 'Workflows', 'Credits', 'Federation', 'Announcements', 'Audit Log', 'Kill Switches']

export default function AdminPanel() {
  const [userRole] = useState('superadmin')
  const [activeTab, setActiveTab] = useState('Users')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [users, setUsers] = useState([])
  const [agents, setAgents] = useState([])
  const [workflows, setWorkflows] = useState([])
  const [creditStats, setCreditStats] = useState(null)
  const [creditLedger, setCreditLedger] = useState([])
  const [federationNodes, setFederationNodes] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [killSwitches, setKillSwitches] = useState([])

  const [userSearch, setUserSearch] = useState('')
  const [selectedUsers, setSelectedUsers] = useState([])
  const [showAdjustCreditsModal, setShowAdjustCreditsModal] = useState(false)
  const [showMintModal, setShowMintModal] = useState(false)
  const [showBurnModal, setShowBurnModal] = useState(false)
  const [adjustTarget, setAdjustTarget] = useState(null)
  const [adjustAmount, setAdjustAmount] = useState('')
  const [adjustReason, setAdjustReason] = useState('')
  const [mintAmount, setMintAmount] = useState('')
  const [burnUser, setBurnUser] = useState('')
  const [burnAmount, setBurnAmount] = useState('')
  const [ledgerSearch, setLedgerSearch] = useState('')
  const [auditSearch, setAuditSearch] = useState('')
  const [auditAction, setAuditAction] = useState('')
  const [auditDateFrom, setAuditDateFrom] = useState('')
  const [auditDateTo, setAuditDateTo] = useState('')
  const [newAnnTitle, setNewAnnTitle] = useState('')
  const [newAnnContent, setNewAnnContent] = useState('')
  const [newAnnType, setNewAnnType] = useState('info')
  const [newAnnTier, setNewAnnTier] = useState('all')
  const [killConfirmInputs, setKillConfirmInputs] = useState({})

  useEffect(() => {
    fetchAdminData()
  }, [])

  async function fetchAdminData() {
    setLoading(true)
    setError(null)
    try {
      const [usersRes, auditRes] = await Promise.allSettled([
        fetch('/api/v1/admin/users'),
        fetch('/api/v1/admin/audit-log'),
      ])

      if (usersRes.status === 'fulfilled' && usersRes.value.ok) {
        const data = await usersRes.value.json()
        setUsers(Array.isArray(data) ? data : data.users ?? [])
      } else {
        setUsers(demoUsers)
      }

      if (auditRes.status === 'fulfilled' && auditRes.value.ok) {
        const data = await auditRes.value.json()
        setAuditLogs(Array.isArray(data) ? data : data.logs ?? [])
      } else {
        setAuditLogs(demoAuditLogs)
      }

      setAgents(demoAgents)
      setWorkflows(demoWorkflows)
      setCreditStats(demoCredits)
      setCreditLedger(demoCreditLedger)
      setFederationNodes(demoFederationNodes)
      setAnnouncements(demoAnnouncements)
      setKillSwitches(demoKillSwitches)
    } catch {
      setError('Failed to load admin data. Showing demo data.')
      setUsers(demoUsers)
      setAgents(demoAgents)
      setWorkflows(demoWorkflows)
      setCreditStats(demoCredits)
      setCreditLedger(demoCreditLedger)
      setFederationNodes(demoFederationNodes)
      setAnnouncements(demoAnnouncements)
      setAuditLogs(demoAuditLogs)
      setKillSwitches(demoKillSwitches)
    } finally {
      setLoading(false)
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  async function handleBanUser(user) {
    const action = user.status === 'banned' ? 'unban' : 'ban'
    try {
      await fetch(`/api/v1/admin/users/${user.id}/${action}`, { method: 'POST' })
    } catch { /* fallback */ }
    setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, status: action === 'ban' ? 'banned' : 'active' } : u))
  }

  function handleDeleteUser(userId) {
    setUsers((prev) => prev.filter((u) => u.id !== userId))
    setSelectedUsers((prev) => prev.filter((id) => id !== userId))
  }

  function handleChangePlan(userId, plan) {
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, plan } : u))
  }

  function handleAdjustCredits(e) {
    e.preventDefault()
    const amount = parseFloat(adjustAmount)
    if (!amount || !adjustTarget) return
    setUsers((prev) => prev.map((u) => u.id === adjustTarget.id ? { ...u, credits: u.credits + amount } : u))
    setAdjustAmount('')
    setAdjustReason('')
    setAdjustTarget(null)
    setShowAdjustCreditsModal(false)
  }

  function handleToggleFeature(agentId) {
    setAgents((prev) => prev.map((a) => a.id === agentId ? { ...a, status: a.status === 'featured' ? 'published' : 'featured' } : a))
  }

  function handleRemoveAgent(agentId) {
    setAgents((prev) => prev.filter((a) => a.id !== agentId))
  }

  function handleKillWorkflow(workflowId) {
    setWorkflows((prev) => prev.map((w) => w.id === workflowId ? { ...w, status: 'failed' } : w))
  }

  async function handleMintCredits(e) {
    e.preventDefault()
    const amount = parseFloat(mintAmount)
    if (!amount || amount <= 0) return
    setCreditStats((prev) => ({ ...prev, total_supply: prev.total_supply + amount }))
    setCreditLedger((prev) => [
      { id: `cl-${Date.now()}`, type: 'mint', amount, admin: 'superadmin', reason: 'Manual mint', created_at: new Date().toISOString() },
      ...prev,
    ])
    setMintAmount('')
    setShowMintModal(false)
  }

  async function handleBurnCredits(e) {
    e.preventDefault()
    const amount = parseFloat(burnAmount)
    if (!amount || amount <= 0) return
    setCreditStats((prev) => ({ ...prev, total_supply: prev.total_supply - amount }))
    setCreditLedger((prev) => [
      { id: `cl-${Date.now()}`, type: 'burn', amount, admin: 'superadmin', reason: `Burned from ${burnUser || 'system'}`, created_at: new Date().toISOString() },
      ...prev,
    ])
    setBurnAmount('')
    setBurnUser('')
    setShowBurnModal(false)
  }

  function handleDisconnectNode(nodeId) {
    setFederationNodes((prev) => prev.map((n) => n.id === nodeId ? { ...n, status: 'disconnected' } : n))
  }

  function handleApproveNode(nodeId) {
    setFederationNodes((prev) => prev.map((n) => n.id === nodeId ? { ...n, status: 'connected' } : n))
  }

  function handleRejectNode(nodeId) {
    setFederationNodes((prev) => prev.filter((n) => n.id !== nodeId))
  }

  async function handleCreateAnnouncement(e) {
    e.preventDefault()
    if (!newAnnTitle.trim() || !newAnnContent.trim()) return
    const newAnn = {
      id: `ann-${Date.now()}`,
      title: newAnnTitle,
      content: newAnnContent,
      type: newAnnType,
      target_tier: newAnnTier,
      created_at: new Date().toISOString(),
    }
    try {
      await fetch('/api/v1/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAnn),
      })
    } catch { /* fallback */ }
    setAnnouncements((prev) => [newAnn, ...prev])
    setNewAnnTitle('')
    setNewAnnContent('')
    setNewAnnType('info')
    setNewAnnTier('all')
  }

  function handleDeleteAnnouncement(annId) {
    setAnnouncements((prev) => prev.filter((a) => a.id !== annId))
  }

  async function handleToggleKillSwitch(ks) {
    const confirmVal = killConfirmInputs[ks.id] || ''
    if (!ks.is_active && confirmVal !== 'CONFIRM') return
    try {
      await fetch('/api/v1/admin/kill-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: ks.key, is_active: !ks.is_active }),
      })
    } catch { /* fallback */ }
    setKillSwitches((prev) => prev.map((k) => k.id === ks.id ? { ...k, is_active: !k.is_active } : k))
    setKillConfirmInputs((prev) => ({ ...prev, [ks.id]: '' }))
  }

  function handleBulkBan() {
    setUsers((prev) => prev.map((u) => selectedUsers.includes(u.id) ? { ...u, status: 'banned' } : u))
    setSelectedUsers([])
  }

  function handleExportCSV(data, filename) {
    if (!data.length) return
    const headers = Object.keys(data[0]).join(',')
    const rows = data.map((row) => Object.values(row).join(','))
    const csv = [headers, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  function toggleSelectUser(userId) {
    setSelectedUsers((prev) => prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId])
  }

  if (userRole !== 'superadmin') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <p className="text-xl text-gray-500 mb-6">Page Not Found</p>
        <a href="/" className="text-primary-600 hover:text-primary-700 font-medium">Go Home</a>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="animate-spin inline-block w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full mb-4" />
        <p className="text-gray-500">Loading admin panel...</p>
      </div>
    )
  }

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  )

  const filteredLedger = creditLedger.filter((l) =>
    l.reason.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
    l.type.toLowerCase().includes(ledgerSearch.toLowerCase())
  )

  const filteredAuditLogs = auditLogs.filter((log) => {
    const matchSearch = !auditSearch || log.admin.toLowerCase().includes(auditSearch.toLowerCase()) || log.target_id.toLowerCase().includes(auditSearch.toLowerCase())
    const matchAction = !auditAction || log.action === auditAction
    const logTime = new Date(log.created_at).getTime()
    const matchFrom = !auditDateFrom || logTime >= new Date(auditDateFrom).getTime()
    const matchTo = !auditDateTo || logTime <= new Date(auditDateTo + 'T23:59:59Z').getTime()
    return matchSearch && matchAction && matchFrom && matchTo
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 rounded-2xl p-8 text-white mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
        <p className="text-primary-200">Platform administration and management</p>
      </div>

      {error && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-8 border-b border-gray-200 overflow-x-auto">
        <nav className="flex gap-1 -mb-px">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                activeTab === tab
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Users Tab */}
      {activeTab === 'Users' && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-full sm:w-80"
            />
            {selectedUsers.length > 0 && (
              <div className="flex gap-2">
                <button onClick={handleBulkBan} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition">
                  Ban Selected ({selectedUsers.length})
                </button>
                <button onClick={() => handleExportCSV(filteredUsers, 'users.csv')} className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                  Export CSV
                </button>
              </div>
            )}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-4 py-3 text-gray-500 font-medium w-10">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onChange={() => setSelectedUsers(selectedUsers.length === filteredUsers.length ? [] : filteredUsers.map((u) => u.id))}
                        className="rounded"
                      />
                    </th>
                    <th className="px-4 py-3 text-gray-500 font-medium">Username</th>
                    <th className="px-4 py-3 text-gray-500 font-medium">Email</th>
                    <th className="px-4 py-3 text-gray-500 font-medium">Plan</th>
                    <th className="px-4 py-3 text-gray-500 font-medium">Credits</th>
                    <th className="px-4 py-3 text-gray-500 font-medium">Agents</th>
                    <th className="px-4 py-3 text-gray-500 font-medium">Joined</th>
                    <th className="px-4 py-3 text-gray-500 font-medium">Last Active</th>
                    <th className="px-4 py-3 text-gray-500 font-medium">Status</th>
                    <th className="px-4 py-3 text-gray-500 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selectedUsers.includes(user.id)} onChange={() => toggleSelectUser(user.id)} className="rounded" />
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{user.username}</td>
                      <td className="px-4 py-3 text-gray-700">{user.email}</td>
                      <td className="px-4 py-3">
                        <select
                          value={user.plan}
                          onChange={(e) => handleChangePlan(user.id, e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
                        >
                          <option value="free">Free</option>
                          <option value="pro">Pro</option>
                          <option value="enterprise">Enterprise</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{user.credits.toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-700">{user.agents_published}</td>
                      <td className="px-4 py-3 text-gray-500">{user.join_date}</td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(user.last_active)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleBanUser(user)}
                            className={`px-2 py-1 rounded text-xs font-medium transition ${
                              user.status === 'banned' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                          >
                            {user.status === 'banned' ? 'Unban' : 'Ban'}
                          </button>
                          <button
                            onClick={() => { setAdjustTarget(user); setShowAdjustCreditsModal(true) }}
                            className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium hover:bg-blue-200 transition"
                          >
                            Credits
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium hover:bg-gray-200 transition"
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
          </div>
        </div>
      )}

      {/* Agents Tab */}
      {activeTab === 'Agents' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-6 py-3 text-gray-500 font-medium">Name</th>
                  <th className="px-6 py-3 text-gray-500 font-medium">Creator</th>
                  <th className="px-6 py-3 text-gray-500 font-medium">Version</th>
                  <th className="px-6 py-3 text-gray-500 font-medium">Executions</th>
                  <th className="px-6 py-3 text-gray-500 font-medium">Rating</th>
                  <th className="px-6 py-3 text-gray-500 font-medium">Status</th>
                  <th className="px-6 py-3 text-gray-500 font-medium">Origin Node</th>
                  <th className="px-6 py-3 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {agents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-900">{agent.name}</td>
                    <td className="px-6 py-3 text-gray-700">{agent.creator}</td>
                    <td className="px-6 py-3 text-gray-500">{agent.version}</td>
                    <td className="px-6 py-3 text-gray-700">{agent.executions.toLocaleString()}</td>
                    <td className="px-6 py-3 text-gray-700">⭐ {agent.rating}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        agent.status === 'featured' ? 'bg-yellow-100 text-yellow-800'
                          : agent.status === 'flagged' ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {agent.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-500">{agent.origin_node}</td>
                    <td className="px-6 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleToggleFeature(agent.id)}
                          className={`px-2 py-1 rounded text-xs font-medium transition ${
                            agent.status === 'featured' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          }`}
                        >
                          {agent.status === 'featured' ? 'Unfeature' : 'Feature'}
                        </button>
                        <button
                          onClick={() => handleRemoveAgent(agent.id)}
                          className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium hover:bg-red-200 transition"
                        >
                          Remove
                        </button>
                        <button className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium hover:bg-gray-200 transition">
                          Transfer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Workflows Tab */}
      {activeTab === 'Workflows' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-6 py-3 text-gray-500 font-medium">Name</th>
                  <th className="px-6 py-3 text-gray-500 font-medium">Executions</th>
                  <th className="px-6 py-3 text-gray-500 font-medium">Success Rate</th>
                  <th className="px-6 py-3 text-gray-500 font-medium">Status</th>
                  <th className="px-6 py-3 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {workflows.map((wf) => (
                  <tr key={wf.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-900">{wf.name}</td>
                    <td className="px-6 py-3 text-gray-700">{wf.execution_count.toLocaleString()}</td>
                    <td className="px-6 py-3">
                      <span className={`font-medium ${
                        wf.success_rate >= 95 ? 'text-green-600'
                          : wf.success_rate >= 80 ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}>
                        {wf.success_rate}%
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        wf.status === 'running' ? 'bg-blue-100 text-blue-800'
                          : wf.status === 'completed' ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {wf.status}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex gap-1">
                        {wf.status === 'running' && (
                          <button
                            onClick={() => handleKillWorkflow(wf.id)}
                            className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium hover:bg-red-200 transition"
                          >
                            Kill
                          </button>
                        )}
                        <button className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium hover:bg-gray-200 transition">
                          View Logs
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Credits Tab */}
      {activeTab === 'Credits' && (
        <div>
          {creditStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-sm text-gray-500 mb-1">Total Supply</p>
                <p className="text-2xl font-bold text-gray-900">{creditStats.total_supply?.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-sm text-gray-500 mb-1">Velocity</p>
                <p className="text-2xl font-bold text-gray-900">{creditStats.velocity}x</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-center">
                <button
                  onClick={() => setShowMintModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
                >
                  Mint Credits
                </button>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-center">
                <button
                  onClick={() => setShowBurnModal(true)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition"
                >
                  Burn Credits
                </button>
              </div>
            </div>
          )}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Transaction Ledger</h2>
              <input
                type="text"
                placeholder="Search ledger..."
                value={ledgerSearch}
                onChange={(e) => setLedgerSearch(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-48"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-6 py-3 text-gray-500 font-medium">Type</th>
                    <th className="px-6 py-3 text-gray-500 font-medium">Amount</th>
                    <th className="px-6 py-3 text-gray-500 font-medium">Admin</th>
                    <th className="px-6 py-3 text-gray-500 font-medium">Reason</th>
                    <th className="px-6 py-3 text-gray-500 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLedger.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          entry.type === 'mint' ? 'bg-green-100 text-green-800'
                            : entry.type === 'burn' ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {entry.type}
                        </span>
                      </td>
                      <td className={`px-6 py-3 font-medium ${entry.type === 'burn' ? 'text-red-600' : 'text-green-600'}`}>
                        {entry.type === 'burn' ? '-' : '+'}{entry.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-3 text-gray-700">{entry.admin}</td>
                      <td className="px-6 py-3 text-gray-700">{entry.reason}</td>
                      <td className="px-6 py-3 text-gray-500">{formatDate(entry.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Federation Tab */}
      {activeTab === 'Federation' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {federationNodes.map((node) => (
            <div key={node.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className={`w-3 h-3 rounded-full ${
                  node.status === 'connected' ? 'bg-green-500'
                    : node.status === 'pending' ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`} />
                <h3 className="text-lg font-semibold text-gray-900">{node.name}</h3>
              </div>
              <p className="text-sm text-gray-500 mb-2 truncate">{node.url}</p>
              <div className="flex justify-between text-sm text-gray-700 mb-1">
                <span>Agents</span>
                <span className="font-medium">{node.agents_count}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-700 mb-4">
                <span>Last Sync</span>
                <span className="font-medium">{formatDate(node.last_sync)}</span>
              </div>
              <div className="flex gap-2">
                {node.status === 'connected' && (
                  <button
                    onClick={() => handleDisconnectNode(node.id)}
                    className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded-lg text-xs font-medium hover:bg-red-200 transition"
                  >
                    Disconnect
                  </button>
                )}
                {node.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApproveNode(node.id)}
                      className="flex-1 bg-green-100 text-green-700 px-3 py-2 rounded-lg text-xs font-medium hover:bg-green-200 transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectNode(node.id)}
                      className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded-lg text-xs font-medium hover:bg-red-200 transition"
                    >
                      Reject
                    </button>
                  </>
                )}
                {node.status === 'disconnected' && (
                  <button
                    onClick={() => handleApproveNode(node.id)}
                    className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-xs font-medium hover:bg-blue-200 transition"
                  >
                    Reconnect
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Announcements Tab */}
      {activeTab === 'Announcements' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Existing Announcements</h2>
            <div className="space-y-4">
              {announcements.map((ann) => (
                <div key={ann.id} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        ann.type === 'warning' ? 'bg-yellow-100 text-yellow-800'
                          : ann.type === 'success' ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {ann.type}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {ann.target_tier}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      className="text-gray-400 hover:text-red-600 text-lg leading-none"
                    >
                      &times;
                    </button>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">{ann.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{ann.content}</p>
                  <p className="text-xs text-gray-400">{formatDate(ann.created_at)}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Announcement</h2>
            <form onSubmit={handleCreateAnnouncement} className="bg-white rounded-xl border border-gray-200 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={newAnnTitle}
                onChange={(e) => setNewAnnTitle(e.target.value)}
                placeholder="Announcement title"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
                required
              />
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <textarea
                value={newAnnContent}
                onChange={(e) => setNewAnnContent(e.target.value)}
                placeholder="Announcement content..."
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
                required
              />
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={newAnnType}
                    onChange={(e) => setNewAnnType(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="success">Success</option>
                    <option value="error">Error</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Tier</label>
                  <select
                    value={newAnnTier}
                    onChange={(e) => setNewAnnTier(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="all">All Users</option>
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition">
                Publish Announcement
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Audit Log Tab */}
      {activeTab === 'Audit Log' && (
        <div>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <input
              type="text"
              placeholder="Search by user or target..."
              value={auditSearch}
              onChange={(e) => setAuditSearch(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 flex-1"
            />
            <select
              value={auditAction}
              onChange={(e) => setAuditAction(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">All Actions</option>
              <option value="ban_user">Ban User</option>
              <option value="mint_credits">Mint Credits</option>
              <option value="remove_agent">Remove Agent</option>
              <option value="toggle_kill_switch">Toggle Kill Switch</option>
              <option value="create_announcement">Create Announcement</option>
              <option value="approve_node">Approve Node</option>
            </select>
            <input type="date" value={auditDateFrom} onChange={(e) => setAuditDateFrom(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500" />
            <input type="date" value={auditDateTo} onChange={(e) => setAuditDateTo(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500" />
            <button
              onClick={() => handleExportCSV(filteredAuditLogs, 'audit-log.csv')}
              className="border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition whitespace-nowrap"
            >
              Export CSV
            </button>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-6 py-3 text-gray-500 font-medium">Timestamp</th>
                    <th className="px-6 py-3 text-gray-500 font-medium">Admin</th>
                    <th className="px-6 py-3 text-gray-500 font-medium">Action</th>
                    <th className="px-6 py-3 text-gray-500 font-medium">Target</th>
                    <th className="px-6 py-3 text-gray-500 font-medium">Details</th>
                    <th className="px-6 py-3 text-gray-500 font-medium">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-gray-500">{formatDate(log.created_at)}</td>
                      <td className="px-6 py-3 font-medium text-gray-900">{log.admin}</td>
                      <td className="px-6 py-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-700">{log.target_type}:{log.target_id}</td>
                      <td className="px-6 py-3 text-gray-700">{log.details}</td>
                      <td className="px-6 py-3 text-gray-500 font-mono text-xs">{log.ip_address}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Kill Switches Tab */}
      {activeTab === 'Kill Switches' && (
        <div className="space-y-4">
          {killSwitches.map((ks) => (
            <div key={ks.id} className={`bg-white rounded-xl border p-6 ${ks.is_active ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">{ks.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      ks.is_active ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {ks.is_active ? 'ON' : 'OFF'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{ks.description}</p>
                  {ks.is_active && (
                    <p className="text-sm text-red-600 font-medium mt-2">⚠️ This kill switch is currently active. Services are impacted.</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!ks.is_active && (
                    <input
                      type="text"
                      placeholder='Type "CONFIRM"'
                      value={killConfirmInputs[ks.id] || ''}
                      onChange={(e) => setKillConfirmInputs((prev) => ({ ...prev, [ks.id]: e.target.value }))}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 w-36"
                    />
                  )}
                  <button
                    onClick={() => handleToggleKillSwitch(ks)}
                    disabled={!ks.is_active && killConfirmInputs[ks.id] !== 'CONFIRM'}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      ks.is_active
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : killConfirmInputs[ks.id] === 'CONFIRM'
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {ks.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Adjust Credits Modal */}
      {showAdjustCreditsModal && adjustTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Adjust Credits</h3>
              <button onClick={() => { setShowAdjustCreditsModal(false); setAdjustTarget(null) }} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            <p className="text-sm text-gray-500 mb-4">User: <span className="font-medium text-gray-900">{adjustTarget.username}</span> (Current: {adjustTarget.credits.toLocaleString()} credits)</p>
            <form onSubmit={handleAdjustCredits}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount (positive to add, negative to remove)</label>
              <input
                type="number"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                placeholder="e.g. 500 or -200"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
                required
              />
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
              <input
                type="text"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="Reason for adjustment"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowAdjustCreditsModal(false); setAdjustTarget(null) }} className="flex-1 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition">
                  Adjust Credits
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mint Credits Modal */}
      {showMintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Mint Credits</h3>
              <button onClick={() => setShowMintModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleMintCredits}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount to Mint</label>
              <input
                type="number"
                min="1"
                value={mintAmount}
                onChange={(e) => setMintAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
                required
              />
              <div className="flex gap-2 mb-4">
                {[1000, 10000, 50000].map((amt) => (
                  <button key={amt} type="button" onClick={() => setMintAmount(String(amt))} className="flex-1 border border-gray-300 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition">
                    {amt.toLocaleString()}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowMintModal(false)} className="flex-1 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition">
                  Mint Credits
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Burn Credits Modal */}
      {showBurnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Burn Credits</h3>
              <button onClick={() => setShowBurnModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleBurnCredits}>
              <label className="block text-sm font-medium text-gray-700 mb-2">User (optional)</label>
              <input
                type="text"
                value={burnUser}
                onChange={(e) => setBurnUser(e.target.value)}
                placeholder="Search user..."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
              />
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount to Burn</label>
              <input
                type="number"
                min="1"
                value={burnAmount}
                onChange={(e) => setBurnAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
                required
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowBurnModal(false)} className="flex-1 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 transition">
                  Burn Credits
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
