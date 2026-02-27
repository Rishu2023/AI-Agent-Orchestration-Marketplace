import React, { useState, useEffect } from 'react'

const demoPlans = {
  free: { name: 'Free', price: 0, limits: { executions: 100, agents: 5, fine_tuning: false, enterprise_api: false } },
  pro: { name: 'Pro', price: 29, limits: { executions: 5000, agents: 50, fine_tuning: true, enterprise_api: false } },
  enterprise: { name: 'Enterprise', price: null, limits: { executions: null, agents: null, fine_tuning: true, enterprise_api: true } },
}

const demoTransactions = [
  { id: 'bt1', type: 'charge', amount: 29.00, description: 'Pro plan — monthly subscription', date: '2024-01-15T00:00:00Z', status: 'completed' },
  { id: 'bt2', type: 'credit', amount: 10.00, description: 'Referral bonus credited', date: '2024-01-12T14:30:00Z', status: 'completed' },
  { id: 'bt3', type: 'charge', amount: 4.50, description: 'Overage — 450 extra executions', date: '2024-01-10T09:00:00Z', status: 'completed' },
  { id: 'bt4', type: 'refund', amount: 29.00, description: 'Refund — billing error', date: '2024-01-05T16:20:00Z', status: 'completed' },
  { id: 'bt5', type: 'charge', amount: 29.00, description: 'Pro plan — monthly subscription', date: '2023-12-15T00:00:00Z', status: 'completed' },
  { id: 'bt6', type: 'charge', amount: 29.00, description: 'Pro plan — monthly subscription', date: '2023-11-15T00:00:00Z', status: 'failed' },
]

const demoUsage = { executions_used: 67, executions_limit: 100, agents_published: 3, agents_limit: 5, api_calls: 0, storage_mb: 12 }

const demoTeamMembers = [
  { id: 'tm1', name: 'Alice Chen', email: 'alice@corp.com', role: 'admin', executions: 240, agents: 8 },
  { id: 'tm2', name: 'Bob Martinez', email: 'bob@corp.com', role: 'member', executions: 185, agents: 5 },
  { id: 'tm3', name: 'Carol Nguyen', email: 'carol@corp.com', role: 'member', executions: 312, agents: 12 },
]

const demoRevenueStats = { today: 1250, month: 38400, year: 425000 }

const demoWebhookEvents = [
  { id: 'wh1', type: 'invoice.payment_succeeded', customer: 'cus_abc123', amount: 29.00, created: '2024-01-15T10:00:00Z' },
  { id: 'wh2', type: 'customer.subscription.updated', customer: 'cus_def456', amount: null, created: '2024-01-15T09:30:00Z' },
  { id: 'wh3', type: 'invoice.payment_failed', customer: 'cus_ghi789', amount: 29.00, created: '2024-01-14T22:00:00Z' },
  { id: 'wh4', type: 'charge.refunded', customer: 'cus_jkl012', amount: 15.00, created: '2024-01-14T18:45:00Z' },
]

const demoAdminUsers = [
  { id: 'au1', email: 'user42@example.com', name: 'Jordan Lee', tier: 'pro', mrr: 29, status: 'active' },
  { id: 'au2', email: 'user88@example.com', name: 'Sam Patel', tier: 'free', mrr: 0, status: 'active' },
  { id: 'au3', email: 'user23@example.com', name: 'Alex Kim', tier: 'enterprise', mrr: 299, status: 'active' },
  { id: 'au4', email: 'user55@example.com', name: 'Morgan Davis', tier: 'pro', mrr: 29, status: 'past_due' },
]

const demoFailedPayments = [
  { id: 'fp1', user: 'Morgan Davis', email: 'user55@example.com', amount: 29.00, date: '2024-01-14T08:00:00Z', reason: 'Card declined' },
  { id: 'fp2', user: 'Casey Brown', email: 'user77@example.com', amount: 29.00, date: '2024-01-13T12:00:00Z', reason: 'Insufficient funds' },
]

