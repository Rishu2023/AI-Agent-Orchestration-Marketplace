import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bot, GitBranch, Zap, TrendingUp, Plus, Eye } from 'lucide-react'
import { useApi } from '../hooks/useApi'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${color} mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  )
}

export default function Dashboard() {
  const { get, post, loading } = useApi()
  const [agents, setAgents] = useState([])
  const [workflows, setWorkflows] = useState([])
  const [executions, setExecutions] = useState([])
  const [user, setUser] = useState(null)
  const [loginForm, setLoginForm] = useState({ email: 'demo@example.com', password: 'demo1234' })
  const [registerMode, setRegisterMode] = useState(false)
  const [authError, setAuthError] = useState('')
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (token) {
      fetchDashboard()
    }
  }, [token])

  async function fetchDashboard() {
    try {
      const [me, myAgents, myWorkflows, myExecs] = await Promise.all([
        get('/users/me'),
        get('/agents?page_size=10'),
        get('/workflows'),
        get('/executions?limit=5'),
      ])
      setUser(me)
      setAgents(myAgents.items || [])
      setWorkflows(myWorkflows)
      setExecutions(myExecs)
    } catch (_) {}
  }

  async function handleLogin(e) {
    e.preventDefault()
    setAuthError('')
    try {
      const resp = await post('/users/login', loginForm)
      localStorage.setItem('token', resp.access_token)
      window.location.reload()
    } catch (err) {
      setAuthError(err.response?.data?.detail || 'Login failed')
    }
  }

  async function handleRegister(e) {
    e.preventDefault()
    setAuthError('')
    try {
      await post('/users/register', { ...loginForm, name: loginForm.name || loginForm.email.split('@')[0] })
      const resp = await post('/users/login', loginForm)
      localStorage.setItem('token', resp.access_token)
      window.location.reload()
    } catch (err) {
      setAuthError(err.response?.data?.detail || 'Registration failed')
    }
  }

  if (!token) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <Bot className="w-10 h-10 text-blue-600 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{registerMode ? 'Create Account' : 'Welcome back'}</h1>
          <p className="text-gray-500 text-sm mb-6">
            {registerMode ? 'Join the AI Agent Marketplace' : 'Sign in to access your dashboard'}
          </p>
          {authError && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg mb-4">{authError}</div>}
          <form onSubmit={registerMode ? handleRegister : handleLogin} className="space-y-4">
            {registerMode && (
              <div>
                <label className="label">Name</label>
                <input value={loginForm.name || ''} onChange={(e) => setLoginForm((f) => ({ ...f, name: e.target.value }))} className="input" placeholder="Your name" />
              </div>
            )}
            <div>
              <label className="label">Email</label>
              <input type="email" value={loginForm.email} onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))} className="input" required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" value={loginForm.password} onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))} className="input" required />
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary disabled:opacity-50">
              {loading ? 'Please wait...' : registerMode ? 'Create Account' : 'Sign In'}
            </button>
          </form>
          <p className="text-sm text-gray-500 mt-4 text-center">
            {registerMode ? 'Already have an account? ' : "Don't have an account? "}
            <button onClick={() => { setRegisterMode(!registerMode); setAuthError('') }} className="text-blue-600 hover:underline">
              {registerMode ? 'Sign in' : 'Register'}
            </button>
          </p>
          {!registerMode && (
            <p className="text-xs text-gray-400 mt-3 text-center">Demo: demo@example.com / demo1234</p>
          )}
        </div>
      </div>
    )
  }

  const publishedCount = agents.filter((a) => a.is_published).length
  const totalExecs = executions.length

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          {user && <p className="text-gray-500 text-sm mt-1">Welcome back, {user.name}</p>}
        </div>
        <div className="flex gap-3">
          <Link to="/builder" className="btn-secondary flex items-center gap-1.5 text-sm">
            <Plus className="w-4 h-4" /> New Agent
          </Link>
          <Link to="/workflows" className="btn-primary flex items-center gap-1.5 text-sm">
            <Plus className="w-4 h-4" /> New Workflow
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Bot} label="My Agents" value={agents.length} color="bg-blue-100 text-blue-600" />
        <StatCard icon={Eye} label="Published" value={publishedCount} color="bg-green-100 text-green-600" />
        <StatCard icon={GitBranch} label="Workflows" value={workflows.length} color="bg-purple-100 text-purple-600" />
        <StatCard icon={Zap} label="Recent Runs" value={totalExecs} color="bg-orange-100 text-orange-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Agents */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">My Agents</h2>
            <Link to="/builder" className="text-sm text-blue-600 hover:underline">+ Create</Link>
          </div>
          {agents.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              <Bot className="w-8 h-8 mx-auto mb-2 opacity-40" />
              No agents yet. <Link to="/builder" className="text-blue-500 hover:underline">Create one!</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {agents.slice(0, 5).map((agent) => (
                <div key={agent.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{agent.name}</p>
                    <p className="text-xs text-gray-400">{agent.category} · {agent.execution_count} runs</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${agent.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {agent.is_published ? 'Published' : 'Draft'}
                    </span>
                    <Link to={`/builder/${agent.id}`} className="text-xs text-blue-500 hover:underline">Edit</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Workflows */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">My Workflows</h2>
            <Link to="/workflows" className="text-sm text-blue-600 hover:underline">+ Create</Link>
          </div>
          {workflows.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              <GitBranch className="w-8 h-8 mx-auto mb-2 opacity-40" />
              No workflows yet. <Link to="/workflows" className="text-blue-500 hover:underline">Build one!</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {workflows.slice(0, 5).map((wf) => (
                <div key={wf.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{wf.name}</p>
                    <p className="text-xs text-gray-400">{wf.description || 'No description'}</p>
                  </div>
                  <Link to={`/workflows/${wf.id}`} className="text-xs text-blue-500 hover:underline">Open</Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Executions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Executions</h2>
            <Link to="/executions" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          {executions.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-40" />
              No executions yet. Try running an agent from the marketplace!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
                    <th className="pb-2 pr-4">Type</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2 pr-4">Tokens</th>
                    <th className="pb-2 pr-4">Cost</th>
                    <th className="pb-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {executions.map((exec) => (
                    <tr key={exec.id} className="border-b border-gray-50 last:border-0">
                      <td className="py-2 pr-4 text-gray-600">{exec.agent_id ? `Agent #${exec.agent_id}` : `Workflow #${exec.workflow_id}`}</td>
                      <td className="py-2 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          exec.status === 'completed' ? 'bg-green-100 text-green-700' :
                          exec.status === 'failed' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>{exec.status}</span>
                      </td>
                      <td className="py-2 pr-4 text-gray-600">{exec.tokens_used}</td>
                      <td className="py-2 pr-4 text-gray-600">${exec.cost.toFixed(4)}</td>
                      <td className="py-2 text-gray-400">{new Date(exec.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
