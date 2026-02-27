import React, { useState, useEffect } from 'react'

const demoPersonalStats = { total_executions: 1842, credits_earned: 3560, agents_published: 7, avg_rating: 4.6 }

const demoAgentPerformance = [
  { name: 'Research Assistant Pro', executions_this_week: 312, trend: 'up' },
  { name: 'CodeCraft', executions_this_week: 245, trend: 'up' },
  { name: 'Data Analyzer', executions_this_week: 189, trend: 'stable' },
  { name: 'Marketing Strategist', executions_this_week: 156, trend: 'down' },
  { name: 'Content Writer AI', executions_this_week: 98, trend: 'up' },
]

const demoTopAgents = [
  { name: 'Customer Support AI', executions: 89000, rating: 4.9 },
  { name: 'CodeCraft', executions: 52100, rating: 4.7 },
  { name: 'Research Assistant Pro', executions: 15420, rating: 4.6 },
  { name: 'Marketing Strategist', executions: 8900, rating: 4.5 },
  { name: 'Content Writer AI', executions: 28900, rating: 4.3 },
]

const demoPlatformStats = {
  total_agents: 2450,
  total_executions_today: 18750,
  total_users: 12800,
  new_users_today: 42,
  credits_in_circulation: 2500000,
  active_federation_nodes: 8,
}

const demoRecentActivity = [
  { action: 'Agent "Research Assistant Pro" executed', target: 'user_42', timestamp: '2024-01-15T10:30:00Z' },
  { action: 'Earned 50 credits from usage fee', target: 'CodeCraft', timestamp: '2024-01-15T09:15:00Z' },
  { action: 'Published new agent version', target: 'Data Analyzer v2.1', timestamp: '2024-01-14T16:45:00Z' },
  { action: 'Workflow "Content Pipeline" completed', target: '3 agents', timestamp: '2024-01-14T12:00:00Z' },
  { action: 'Agent rating updated', target: 'Marketing Strategist', timestamp: '2024-01-13T14:20:00Z' },
]

const demoModelUsage = [
  { model_name: 'gpt-4', calls_count: 8420, percentage: 38 },
  { model_name: 'claude-3', calls_count: 5640, percentage: 25 },
  { model_name: 'mistral-large', calls_count: 3780, percentage: 17 },
  { model_name: 'gemini-pro', calls_count: 2890, percentage: 13 },
  { model_name: 'llama-3', calls_count: 1570, percentage: 7 },
]

const demoTopUsersByCredits = [
  { username: 'TechCorp', credits_earned: 24500 },
  { username: 'DevTools Inc', credits_earned: 18300 },
  { username: 'GrowthAI', credits_earned: 12800 },
  { username: 'AcademiaAI', credits_earned: 9200 },
  { username: 'WriteBot', credits_earned: 7600 },
]

const demoSystemHealth = { api_response_ms: 45, db_query_ms: 12, redis_latency_ms: 2, queue_depth: 23 }

const demoAlertFeed = [
  { type: 'error', message: 'Agent "Legacy Bot" failed 3 consecutive executions', timestamp: '2024-01-15T10:28:00Z' },
  { type: 'warning', message: 'API rate limit approaching threshold (85%)', timestamp: '2024-01-15T09:45:00Z' },
  { type: 'info', message: 'Federation node us-west-2 synced successfully', timestamp: '2024-01-15T08:30:00Z' },
  { type: 'warning', message: 'Queue depth exceeded 20 — consider scaling workers', timestamp: '2024-01-15T07:10:00Z' },
]

const demoCostBreakdown = [
  { name: 'Research Assistant Pro', type: 'agent', cost: 124 },
  { name: 'Content Pipeline', type: 'workflow', cost: 87 },
  { name: 'CodeCraft', type: 'agent', cost: 65 },
  { name: 'Data Analysis Flow', type: 'workflow', cost: 43 },
  { name: 'Marketing Strategist', type: 'agent', cost: 31 },
]

const demoTeamStats = { team_members: 12, total_executions: 14200, total_credits: 28400, avg_rating: 4.5 }

const demoTeamMembers = [
  { name: 'Alice Chen', executions: 3200, credits: 6400, agents: 4 },
  { name: 'Bob Smith', executions: 2800, credits: 5600, agents: 3 },
  { name: 'Carol Davis', executions: 2400, credits: 4800, agents: 5 },
  { name: 'Dan Wilson', executions: 1900, credits: 3800, agents: 2 },
  { name: 'Eve Martinez', executions: 1600, credits: 3200, agents: 3 },
]