export default function BillingPage() {
  const [userRole, setUserRole] = useState('free')
  const [plans, setPlans] = useState(demoPlans)
  const [subscription, setSubscription] = useState(null)
  const [usage, setUsage] = useState(demoUsage)
  const [transactions, setTransactions] = useState(demoTransactions)
  const [teamMembers, setTeamMembers] = useState(demoTeamMembers)
  const [revenueStats, setRevenueStats] = useState(demoRevenueStats)
  const [creditBalance, setCreditBalance] = useState(42)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [txFilter, setTxFilter] = useState('all')
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelConfirm, setCancelConfirm] = useState('')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [refundUser, setRefundUser] = useState('')
  const [refundAmount, setRefundAmount] = useState('')
  const [refundReason, setRefundReason] = useState('')
  const [adminSearch, setAdminSearch] = useState('')
  const [adminUsers, setAdminUsers] = useState(demoAdminUsers)
  const [webhookEvents] = useState(demoWebhookEvents)
  const [failedPayments, setFailedPayments] = useState(demoFailedPayments)

  useEffect(() => {
    fetchBillingData()
  }, [])

  async function fetchBillingData() {
    setLoading(true)
    setError(null)
    try {
      const [plansRes, subRes, usageRes] = await Promise.allSettled([
        fetch('/api/v1/billing/plans'),
        fetch('/api/v1/billing/subscription/me'),
        fetch('/api/v1/billing/usage/me'),
      ])

      if (plansRes.status === 'fulfilled' && plansRes.value.ok) {
        const data = await plansRes.value.json()
        setPlans(data.plans ?? data ?? demoPlans)
      } else {
        setPlans(demoPlans)
      }

      if (subRes.status === 'fulfilled' && subRes.value.ok) {
        const data = await subRes.value.json()
        setSubscription(data)
      } else {
        setSubscription({ plan: 'free', renewal_date: '2024-02-15', status: 'active' })
      }

      if (usageRes.status === 'fulfilled' && usageRes.value.ok) {
        const data = await usageRes.value.json()
        setUsage(data)
      } else {
        setUsage(demoUsage)
      }
    } catch {
      setError('Failed to load billing data. Showing demo data.')
      setPlans(demoPlans)
      setSubscription({ plan: 'free', renewal_date: '2024-02-15', status: 'active' })
      setUsage(demoUsage)
    } finally {
      setLoading(false)
    }
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  function handleCancelSubscription() {
    if (cancelConfirm !== 'CANCEL') return
    setSubscription((prev) => ({ ...prev, plan: 'free', status: 'cancelled' }))
    setUserRole('free')
    setCancelConfirm('')
    setShowCancelModal(false)
  }

  function handleInviteMember(e) {
    e.preventDefault()
    if (!inviteEmail) return
    setTeamMembers((prev) => [
      ...prev,
      { id: `tm-${Date.now()}`, name: inviteEmail.split('@')[0], email: inviteEmail, role: inviteRole, executions: 0, agents: 0 },
    ])
    setInviteEmail('')
    setInviteRole('member')
    setShowInviteModal(false)
  }

  function handleRemoveMember(id) {
    setTeamMembers((prev) => prev.filter((m) => m.id !== id))
  }

  function handleIssueRefund(e) {
    e.preventDefault()
    const amount = parseFloat(refundAmount)
    if (!refundUser || !amount || amount <= 0) return
    setTransactions((prev) => [
      { id: `bt-${Date.now()}`, type: 'refund', amount, description: `Refund to ${refundUser} — ${refundReason || 'Admin refund'}`, date: new Date().toISOString(), status: 'completed' },
      ...prev,
    ])
    setRefundUser('')
    setRefundAmount('')
    setRefundReason('')
    setShowRefundModal(false)
  }

  function handleRetryPayment(id) {
    setFailedPayments((prev) => prev.filter((p) => p.id !== id))
  }

  function handleTierChange(userId, newTier) {
    setAdminUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, tier: newTier } : u)))
  }

  const currentPlan = plans[userRole] || plans.free
  const filteredTx = txFilter === 'all' ? transactions : transactions.filter((t) => t.type === txFilter)
  const filteredAdminUsers = adminSearch
    ? adminUsers.filter((u) => u.email.includes(adminSearch) || u.name.toLowerCase().includes(adminSearch.toLowerCase()))
    : adminUsers

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="animate-spin inline-block w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full mb-4" />
        <p className="text-gray-500">Loading billing data...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing</h1>
          <p className="text-gray-500">Manage your subscription, usage, and payments</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <label className="text-sm text-gray-500 mr-2">Demo role:</label>
          <select
            value={userRole}
            onChange={(e) => setUserRole(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="free">Free</option>
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

      {/* Current Plan Hero */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 rounded-2xl p-8 text-white mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-primary-200 text-sm font-medium mb-1">Current Plan</p>
            <p className="text-4xl font-bold">{currentPlan.name}</p>
            <p className="text-primary-200 text-sm mt-1">
              {currentPlan.price === null ? 'Custom pricing' : currentPlan.price === 0 ? 'No charge' : `$${currentPlan.price}/month`}
            </p>
            {(userRole === 'pro' || userRole === 'enterprise') && subscription && (
              <p className="text-primary-200 text-xs mt-2">Renews {new Date(subscription.renewal_date).toLocaleDateString()}</p>
            )}
          </div>
          <div className="flex gap-3 mt-6 md:mt-0">
            {userRole === 'free' && (
              <>
                <button className="bg-white text-primary-700 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition">
                  Upgrade to Pro — $29/mo
                </button>
                <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition">
                  Contact for Enterprise
                </button>
              </>
            )}
            {userRole === 'pro' && (
              <>
                <button className="bg-white text-primary-700 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition">
                  Upgrade to Enterprise
                </button>
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
                >
                  Cancel Subscription
                </button>
              </>
            )}
            {userRole === 'enterprise' && (
              <button className="bg-white text-primary-700 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition">
                💬 Dedicated Support Chat
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Plan Limits + Usage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Limits */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Plan Limits</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Executions / month</span><span className="font-medium text-gray-900">{currentPlan.limits.executions ?? 'Unlimited'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Agents</span><span className="font-medium text-gray-900">{currentPlan.limits.agents ?? 'Unlimited'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Fine-tuning</span><span className={`font-medium ${currentPlan.limits.fine_tuning ? 'text-green-600' : 'text-gray-400'}`}>{currentPlan.limits.fine_tuning ? 'Included' : 'Not available'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Enterprise API</span><span className={`font-medium ${currentPlan.limits.enterprise_api ? 'text-green-600' : 'text-gray-400'}`}>{currentPlan.limits.enterprise_api ? 'Included' : 'Not available'}</span></div>
          </div>
        </div>

        {/* Usage */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Usage</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Executions</span>
                <span className="font-medium text-gray-900">{usage.executions_used} / {currentPlan.limits.executions ?? '∞'}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${usage.executions_used / (currentPlan.limits.executions || Infinity) > 0.9 ? 'bg-red-500' : 'bg-primary-600'}`}
                  style={{ width: `${Math.min(100, (usage.executions_used / (currentPlan.limits.executions || 1)) * 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Agents Published</span>
                <span className="font-medium text-gray-900">{usage.agents_published} / {currentPlan.limits.agents ?? '∞'}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full bg-primary-600"
                  style={{ width: `${Math.min(100, (usage.agents_published / (currentPlan.limits.agents || 1)) * 100)}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">API Calls</span>
              <span className="font-medium text-gray-900">{usage.api_calls}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Storage</span>
              <span className="font-medium text-gray-900">{usage.storage_mb} MB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Credit Balance */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Credit Balance</p>
          <p className="text-2xl font-bold text-gray-900">${creditBalance.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Executions Used</p>
          <p className="text-2xl font-bold text-gray-900">{usage.executions_used}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Agents Published</p>
          <p className="text-2xl font-bold text-gray-900">{usage.agents_published}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Storage Used</p>
          <p className="text-2xl font-bold text-gray-900">{usage.storage_mb} MB</p>
        </div>
      </div>

      {/* Enterprise: Custom API Rate Limit */}
      {userRole === 'enterprise' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Enterprise Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="flex justify-between sm:flex-col"><span className="text-gray-500">API Rate Limit</span><span className="font-medium text-gray-900">10,000 req/min</span></div>
            <div className="flex justify-between sm:flex-col"><span className="text-gray-500">Contract Period</span><span className="font-medium text-gray-900">Annual (Jan 2024 — Dec 2024)</span></div>
            <div className="flex justify-between sm:flex-col"><span className="text-gray-500">Dedicated Support</span><span className="font-medium text-green-600">Active — 24/7</span></div>
          </div>
        </div>
      )}

      {/* Enterprise: Team Members */}
      {(userRole === 'enterprise' || userRole === 'superadmin') && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
            <button onClick={() => setShowInviteModal(true)} className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition">
              + Invite Member
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-6 py-3 text-gray-500 font-medium">Name</th>
                  <th className="px-6 py-3 text-gray-500 font-medium">Email</th>
                  <th className="px-6 py-3 text-gray-500 font-medium">Role</th>
                  <th className="px-6 py-3 text-gray-500 font-medium text-right">Executions</th>
                  <th className="px-6 py-3 text-gray-500 font-medium text-right">Agents</th>
                  <th className="px-6 py-3 text-gray-500 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {teamMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-900 font-medium">{m.name}</td>
                    <td className="px-6 py-3 text-gray-500">{m.email}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${m.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'}`}>
                        {m.role}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right text-gray-700">{m.executions}</td>
                    <td className="px-6 py-3 text-right text-gray-700">{m.agents}</td>
                    <td className="px-6 py-3 text-right">
                      <button onClick={() => handleRemoveMember(m.id)} className="text-red-600 hover:text-red-800 text-xs font-medium">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 text-sm text-gray-500">
            Aggregated: {teamMembers.reduce((s, m) => s + m.executions, 0)} executions · {teamMembers.reduce((s, m) => s + m.agents, 0)} agents across {teamMembers.length} members
          </div>
        </div>
      )}

      {/* Superadmin: Revenue Cards */}
      {userRole === 'superadmin' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl p-6 text-white">
              <p className="text-green-100 text-sm font-medium mb-1">Revenue Today</p>
              <p className="text-3xl font-bold">${revenueStats.today.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-6 text-white">
              <p className="text-blue-100 text-sm font-medium mb-1">Revenue This Month</p>
              <p className="text-3xl font-bold">${revenueStats.month.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-6 text-white">
              <p className="text-purple-100 text-sm font-medium mb-1">Revenue This Year</p>
              <p className="text-3xl font-bold">${revenueStats.year.toLocaleString()}</p>
            </div>
          </div>

          {/* Webhook Event Log */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Stripe Webhook Events</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-6 py-3 text-gray-500 font-medium">Event</th>
                    <th className="px-6 py-3 text-gray-500 font-medium">Customer</th>
                    <th className="px-6 py-3 text-gray-500 font-medium text-right">Amount</th>
                    <th className="px-6 py-3 text-gray-500 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {webhookEvents.map((ev) => (
                    <tr key={ev.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          ev.type.includes('failed') ? 'bg-red-100 text-red-800'
                            : ev.type.includes('refund') ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>{ev.type}</span>
                      </td>
                      <td className="px-6 py-3 text-gray-700 font-mono text-xs">{ev.customer}</td>
                      <td className="px-6 py-3 text-right text-gray-700">{ev.amount != null ? `$${ev.amount.toFixed(2)}` : '—'}</td>
                      <td className="px-6 py-3 text-gray-500">{formatDate(ev.created)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Subscription Management */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-lg font-semibold text-gray-900">User Subscriptions</h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  placeholder="Search users..."
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button onClick={() => setShowRefundModal(true)} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition">
                  Issue Refund
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-6 py-3 text-gray-500 font-medium">Name</th>
                    <th className="px-6 py-3 text-gray-500 font-medium">Email</th>
                    <th className="px-6 py-3 text-gray-500 font-medium">Tier</th>
                    <th className="px-6 py-3 text-gray-500 font-medium text-right">MRR</th>
                    <th className="px-6 py-3 text-gray-500 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAdminUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-gray-900 font-medium">{u.name}</td>
                      <td className="px-6 py-3 text-gray-500">{u.email}</td>
                      <td className="px-6 py-3">
                        <select
                          value={u.tier}
                          onChange={(e) => handleTierChange(u.id, e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="free">Free</option>
                          <option value="pro">Pro</option>
                          <option value="enterprise">Enterprise</option>
                        </select>
                      </td>
                      <td className="px-6 py-3 text-right text-gray-700">${u.mrr}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {u.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Failed Payments */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Failed Payments</h2>
            </div>
            {failedPayments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left">
                    <tr>
                      <th className="px-6 py-3 text-gray-500 font-medium">User</th>
                      <th className="px-6 py-3 text-gray-500 font-medium">Email</th>
                      <th className="px-6 py-3 text-gray-500 font-medium text-right">Amount</th>
                      <th className="px-6 py-3 text-gray-500 font-medium">Reason</th>
                      <th className="px-6 py-3 text-gray-500 font-medium">Date</th>
                      <th className="px-6 py-3 text-gray-500 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {failedPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-gray-900 font-medium">{p.user}</td>
                        <td className="px-6 py-3 text-gray-500">{p.email}</td>
                        <td className="px-6 py-3 text-right text-gray-700">${p.amount.toFixed(2)}</td>
                        <td className="px-6 py-3 text-red-600">{p.reason}</td>
                        <td className="px-6 py-3 text-gray-500">{formatDate(p.date)}</td>
                        <td className="px-6 py-3 text-right">
                          <button onClick={() => handleRetryPayment(p.id)} className="bg-primary-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-primary-700 transition">
                            Retry
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">✅</div>
                <p className="text-gray-500">No failed payments</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Transaction History */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
          {(userRole === 'pro' || userRole === 'enterprise' || userRole === 'superadmin') && (
            <select
              value={txFilter}
              onChange={(e) => setTxFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All</option>
              <option value="charge">Charges</option>
              <option value="credit">Credits</option>
              <option value="refund">Refunds</option>
            </select>
          )}
        </div>
        {filteredTx.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-6 py-3 text-gray-500 font-medium">Type</th>
                  <th className="px-6 py-3 text-gray-500 font-medium">Description</th>
                  <th className="px-6 py-3 text-gray-500 font-medium text-right">Amount</th>
                  <th className="px-6 py-3 text-gray-500 font-medium">Date</th>
                  <th className="px-6 py-3 text-gray-500 font-medium">Status</th>
                  {(userRole === 'pro' || userRole === 'enterprise' || userRole === 'superadmin') && (
                    <th className="px-6 py-3 text-gray-500 font-medium"></th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTx.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tx.type === 'charge' ? 'bg-red-100 text-red-800'
                          : tx.type === 'credit' ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {tx.type === 'charge' ? '↓ Charge' : tx.type === 'credit' ? '↑ Credit' : '↩ Refund'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-700">{tx.description}</td>
                    <td className={`px-6 py-3 text-right font-medium ${tx.type === 'charge' ? 'text-red-600' : 'text-green-600'}`}>
                      {tx.type === 'charge' ? '-' : '+'}${tx.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-3 text-gray-500">{formatDate(tx.date)}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tx.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {tx.status}
                      </span>
                    </td>
                    {(userRole === 'pro' || userRole === 'enterprise' || userRole === 'superadmin') && (
                      <td className="px-6 py-3 text-right">
                        {tx.type === 'charge' && tx.status === 'completed' && (
                          <button className="text-primary-600 hover:text-primary-800 text-xs font-medium">PDF</button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">💳</div>
            <p className="text-gray-500">No transactions found</p>
          </div>
        )}
      </div>

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Cancel Subscription</h3>
              <button onClick={() => { setShowCancelModal(false); setCancelConfirm('') }} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              This will downgrade your account to the Free plan at the end of the current billing period. Type <span className="font-bold">CANCEL</span> to confirm.
            </p>
            <input
              type="text"
              value={cancelConfirm}
              onChange={(e) => setCancelConfirm(e.target.value)}
              placeholder='Type "CANCEL" to confirm'
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
            />
            <div className="flex gap-3">
              <button type="button" onClick={() => { setShowCancelModal(false); setCancelConfirm('') }} className="flex-1 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                Keep Subscription
              </button>
              <button
                type="button"
                onClick={handleCancelSubscription}
                disabled={cancelConfirm !== 'CANCEL'}
                className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Team Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Invite Team Member</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleInviteMember}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
                required
              />
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowInviteModal(false)} className="flex-1 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition">
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Issue Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Issue Refund</h3>
              <button onClick={() => setShowRefundModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleIssueRefund}>
              <label className="block text-sm font-medium text-gray-700 mb-2">User Email</label>
              <input
                type="text"
                value={refundUser}
                onChange={(e) => setRefundUser(e.target.value)}
                placeholder="user@example.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
                required
              />
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount ($)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="0.00"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
                required
              />
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
              <input
                type="text"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Reason for refund"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowRefundModal(false)} className="flex-1 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 transition">
                  Issue Refund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
