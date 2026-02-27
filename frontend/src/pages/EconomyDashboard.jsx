import React, { useState, useEffect } from 'react'

const demoTransactions = [
  { id: 't1', type: 'earned', amount: 50, description: 'Agent "Research Assistant Pro" usage fee', from_user: 'user_42', created_at: '2024-01-15T10:30:00Z' },
  { id: 't2', type: 'spent', amount: 12, description: 'Ran workflow "Content Pipeline"', from_user: null, created_at: '2024-01-15T09:15:00Z' },
  { id: 't3', type: 'earned', amount: 25, description: 'Agent "CodeCraft" usage fee', from_user: 'user_88', created_at: '2024-01-14T16:45:00Z' },
  { id: 't4', type: 'deposit', amount: 500, description: 'Credit purchase', from_user: null, created_at: '2024-01-14T12:00:00Z' },
  { id: 't5', type: 'spent', amount: 8, description: 'Ran agent "Data Analyzer"', from_user: null, created_at: '2024-01-13T14:20:00Z' },
  { id: 't6', type: 'earned', amount: 75, description: 'Agent "Marketing Strategist" subscription', from_user: 'user_23', created_at: '2024-01-13T08:00:00Z' },
  { id: 't7', type: 'spent', amount: 3, description: 'Ran agent "Sales Outreach Bot"', from_user: null, created_at: '2024-01-12T17:30:00Z' },
  { id: 't8', type: 'earned', amount: 100, description: 'Agent "Customer Support AI" monthly fee', from_user: 'user_55', created_at: '2024-01-12T00:00:00Z' },
]

const demoTopAgents = [
  { id: '1', name: 'Customer Support AI', total_earned: 12450, creator: 'TechCorp', runs: 89000 },
  { id: '2', name: 'CodeCraft', total_earned: 9870, creator: 'DevTools Inc', runs: 52100 },
  { id: '3', name: 'Marketing Strategist', total_earned: 7650, creator: 'GrowthAI', runs: 8900 },
  { id: '4', name: 'Research Assistant Pro', total_earned: 5230, creator: 'AcademiaAI', runs: 15420 },
  { id: '5', name: 'Content Writer AI', total_earned: 4100, creator: 'WriteBot', runs: 28900 },
]

const demoTopContributors = [
  { id: 'u1', username: 'TechCorp', agents_published: 12, total_earned: 24500, avatar: '🏢' },
  { id: 'u2', username: 'DevTools Inc', agents_published: 8, total_earned: 18300, avatar: '💻' },
  { id: 'u3', username: 'GrowthAI', agents_published: 6, total_earned: 12800, avatar: '🚀' },
  { id: 'u4', username: 'AcademiaAI', agents_published: 5, total_earned: 9200, avatar: '🎓' },
  { id: 'u5', username: 'WriteBot', agents_published: 4, total_earned: 7600, avatar: '✍️' },
]

