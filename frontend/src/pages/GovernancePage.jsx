import React, { useState, useEffect } from 'react'

const demoProposals = [
  { id: 'p1', title: 'Increase minimum agent quality score to 85%', description: 'Proposal to raise the minimum quality benchmark score required for agents listed on the marketplace from 70% to 85%, ensuring higher quality standards across the platform.', category: 'benchmark_criteria', proposed_by: 'TechCorp', status: 'active', votes_for: 142, votes_against: 38, voting_deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), veto_reason: null, created_at: '2024-01-15T10:00:00Z', voters: ['user_1', 'user_2', 'user_3', 'user_4', 'user_5'] },
  { id: 'p2', title: 'Feature "Customer Support AI" on homepage', description: 'Nominate the Customer Support AI agent for featured placement on the marketplace homepage based on its consistent high ratings and community usage.', category: 'featured_agents', proposed_by: 'GrowthAI', status: 'active', votes_for: 89, votes_against: 12, voting_deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), veto_reason: null, created_at: '2024-01-14T14:30:00Z', voters: ['user_6', 'user_7', 'user_8'] },
  { id: 'p3', title: 'Reduce platform fee from 15% to 10%', description: 'Lower the platform transaction fee to encourage more agent creators to publish and monetize their work on the marketplace.', category: 'platform_rules', proposed_by: 'DevTools Inc', status: 'passed', votes_for: 312, votes_against: 45, voting_deadline: '2024-01-10T00:00:00Z', veto_reason: null, created_at: '2024-01-03T09:00:00Z', voters: ['user_1', 'user_9', 'user_10', 'user_11'] },
  { id: 'p4', title: 'Add mandatory security audit for enterprise agents', description: 'Require all agents tagged as enterprise-grade to pass an automated security audit before listing approval.', category: 'platform_rules', proposed_by: 'AcademiaAI', status: 'rejected', votes_for: 67, votes_against: 198, voting_deadline: '2024-01-08T00:00:00Z', veto_reason: null, created_at: '2024-01-01T12:00:00Z', voters: ['user_12', 'user_13'] },
  { id: 'p5', title: 'Establish community moderation council', description: 'Create a rotating council of top contributors to help moderate agent listings, resolve disputes, and guide platform policy discussions.', category: 'other', proposed_by: 'WriteBot', status: 'vetoed', votes_for: 201, votes_against: 30, voting_deadline: '2024-01-12T00:00:00Z', veto_reason: 'Conflicts with existing admin moderation structure. Needs revision to clarify council authority boundaries.', created_at: '2024-01-05T16:00:00Z', voters: ['user_14', 'user_15', 'user_16'] },
  { id: 'p6', title: 'Introduce agent versioning and rollback support', description: 'Allow agent creators to publish multiple versions of their agents and enable users to rollback to previous stable versions if needed.', category: 'platform_rules', proposed_by: 'TechCorp', status: 'active', votes_for: 56, votes_against: 4, voting_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), veto_reason: null, created_at: '2024-01-16T08:00:00Z', voters: ['user_17'] },
]

const demoVotingHistory = [
  { proposal_title: 'Increase minimum agent quality score to 85%', vote_type: 'for', weight: 1, created_at: '2024-01-15T11:00:00Z' },
  { proposal_title: 'Reduce platform fee from 15% to 10%', vote_type: 'for', weight: 1, created_at: '2024-01-04T10:00:00Z' },
  { proposal_title: 'Add mandatory security audit for enterprise agents', vote_type: 'against', weight: 1, created_at: '2024-01-02T15:00:00Z' },
  { proposal_title: 'Establish community moderation council', vote_type: 'for', weight: 2, created_at: '2024-01-06T09:00:00Z' },
]

const categoryLabels = {
  platform_rules: 'Platform Rules',
  featured_agents: 'Featured Agents',
  benchmark_criteria: 'Benchmark Criteria',
  other: 'Other',
}

const categoryColors = {
  platform_rules: 'bg-purple-100 text-purple-800',
  featured_agents: 'bg-indigo-100 text-indigo-800',
  benchmark_criteria: 'bg-teal-100 text-teal-800',
  other: 'bg-gray-100 text-gray-700',
}

