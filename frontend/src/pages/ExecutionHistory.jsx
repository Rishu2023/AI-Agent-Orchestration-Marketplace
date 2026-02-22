import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { History, RefreshCw } from 'lucide-react'
import { useApi } from '../hooks/useApi'

const STATUS_STYLES = {
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  pending: 'bg-yellow-100 text-yellow-700',
  running: 'bg-blue-100 text-blue-700',
}

export default function ExecutionHistory() {
  const { get, loading } = useApi()
  const [executions, setExecutions] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    fetchExecutions()
  }, [])

  async function fetchExecutions() {
    if (!localStorage.getItem('token')) return
    try {
      const data = await get('/executions?limit=100')
      setExecutions(data)
    } catch (_) {}
  }

  if (!localStorage.getItem('token')) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-500">
        <History className="w-12 h-12 mx-auto mb-4 opacity-40" />
        <p>Please <Link to="/dashboard" className="text-blue-600 hover:underline">sign in</Link> to view execution history.</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">Execution History</h1>
        </div>
        <button onClick={fetchExecutions} disabled={loading} className="btn-secondary flex items-center gap-1.5 text-sm disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {executions.length === 0 && !loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          <History className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No executions yet</p>
          <p className="text-sm">Go to the <Link to="/marketplace" className="text-blue-500 hover:underline">Marketplace</Link> and run an agent!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">ID</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Target</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tokens</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cost</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {executions.map((exec) => (
                    <tr
                      key={exec.id}
                      onClick={() => setSelected(exec)}
                      className={`border-b border-gray-50 last:border-0 cursor-pointer hover:bg-blue-50 transition-colors ${selected?.id === exec.id ? 'bg-blue-50' : ''}`}
                    >
                      <td className="px-4 py-3 font-mono text-gray-500">#{exec.id}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {exec.agent_id ? `Agent #${exec.agent_id}` : `Workflow #${exec.workflow_id}`}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[exec.status] || 'bg-gray-100 text-gray-500'}`}>
                          {exec.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{exec.tokens_used.toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-600">${exec.cost.toFixed(6)}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{new Date(exec.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detail panel */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 h-fit">
            <h3 className="font-semibold text-gray-900 mb-4">
              {selected ? `Execution #${selected.id}` : 'Select an execution'}
            </h3>
            {selected ? (
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Status</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[selected.status]}`}>{selected.status}</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Input</p>
                  <pre className="bg-gray-50 rounded-lg p-2 text-xs text-gray-600 overflow-auto max-h-32 whitespace-pre-wrap">
                    {selected.input_data ? JSON.stringify(JSON.parse(selected.input_data), null, 2) : 'N/A'}
                  </pre>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Output</p>
                  <pre className="bg-gray-50 rounded-lg p-2 text-xs text-gray-600 overflow-auto max-h-48 whitespace-pre-wrap">
                    {selected.output_data ? JSON.stringify(JSON.parse(selected.output_data), null, 2) : 'N/A'}
                  </pre>
                </div>
                {selected.error_message && (
                  <div>
                    <p className="text-xs font-semibold text-red-500 uppercase mb-1">Error</p>
                    <p className="text-xs text-red-600">{selected.error_message}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-400">Tokens</p>
                    <p className="font-medium">{selected.tokens_used.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Cost</p>
                    <p className="font-medium">${selected.cost.toFixed(6)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Click a row to view details</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