export default function EconomyDashboard() {
  const [balance, setBalance] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [topAgents, setTopAgents] = useState([])
  const [topContributors, setTopContributors] = useState([])
  const [economyStats, setEconomyStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSpendModal, setShowSpendModal] = useState(false)
  const [addAmount, setAddAmount] = useState('')
  const [spendAmount, setSpendAmount] = useState('')
  const [spendDescription, setSpendDescription] = useState('')

  useEffect(() => {
    fetchEconomyData()
  }, [])

  async function fetchEconomyData() {
    setLoading(true)
    setError(null)
    try {
      const [balanceRes, txRes, agentsRes, contribRes, statsRes] = await Promise.allSettled([
        fetch('/api/v1/economy/balance'),
        fetch('/api/v1/economy/transactions'),
        fetch('/api/v1/economy/top-agents'),
        fetch('/api/v1/economy/top-contributors'),
        fetch('/api/v1/economy/stats'),
      ])

      if (balanceRes.status === 'fulfilled' && balanceRes.value.ok) {
        const data = await balanceRes.value.json()
        setBalance(data.balance ?? data.credits ?? 0)
      } else {
        setBalance(1247)
      }

      if (txRes.status === 'fulfilled' && txRes.value.ok) {
        const data = await txRes.value.json()
        setTransactions(Array.isArray(data) ? data : data.transactions ?? [])
      } else {
        setTransactions(demoTransactions)
      }

      if (agentsRes.status === 'fulfilled' && agentsRes.value.ok) {
        const data = await agentsRes.value.json()
        setTopAgents(Array.isArray(data) ? data : data.agents ?? [])
      } else {
        setTopAgents(demoTopAgents)
      }

      if (contribRes.status === 'fulfilled' && contribRes.value.ok) {
        const data = await contribRes.value.json()
        setTopContributors(Array.isArray(data) ? data : data.contributors ?? [])
      } else {
        setTopContributors(demoTopContributors)
      }

      if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
        const data = await statsRes.value.json()
        setEconomyStats(data)
      } else {
        setEconomyStats({ total_supply: 2500000, velocity: 3.2, total_transactions: 184500, active_wallets: 12800 })
      }
    } catch (err) {
      setError('Failed to load economy data. Showing demo data.')
      setBalance(1247)
      setTransactions(demoTransactions)
      setTopAgents(demoTopAgents)
      setTopContributors(demoTopContributors)
      setEconomyStats({ total_supply: 2500000, velocity: 3.2, total_transactions: 184500, active_wallets: 12800 })
    } finally {
      setLoading(false)
    }
  }

  async function handleAddCredits(e) {
    e.preventDefault()
    const amount = parseFloat(addAmount)
    if (!amount || amount <= 0) return
    try {
      const res = await fetch('/api/v1/economy/credits/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      })
      if (res.ok) {
        setBalance((prev) => prev + amount)
        setTransactions((prev) => [
          { id: `t-${Date.now()}`, type: 'deposit', amount, description: 'Credit purchase', from_user: null, created_at: new Date().toISOString() },
          ...prev,
        ])
      }
    } catch {
      setBalance((prev) => prev + amount)
      setTransactions((prev) => [
        { id: `t-${Date.now()}`, type: 'deposit', amount, description: 'Credit purchase', from_user: null, created_at: new Date().toISOString() },
        ...prev,
      ])
    }
    setAddAmount('')
    setShowAddModal(false)
  }

  async function handleSpendCredits(e) {
    e.preventDefault()
    const amount = parseFloat(spendAmount)
    if (!amount || amount <= 0 || amount > balance) return
    try {
      const res = await fetch('/api/v1/economy/credits/spend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, description: spendDescription }),
      })
      if (res.ok) {
        setBalance((prev) => prev - amount)
        setTransactions((prev) => [
          { id: `t-${Date.now()}`, type: 'spent', amount, description: spendDescription || 'Manual spend', from_user: null, created_at: new Date().toISOString() },
          ...prev,
        ])
      }
    } catch {
      setBalance((prev) => prev - amount)
      setTransactions((prev) => [
        { id: `t-${Date.now()}`, type: 'spent', amount, description: spendDescription || 'Manual spend', from_user: null, created_at: new Date().toISOString() },
        ...prev,
      ])
    }
    setSpendAmount('')
    setSpendDescription('')
    setShowSpendModal(false)
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="animate-spin inline-block w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full mb-4" />
        <p className="text-gray-500">Loading economy dashboard...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Economy Dashboard</h1>
        <p className="text-gray-500">Manage credits, track earnings, and explore the marketplace economy</p>
      </div>

      {error && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 rounded-2xl p-8 text-white mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-primary-200 text-sm font-medium mb-1">Your Credit Balance</p>
            <p className="text-5xl font-bold">{balance != null ? balance.toLocaleString() : '—'}</p>
            <p className="text-primary-200 text-sm mt-1">credits available</p>
          </div>
          <div className="flex gap-3 mt-6 md:mt-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-white text-primary-700 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition"
            >
              + Add Credits
            </button>
            <button
              onClick={() => setShowSpendModal(true)}
              className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
            >
              Spend Credits
            </button>
          </div>
        </div>
      </div>

      {/* Economy Stats */}
      {economyStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Total Supply</p>
            <p className="text-2xl font-bold text-gray-900">{economyStats.total_supply?.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Velocity</p>
            <p className="text-2xl font-bold text-gray-900">{economyStats.velocity}x</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Total Transactions</p>
            <p className="text-2xl font-bold text-gray-900">{economyStats.total_transactions?.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Active Wallets</p>
            <p className="text-2xl font-bold text-gray-900">{economyStats.active_wallets?.toLocaleString()}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Transaction History */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
          </div>
          {transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-6 py-3 text-gray-500 font-medium">Type</th>
                    <th className="px-6 py-3 text-gray-500 font-medium">Description</th>
                    <th className="px-6 py-3 text-gray-500 font-medium text-right">Amount</th>
                    <th className="px-6 py-3 text-gray-500 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          tx.type === 'earned' ? 'bg-green-100 text-green-800'
                            : tx.type === 'deposit' ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {tx.type === 'earned' ? '↑ Earned' : tx.type === 'deposit' ? '+ Deposit' : '↓ Spent'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-700">{tx.description}</td>
                      <td className={`px-6 py-3 text-right font-medium ${
                        tx.type === 'spent' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {tx.type === 'spent' ? '-' : '+'}{tx.amount}
                      </td>
                      <td className="px-6 py-3 text-gray-500">{formatDate(tx.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">💳</div>
              <p className="text-gray-500">No transactions yet</p>
            </div>
          )}
        </div>

        {/* Top Earning Agents */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Top Earning Agents</h2>
          </div>
          {topAgents.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {topAgents.map((agent, i) => (
                <div key={agent.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50">
                  <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-500'
                  }`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{agent.name}</p>
                    <p className="text-xs text-gray-500">by {agent.creator} · {agent.runs?.toLocaleString()} runs</p>
                  </div>
                  <p className="text-sm font-semibold text-green-600">{agent.total_earned?.toLocaleString()} cr</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🏆</div>
              <p className="text-gray-500">No agent data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Top Contributors */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Top Contributors</h2>
        </div>
        {topContributors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
            {topContributors.map((contrib, i) => (
              <div key={contrib.id} className="px-6 py-5 text-center hover:bg-gray-50">
                <div className="text-3xl mb-2">{contrib.avatar}</div>
                <p className="text-sm font-semibold text-gray-900">{contrib.username}</p>
                <p className="text-xs text-gray-500 mt-1">{contrib.agents_published} agents published</p>
                <p className="text-sm font-medium text-primary-600 mt-2">{contrib.total_earned?.toLocaleString()} credits earned</p>
                {i < 3 && (
                  <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                    i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-600' : 'bg-orange-100 text-orange-700'
                  }`}>
                    #{i + 1}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">👥</div>
            <p className="text-gray-500">No contributor data available</p>
          </div>
        )}
      </div>

      {/* Add Credits Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Credits</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleAddCredits}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
              <input
                type="number"
                min="1"
                step="1"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                placeholder="Enter amount of credits"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
                required
              />
              <div className="flex gap-2 mb-4">
                {[100, 500, 1000].map((amt) => (
                  <button key={amt} type="button" onClick={() => setAddAmount(String(amt))} className="flex-1 border border-gray-300 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition">
                    {amt}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition">
                  Add Credits
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Spend Credits Modal */}
      {showSpendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Spend Credits</h3>
              <button onClick={() => setShowSpendModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleSpendCredits}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
              <input
                type="number"
                min="1"
                max={balance}
                step="1"
                value={spendAmount}
                onChange={(e) => setSpendAmount(e.target.value)}
                placeholder="Enter amount to spend"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
                required
              />
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <input
                type="text"
                value={spendDescription}
                onChange={(e) => setSpendDescription(e.target.value)}
                placeholder="What are you spending credits on?"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
              />
              <p className="text-xs text-gray-500 mb-4">Available balance: {balance?.toLocaleString()} credits</p>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowSpendModal(false)} className="flex-1 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 transition">
                  Spend Credits
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