const statusColors = {
  active: 'bg-blue-100 text-blue-800',
  passed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  vetoed: 'bg-yellow-100 text-yellow-800',
}

export default function GovernancePage() {
  const [proposals, setProposals] = useState([])
  const [votingHistory, setVotingHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userRole, setUserRole] = useState('user')
  const [showProposalModal, setShowProposalModal] = useState(false)
  const [showVetoModal, setShowVetoModal] = useState(false)
  const [vetoTargetId, setVetoTargetId] = useState(null)
  const [vetoReason, setVetoReason] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newCategory, setNewCategory] = useState('platform_rules')
  const [expandedVoters, setExpandedVoters] = useState({})

  useEffect(() => {
    fetchGovernanceData()
  }, [])

  async function fetchGovernanceData() {
    setLoading(true)
    setError(null)
    try {
      const [proposalsRes, historyRes] = await Promise.allSettled([
        fetch('/api/v1/governance/proposals'),
        fetch('/api/v1/governance/voting-history'),
      ])

      if (proposalsRes.status === 'fulfilled' && proposalsRes.value.ok) {
        const data = await proposalsRes.value.json()
        setProposals(Array.isArray(data) ? data : data.proposals ?? [])
      } else {
        setProposals(demoProposals)
      }

      if (historyRes.status === 'fulfilled' && historyRes.value.ok) {
        const data = await historyRes.value.json()
        setVotingHistory(Array.isArray(data) ? data : data.history ?? [])
      } else {
        setVotingHistory(demoVotingHistory)
      }
    } catch {
      setError('Failed to load governance data. Showing demo data.')
      setProposals(demoProposals)
      setVotingHistory(demoVotingHistory)
    } finally {
      setLoading(false)
    }
  }

  function getVotingWeight() {
    if (userRole === 'enterprise') return 3
    if (userRole === 'pro') return 2
    return 1
  }

  async function handleSubmitProposal(e) {
    e.preventDefault()
    if (!newTitle.trim() || !newDescription.trim()) return
    const newProposal = {
      id: `p-${Date.now()}`,
      title: newTitle,
      description: newDescription,
      category: newCategory,
      proposed_by: 'You',
      status: 'active',
      votes_for: 0,
      votes_against: 0,
      voting_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      veto_reason: null,
      created_at: new Date().toISOString(),
      voters: [],
    }
    try {
      const res = await fetch('/api/v1/governance/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, description: newDescription, category: newCategory }),
      })
      if (res.ok) {
        const data = await res.json()
        setProposals((prev) => [data, ...prev])
      } else {
        setProposals((prev) => [newProposal, ...prev])
      }
    } catch {
      setProposals((prev) => [newProposal, ...prev])
    }
    setNewTitle('')
    setNewDescription('')
    setNewCategory('platform_rules')
    setShowProposalModal(false)
  }

  async function handleVote(proposalId, voteType) {
    const weight = getVotingWeight()
    try {
      await fetch(`/api/v1/governance/proposals/${proposalId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote: voteType, weight }),
      })
    } catch {
      // fallback: apply locally
    }
    setProposals((prev) =>
      prev.map((p) =>
        p.id === proposalId
          ? {
              ...p,
              votes_for: voteType === 'for' ? p.votes_for + weight : p.votes_for,
              votes_against: voteType === 'against' ? p.votes_against + weight : p.votes_against,
            }
          : p
      )
    )
    const proposal = proposals.find((p) => p.id === proposalId)
    if (proposal) {
      setVotingHistory((prev) => [
        { proposal_title: proposal.title, vote_type: voteType, weight, created_at: new Date().toISOString() },
        ...prev,
      ])
    }
  }

  async function handleVeto(e) {
    e.preventDefault()
    if (!vetoReason.trim() || !vetoTargetId) return
    try {
      await fetch(`/api/v1/governance/proposals/${vetoTargetId}/veto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: vetoReason }),
      })
    } catch {
      // fallback: apply locally
    }
    setProposals((prev) =>
      prev.map((p) =>
        p.id === vetoTargetId ? { ...p, status: 'vetoed', veto_reason: vetoReason } : p
      )
    )
    setVetoReason('')
    setVetoTargetId(null)
    setShowVetoModal(false)
  }

  function handleOverride(proposalId) {
    setProposals((prev) =>
      prev.map((p) =>
        p.id === proposalId ? { ...p, status: 'passed', veto_reason: null } : p
      )
    )
  }

  function handleDelete(proposalId) {
    setProposals((prev) => prev.filter((p) => p.id !== proposalId))
  }

  function handlePin(proposalId) {
    setProposals((prev) => {
      const target = prev.find((p) => p.id === proposalId)
      if (!target) return prev
      return [target, ...prev.filter((p) => p.id !== proposalId)]
    })
  }

  function toggleVoters(proposalId) {
    setExpandedVoters((prev) => ({ ...prev, [proposalId]: !prev[proposalId] }))
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  function getTimeRemaining(deadline) {
    const diff = new Date(deadline) - new Date()
    if (diff <= 0) return 'Voting ended'
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    if (days > 0) return `${days}d ${hours}h remaining`
    return `${hours}h remaining`
  }

  const activeCount = proposals.filter((p) => p.status === 'active').length
  const passedCount = proposals.filter((p) => p.status === 'passed').length
  const totalVotes = proposals.reduce((sum, p) => sum + p.votes_for + p.votes_against, 0)

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="animate-spin inline-block w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full mb-4" />
        <p className="text-gray-500">Loading governance data...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Governance</h1>
          <p className="text-gray-500">Vote on proposals, shape platform rules, and participate in community decisions</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-600">Role:</label>
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

      {/* Hero Card */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 rounded-2xl p-8 text-white mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-primary-200 text-sm font-medium mb-1">Community Governance</p>
            <p className="text-2xl font-bold">Shape the future of the marketplace</p>
            <p className="text-primary-200 text-sm mt-1">Submit proposals, vote on changes, and help guide platform direction</p>
          </div>
          <div className="flex gap-3 mt-6 md:mt-0">
            <button
              onClick={() => setShowProposalModal(true)}
              className="bg-white text-primary-700 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition"
            >
              + Submit Proposal
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Active Proposals</p>
          <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Total Votes Cast</p>
          <p className="text-2xl font-bold text-gray-900">{totalVotes.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Proposals Passed</p>
          <p className="text-2xl font-bold text-gray-900">{passedCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Your Voting Power</p>
          <p className="text-2xl font-bold text-gray-900">{getVotingWeight()}x</p>
          {(userRole === 'pro' || userRole === 'enterprise') && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${userRole === 'enterprise' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
              {userRole === 'enterprise' ? 'Enterprise' : 'Pro'}
            </span>
          )}
        </div>
      </div>

      {/* Proposals List */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All Proposals</h2>
        <div className="space-y-4">
          {proposals.map((proposal) => {
            const totalPVotes = proposal.votes_for + proposal.votes_against
            const forPercent = totalPVotes > 0 ? (proposal.votes_for / totalPVotes) * 100 : 50
            return (
              <div key={proposal.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900">{proposal.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{proposal.description.length > 150 ? proposal.description.slice(0, 150) + '…' : proposal.description}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[proposal.category] || categoryColors.other}`}>
                      {categoryLabels[proposal.category] || proposal.category}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[proposal.status]}`}>
                      {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Veto Banner */}
                {proposal.status === 'vetoed' && proposal.veto_reason && (
                  <div className="mb-3 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
                    <span className="font-medium">Vetoed:</span> {proposal.veto_reason}
                  </div>
                )}

                {/* Votes Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-green-600 font-medium">👍 {proposal.votes_for} For</span>
                    <span className="text-red-600 font-medium">👎 {proposal.votes_against} Against</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden flex">
                    <div className="bg-green-500 h-full transition-all" style={{ width: `${forPercent}%` }} />
                    <div className="bg-red-400 h-full transition-all" style={{ width: `${100 - forPercent}%` }} />
                  </div>
                </div>

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
                  <span>Proposed by {proposal.proposed_by}</span>
                  <span>·</span>
                  <span>{formatDate(proposal.created_at)}</span>
                  {proposal.status === 'active' && (
                    <>
                      <span>·</span>
                      <span className="text-blue-600 font-medium">{getTimeRemaining(proposal.voting_deadline)}</span>
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  {proposal.status === 'active' && (
                    <>
                      <button
                        onClick={() => handleVote(proposal.id, 'for')}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
                      >
                        Vote For {getVotingWeight() > 1 && `(${getVotingWeight()}x)`}
                      </button>
                      <button
                        onClick={() => handleVote(proposal.id, 'against')}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition"
                      >
                        Vote Against {getVotingWeight() > 1 && `(${getVotingWeight()}x)`}
                      </button>
                    </>
                  )}

                  {/* Superadmin Controls */}
                  {userRole === 'superadmin' && (
                    <>
                      {proposal.status === 'active' && (
                        <button
                          onClick={() => { setVetoTargetId(proposal.id); setShowVetoModal(true) }}
                          className="border border-yellow-400 text-yellow-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-50 transition"
                        >
                          Veto
                        </button>
                      )}
                      {proposal.status === 'vetoed' && (
                        <button
                          onClick={() => handleOverride(proposal.id)}
                          className="border border-green-400 text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-50 transition"
                        >
                          Override
                        </button>
                      )}
                      <button
                        onClick={() => handlePin(proposal.id)}
                        className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                      >
                        📌 Pin
                      </button>
                      <button
                        onClick={() => handleDelete(proposal.id)}
                        className="border border-red-300 text-red-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => toggleVoters(proposal.id)}
                        className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                      >
                        {expandedVoters[proposal.id] ? 'Hide Voters' : 'Show Voters'}
                      </button>
                    </>
                  )}
                </div>

                {/* Voter List (superadmin) */}
                {userRole === 'superadmin' && expandedVoters[proposal.id] && (
                  <div className="mt-3 bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Voters ({proposal.voters?.length || 0})</p>
                    {proposal.voters && proposal.voters.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {proposal.voters.map((voter) => (
                          <span key={voter} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-700">
                            {voter}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No voters yet</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
          {proposals.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 text-center py-12">
              <div className="text-4xl mb-3">🗳️</div>
              <p className="text-gray-500">No proposals yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Voting History */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">My Voting History</h2>
        </div>
        {votingHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-6 py-3 text-gray-500 font-medium">Proposal</th>
                  <th className="px-6 py-3 text-gray-500 font-medium">Vote</th>
                  <th className="px-6 py-3 text-gray-500 font-medium">Weight</th>
                  <th className="px-6 py-3 text-gray-500 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {votingHistory.map((v, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-700">{v.proposal_title}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${v.vote_type === 'for' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {v.vote_type === 'for' ? '👍 For' : '👎 Against'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-700 font-medium">{v.weight}x</td>
                    <td className="px-6 py-3 text-gray-500">{formatDate(v.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-gray-500">No votes cast yet</p>
          </div>
        )}
      </div>

      {/* Submit Proposal Modal */}
      {showProposalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Submit New Proposal</h3>
              <button onClick={() => setShowProposalModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleSubmitProposal}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Proposal title"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
                required
              />
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Describe your proposal in detail"
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
                required
              />
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
              >
                <option value="platform_rules">Platform Rules</option>
                <option value="featured_agents">Featured Agents</option>
                <option value="benchmark_criteria">Benchmark Criteria</option>
                <option value="other">Other</option>
              </select>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowProposalModal(false)} className="flex-1 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition">
                  Submit Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Veto Modal (superadmin) */}
      {showVetoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Veto Proposal</h3>
              <button onClick={() => { setShowVetoModal(false); setVetoTargetId(null) }} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleVeto}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Veto</label>
              <textarea
                value={vetoReason}
                onChange={(e) => setVetoReason(e.target.value)}
                placeholder="Explain why this proposal is being vetoed"
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
                required
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowVetoModal(false); setVetoTargetId(null) }} className="flex-1 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-yellow-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-yellow-700 transition">
                  Confirm Veto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