export default function Dashboard() {
  const [userRole, setUserRole] = useState('user')
  const [platformStats, setPlatformStats] = useState(null)
  const [systemHealth, setSystemHealth] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [roiManualCost, setRoiManualCost] = useState('')
  const [roiTaskCount, setRoiTaskCount] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    setLoading(true)
    setError(null)
    try {
      const [statsRes, healthRes] = await Promise.allSettled([
        fetch('/api/v1/platform/stats'),
        fetch('/api/v1/platform/health'),
      ])

      if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
        const data = await statsRes.value.json()
        setPlatformStats(data)
      } else {
        setPlatformStats(demoPlatformStats)
      }

      if (healthRes.status === 'fulfilled' && healthRes.value.ok) {
        const data = await healthRes.value.json()
        setSystemHealth(data)
      } else {
        setSystemHealth(demoSystemHealth)
      }
    } catch {
      setError('Failed to load dashboard data. Showing demo data.')
      setPlatformStats(demoPlatformStats)
      setSystemHealth(demoSystemHealth)
    } finally {
      setLoading(false)
    }
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  function trendIcon(trend) {
    if (trend === 'up') return <span className="text-green-600">↑</span>
    if (trend === 'down') return <span className="text-red-600">↓</span>
    return <span className="text-gray-400">→</span>
  }

  function healthColor(key, value) {
    if (key === 'api_response_ms') return value < 100 ? 'text-green-600' : value < 300 ? 'text-yellow-600' : 'text-red-600'
    if (key === 'db_query_ms') return value < 50 ? 'text-green-600' : value < 150 ? 'text-yellow-600' : 'text-red-600'
    if (key === 'redis_latency_ms') return value < 10 ? 'text-green-600' : value < 30 ? 'text-yellow-600' : 'text-red-600'
    if (key === 'queue_depth') return value < 50 ? 'text-green-600' : value < 100 ? 'text-yellow-600' : 'text-red-600'
    return 'text-gray-600'
  }

  function healthBgColor(key, value) {
    if (key === 'api_response_ms') return value < 100 ? 'bg-green-50 border-green-200' : value < 300 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
    if (key === 'db_query_ms') return value < 50 ? 'bg-green-50 border-green-200' : value < 150 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
    if (key === 'redis_latency_ms') return value < 10 ? 'bg-green-50 border-green-200' : value < 30 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
    if (key === 'queue_depth') return value < 50 ? 'bg-green-50 border-green-200' : value < 100 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
    return 'bg-gray-50 border-gray-200'
  }

  function healthLabel(key) {
    const labels = { api_response_ms: 'API Response', db_query_ms: 'DB Query', redis_latency_ms: 'Redis Latency', queue_depth: 'Queue Depth' }
    return labels[key] || key
  }

  function healthUnit(key) {
    return key === 'queue_depth' ? ' jobs' : ' ms'
  }

  function handleExportCSV() {
    const rows = [['Name', 'Type', 'Cost (credits)'], ...demoCostBreakdown.map((r) => [r.name, r.type, r.cost])]
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cost-breakdown.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const isPro = userRole === 'pro' || userRole === 'enterprise' || userRole === 'superadmin'
  const isEnterprise = userRole === 'enterprise' || userRole === 'superadmin'
  const isSuperadmin = userRole === 'superadmin'

  const roiSavings = roiManualCost && roiTaskCount
    ? (parseFloat(roiManualCost) * parseInt(roiTaskCount, 10)) - (parseInt(roiTaskCount, 10) * 0.5)
    : null

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="animate-spin inline-block w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full mb-4" />
        <p className="text-gray-500">Loading platform dashboard...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Platform Intelligence Dashboard</h1>
          <p className="text-gray-500">Monitor performance, track activity, and manage platform insights</p>
        </div>
        <div className="mt-4 md:mt-0">
          <label className="text-sm font-medium text-gray-700 mr-2">View as:</label>
          <select
            value={userRole}
            onChange={(e) => setUserRole(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="user">User</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
            <option value="superadmin">Superadmin</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Superadmin: Platform Intelligence Banner */}
      {isSuperadmin && (
        <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 rounded-2xl p-8 text-white mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-primary-200 text-sm font-medium mb-1">Superadmin</p>
              <p className="text-3xl font-bold">Platform Intelligence</p>
              <p className="text-primary-200 text-sm mt-1">Real-time overview of all platform metrics and health</p>
            </div>
            <div className="mt-4 md:mt-0">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                All systems operational
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Superadmin: Real-time Counter Cards */}
      {isSuperadmin && platformStats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Total Agents', value: platformStats.total_agents },
            { label: 'Active Executions', value: Math.floor(platformStats.total_executions_today * 0.03) },
            { label: 'Executions Today', value: platformStats.total_executions_today },
            { label: 'Total Users', value: platformStats.total_users },
            { label: 'Credits in Circulation', value: platformStats.credits_in_circulation },
            { label: 'Federation Nodes', value: platformStats.active_federation_nodes },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
              </div>
              <p className="text-xl font-bold text-gray-900">{stat.value?.toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      {/* Personal Stats (all roles) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Total Executions</p>
          <p className="text-2xl font-bold text-gray-900">{demoPersonalStats.total_executions.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Credits Earned</p>
          <p className="text-2xl font-bold text-gray-900">{demoPersonalStats.credits_earned.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Agents Published</p>
          <p className="text-2xl font-bold text-gray-900">{demoPersonalStats.agents_published}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Avg Rating</p>
          <p className="text-2xl font-bold text-gray-900">{demoPersonalStats.avg_rating} ★</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Agent Performance */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Agent Performance</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {demoAgentPerformance.map((agent) => (
              <div key={agent.name} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-900">{agent.name}</p>
                  <p className="text-xs text-gray-500">{agent.executions_this_week.toLocaleString()} executions this week</p>
                </div>
                <span className="text-lg">{trendIcon(agent.trend)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Agents */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Top Performing Agents</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {demoTopAgents.map((agent, i) => (
              <div key={agent.name} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50">
                <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-500'
                }`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{agent.name}</p>
                  <p className="text-xs text-gray-500">{agent.executions.toLocaleString()} runs · ★ {agent.rating}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Platform Stats (read-only, all roles) */}
      {platformStats && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Platform Stats</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <div className="px-6 py-5 text-center">
              <p className="text-sm text-gray-500 mb-1">Total Agents</p>
              <p className="text-2xl font-bold text-gray-900">{platformStats.total_agents?.toLocaleString()}</p>
            </div>
            <div className="px-6 py-5 text-center">
              <p className="text-sm text-gray-500 mb-1">Executions Today</p>
              <p className="text-2xl font-bold text-gray-900">{platformStats.total_executions_today?.toLocaleString()}</p>
            </div>
            <div className="px-6 py-5 text-center">
              <p className="text-sm text-gray-500 mb-1">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{platformStats.total_users?.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity (all roles) */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {demoRecentActivity.map((activity, i) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
              <div>
                <p className="text-sm text-gray-900">{activity.action}</p>
                <p className="text-xs text-gray-500">{activity.target}</p>
              </div>
              <p className="text-xs text-gray-400 whitespace-nowrap ml-4">{formatDate(activity.timestamp)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pro: API Usage */}
      {isPro && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">API Usage</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-700">Requests this month</p>
              <p className="text-sm font-medium text-gray-900">8,420 / 10,000</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div className="bg-primary-600 h-3 rounded-full" style={{ width: '84.2%' }} />
            </div>
            <p className="text-xs text-gray-500">Rate limit: 100 requests/min · 84.2% of monthly quota used</p>
          </div>
        </div>
      )}

      {/* Pro: Cost Breakdown */}
      {isPro && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Cost Breakdown</h2>
            <button
              onClick={handleExportCSV}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition"
            >
              Export CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-6 py-3 text-gray-500 font-medium">Name</th>
                  <th className="px-6 py-3 text-gray-500 font-medium">Type</th>
                  <th className="px-6 py-3 text-gray-500 font-medium text-right">Cost (credits)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {demoCostBreakdown.map((row) => (
                  <tr key={row.name} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-900 font-medium">{row.name}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        row.type === 'agent' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {row.type}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right font-medium text-gray-900">{row.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Enterprise: Team Dashboard */}
      {isEnterprise && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Team Dashboard</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500 mb-1">Team Members</p>
              <p className="text-2xl font-bold text-gray-900">{demoTeamStats.team_members}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500 mb-1">Team Executions</p>
              <p className="text-2xl font-bold text-gray-900">{demoTeamStats.total_executions.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500 mb-1">Team Credits</p>
              <p className="text-2xl font-bold text-gray-900">{demoTeamStats.total_credits.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500 mb-1">Team Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900">{demoTeamStats.avg_rating} ★</p>
            </div>
          </div>

          {/* Team Performance Comparison */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Team Performance Comparison</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-6 py-3 text-gray-500 font-medium">Member</th>
                    <th className="px-6 py-3 text-gray-500 font-medium text-right">Executions</th>
                    <th className="px-6 py-3 text-gray-500 font-medium text-right">Credits</th>
                    <th className="px-6 py-3 text-gray-500 font-medium text-right">Agents</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {demoTeamMembers.map((member) => (
                    <tr key={member.name} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-gray-900 font-medium">{member.name}</td>
                      <td className="px-6 py-3 text-right text-gray-700">{member.executions.toLocaleString()}</td>
                      <td className="px-6 py-3 text-right text-gray-700">{member.credits.toLocaleString()}</td>
                      <td className="px-6 py-3 text-right text-gray-700">{member.agents}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ROI Calculator */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">ROI Calculator</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Manual Cost per Task ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={roiManualCost}
                    onChange={(e) => setRoiManualCost(e.target.value)}
                    placeholder="e.g. 15.00"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tasks per Month</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={roiTaskCount}
                    onChange={(e) => setRoiTaskCount(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              {roiSavings !== null && (
                <div className={`rounded-lg p-4 ${roiSavings > 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <p className="text-sm text-gray-700">
                    Manual cost: <span className="font-semibold">${(parseFloat(roiManualCost) * parseInt(roiTaskCount, 10)).toLocaleString()}</span> /month
                  </p>
                  <p className="text-sm text-gray-700">
                    Platform cost: <span className="font-semibold">${(parseInt(roiTaskCount, 10) * 0.5).toLocaleString()}</span> /month (est. $0.50/task)
                  </p>
                  <p className={`text-lg font-bold mt-2 ${roiSavings > 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {roiSavings > 0 ? `Estimated savings: $${roiSavings.toLocaleString()}/month` : `Additional cost: $${Math.abs(roiSavings).toLocaleString()}/month`}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Superadmin: Model Usage Breakdown */}
      {isSuperadmin && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Model Usage Breakdown</h2>
          </div>
          <div className="p-6 space-y-4">
            {demoModelUsage.map((model) => (
              <div key={model.model_name}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900">{model.model_name}</p>
                  <p className="text-sm text-gray-500">{model.calls_count.toLocaleString()} calls ({model.percentage}%)</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-primary-600 h-3 rounded-full transition-all"
                    style={{ width: `${model.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Superadmin: Top 10 Agents & Top 10 Users */}
      {isSuperadmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Top 10 Agents by Executions</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-6 py-3 text-gray-500 font-medium">#</th>
                    <th className="px-6 py-3 text-gray-500 font-medium">Agent</th>
                    <th className="px-6 py-3 text-gray-500 font-medium text-right">Executions</th>
                    <th className="px-6 py-3 text-gray-500 font-medium text-right">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {demoTopAgents.map((agent, i) => (
                    <tr key={agent.name} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-gray-500">{i + 1}</td>
                      <td className="px-6 py-3 text-gray-900 font-medium">{agent.name}</td>
                      <td className="px-6 py-3 text-right text-gray-700">{agent.executions.toLocaleString()}</td>
                      <td className="px-6 py-3 text-right text-gray-700">★ {agent.rating}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Top 10 Users by Credit Earnings</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-6 py-3 text-gray-500 font-medium">#</th>
                    <th className="px-6 py-3 text-gray-500 font-medium">Username</th>
                    <th className="px-6 py-3 text-gray-500 font-medium text-right">Credits Earned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {demoTopUsersByCredits.map((user, i) => (
                    <tr key={user.username} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-gray-500">{i + 1}</td>
                      <td className="px-6 py-3 text-gray-900 font-medium">{user.username}</td>
                      <td className="px-6 py-3 text-right text-gray-700">{user.credits_earned.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Superadmin: System Health */}
      {isSuperadmin && systemHealth && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">System Health</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(systemHealth).map(([key, value]) => (
              <div key={key} className={`rounded-xl border p-5 ${healthBgColor(key, value)}`}>
                <p className="text-sm text-gray-500 mb-1">{healthLabel(key)}</p>
                <p className={`text-2xl font-bold ${healthColor(key, value)}`}>{value}{healthUnit(key)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Superadmin: Alert Feed */}
      {isSuperadmin && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Alert Feed</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {demoAlertFeed.map((alert, i) => (
              <div key={i} className="px-6 py-4 flex items-start gap-3 hover:bg-gray-50">
                <span className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  alert.type === 'error' ? 'bg-red-100 text-red-600'
                    : alert.type === 'warning' ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  {alert.type === 'error' ? '!' : alert.type === 'warning' ? '⚠' : 'i'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{alert.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(alert.timestamp)}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  alert.type === 'error' ? 'bg-red-100 text-red-800'
                    : alert.type === 'warning' ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {alert.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
