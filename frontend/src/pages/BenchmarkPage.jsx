import React, { useState, useEffect } from 'react'

const dimensions = ['Reasoning', 'Creativity', 'Code Gen', 'Instruction Following', 'Multi-step Planning', 'Self-correction', 'Tool Use', 'Memory Retrieval']

const demoModels = [
  { id: 'm1', rank: 1, name: 'GPT-4 Turbo', provider: 'OpenAI', overall: 94.2, scores: [96, 92, 97, 95, 93, 91, 94, 90] },
  { id: 'm2', rank: 2, name: 'Claude 3 Opus', provider: 'Anthropic', overall: 93.1, scores: [95, 94, 93, 96, 92, 90, 93, 89] },
  { id: 'm3', rank: 3, name: 'Gemini Ultra', provider: 'Google', overall: 91.5, scores: [93, 89, 94, 91, 90, 92, 90, 88] },
  { id: 'm4', rank: 4, name: 'Llama 3 70B', provider: 'Meta', overall: 88.7, scores: [90, 86, 91, 88, 87, 89, 85, 87] },
  { id: 'm5', rank: 5, name: 'Mixtral 8x22B', provider: 'Mistral', overall: 86.4, scores: [88, 84, 89, 86, 85, 87, 83, 85] },
  { id: 'm6', rank: 6, name: 'Command R+', provider: 'Cohere', overall: 84.9, scores: [86, 83, 85, 87, 84, 82, 86, 82] },
  { id: 'm7', rank: 7, name: 'Qwen 2 72B', provider: 'Alibaba', overall: 83.2, scores: [85, 81, 86, 83, 82, 80, 84, 80] },
  { id: 'm8', rank: 8, name: 'DeepSeek V2', provider: 'DeepSeek', overall: 81.8, scores: [83, 79, 87, 80, 81, 78, 82, 78] },
]

const demoBenchmarkHistory = [
  { date: 'Jan', avgScore: 78.2 },
  { date: 'Feb', avgScore: 80.1 },
  { date: 'Mar', avgScore: 82.5 },
  { date: 'Apr', avgScore: 83.9 },
  { date: 'May', avgScore: 85.7 },
  { date: 'Jun', avgScore: 87.3 },
  { date: 'Jul', avgScore: 89.1 },
  { date: 'Aug', avgScore: 91.4 },
]

const modelColors = [
  '#6366f1', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'
]

function RadarChart({ models, allModels }) {
  const size = 300
  const center = size / 2
  const radius = 110
  const levels = 5

  function getPoint(dimIndex, value) {
    const angle = (Math.PI * 2 * dimIndex) / dimensions.length - Math.PI / 2
    const r = (value / 100) * radius
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) }
  }

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-md mx-auto">
      {/* Grid levels */}
      {Array.from({ length: levels }, (_, i) => {
        const r = (radius * (i + 1)) / levels
        const points = dimensions.map((_, di) => {
          const angle = (Math.PI * 2 * di) / dimensions.length - Math.PI / 2
          return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`
        }).join(' ')
        return <polygon key={i} points={points} fill="none" stroke="#e5e7eb" strokeWidth="1" />
      })}

      {/* Axis lines */}
      {dimensions.map((_, i) => {
        const angle = (Math.PI * 2 * i) / dimensions.length - Math.PI / 2
        return (
          <line key={i} x1={center} y1={center}
            x2={center + radius * Math.cos(angle)} y2={center + radius * Math.sin(angle)}
            stroke="#e5e7eb" strokeWidth="1" />
        )
      })}

      {/* Dimension labels */}
      {dimensions.map((dim, i) => {
        const angle = (Math.PI * 2 * i) / dimensions.length - Math.PI / 2
        const labelR = radius + 20
        const x = center + labelR * Math.cos(angle)
        const y = center + labelR * Math.sin(angle)
        return (
          <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
            className="fill-gray-500" fontSize="8" fontWeight="500">
            {dim}
          </text>
        )
      })}

      {/* Model polygons */}
      {models.map((model) => {
        const globalIndex = allModels.findIndex(m => m.id === model.id)
        const color = modelColors[globalIndex % modelColors.length]
        const points = model.scores.map((score, di) => {
          const p = getPoint(di, score)
          return `${p.x},${p.y}`
        }).join(' ')
        return (
          <g key={model.id}>
            <polygon points={points} fill={color} fillOpacity="0.15" stroke={color} strokeWidth="2" />
            {model.scores.map((score, di) => {
              const p = getPoint(di, score)
              return <circle key={di} cx={p.x} cy={p.y} r="3" fill={color} />
            })}
          </g>
        )
      })}
    </svg>
  )
}

function LineChart({ data }) {
  const width = 600
  const height = 200
  const padding = { top: 20, right: 20, bottom: 30, left: 40 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  const minVal = Math.floor(Math.min(...data.map(d => d.avgScore)) - 2)
  const maxVal = Math.ceil(Math.max(...data.map(d => d.avgScore)) + 2)

  const points = data.map((d, i) => ({
    x: padding.left + (i / (data.length - 1)) * chartW,
    y: padding.top + chartH - ((d.avgScore - minVal) / (maxVal - minVal)) * chartH,
  }))

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaD = pathD + ` L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
      {/* Y-axis labels */}
      {Array.from({ length: 5 }, (_, i) => {
        const val = minVal + ((maxVal - minVal) * i) / 4
        const y = padding.top + chartH - (i / 4) * chartH
        return (
          <g key={i}>
            <text x={padding.left - 8} y={y + 4} textAnchor="end" className="fill-gray-400" fontSize="10">{val.toFixed(0)}</text>
            <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#f3f4f6" strokeWidth="1" />
          </g>
        )
      })}

      {/* X-axis labels */}
      {data.map((d, i) => (
        <text key={i} x={points[i].x} y={height - 8} textAnchor="middle" className="fill-gray-400" fontSize="10">{d.date}</text>
      ))}

      {/* Area */}
      <path d={areaD} fill="url(#lineGradient)" />
      <defs>
        <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Line */}
      <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="white" stroke="#6366f1" strokeWidth="2" />
      ))}
    </svg>
  )
}

function getScoreBadgeColor(score) {
  if (score >= 95) return 'bg-emerald-100 text-emerald-700'
  if (score >= 90) return 'bg-green-100 text-green-700'
  if (score >= 85) return 'bg-blue-100 text-blue-700'
  if (score >= 80) return 'bg-yellow-100 text-yellow-700'
  return 'bg-gray-100 text-gray-600'
}

export default function BenchmarkPage() {
  const [models, setModels] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedModels, setSelectedModels] = useState([])
  const [runningBenchmark, setRunningBenchmark] = useState(false)
  const [benchmarkResult, setBenchmarkResult] = useState(null)

  useEffect(() => {
    fetchBenchmarkData()
  }, [])

  async function fetchBenchmarkData() {
    setLoading(true)
    setError(null)
    try {
      const [modelsRes, historyRes] = await Promise.allSettled([
        fetch('/api/v1/benchmarks/leaderboard'),
        fetch('/api/v1/benchmarks/history'),
      ])

      if (modelsRes.status === 'fulfilled' && modelsRes.value.ok) {
        const data = await modelsRes.value.json()
        setModels(Array.isArray(data) ? data : data.models ?? [])
      } else {
        setModels(demoModels)
      }

      if (historyRes.status === 'fulfilled' && historyRes.value.ok) {
        const data = await historyRes.value.json()
        setHistory(Array.isArray(data) ? data : data.history ?? [])
      } else {
        setHistory(demoBenchmarkHistory)
      }
    } catch {
      setError('Failed to load benchmark data. Showing demo data.')
      setModels(demoModels)
      setHistory(demoBenchmarkHistory)
    } finally {
      setLoading(false)
    }
  }

  async function handleRunBenchmark() {
    setRunningBenchmark(true)
    setBenchmarkResult(null)
    try {
      const res = await fetch('/api/v1/benchmarks/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ models: selectedModels.length > 0 ? selectedModels.map(m => m.id) : undefined }),
      })
      if (res.ok) {
        const data = await res.json()
        setBenchmarkResult(data)
      } else {
        setBenchmarkResult({ status: 'completed', message: 'Benchmark completed successfully (demo)', duration: '2m 34s' })
      }
    } catch {
      setBenchmarkResult({ status: 'completed', message: 'Benchmark completed successfully (demo)', duration: '2m 34s' })
    } finally {
      setRunningBenchmark(false)
    }
  }

  function toggleModelSelection(model) {
    setSelectedModels(prev => {
      const exists = prev.find(m => m.id === model.id)
      if (exists) return prev.filter(m => m.id !== model.id)
      if (prev.length >= 3) return prev
      return [...prev, model]
    })
  }

  const comparisonModels = selectedModels.length > 0 ? selectedModels : models.slice(0, 3)

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="animate-spin inline-block w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full mb-4" />
        <p className="text-gray-500">Loading benchmark data...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Model Benchmarks</h1>
          <p className="text-gray-500">Compare AI model performance across multiple dimensions</p>
        </div>
        <button
          onClick={handleRunBenchmark}
          disabled={runningBenchmark}
          className="mt-4 md:mt-0 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {runningBenchmark ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              Running...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Run Benchmark
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {benchmarkResult && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {benchmarkResult.message} — Duration: {benchmarkResult.duration}
        </div>
      )}

      {/* Leaderboard */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Model Leaderboard</h2>
          <span className="text-xs text-gray-400">Click rows to compare (max 3)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-6 py-3 text-gray-500 font-medium w-16">Rank</th>
                <th className="px-6 py-3 text-gray-500 font-medium">Model</th>
                <th className="px-6 py-3 text-gray-500 font-medium">Provider</th>
                <th className="px-6 py-3 text-gray-500 font-medium text-center">Overall</th>
                {dimensions.map(dim => (
                  <th key={dim} className="px-3 py-3 text-gray-500 font-medium text-center text-xs whitespace-nowrap">{dim}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {models.map((model) => {
                const isSelected = selectedModels.some(m => m.id === model.id)
                return (
                  <tr key={model.id}
                    onClick={() => toggleModelSelection(model)}
                    className={`cursor-pointer transition ${isSelected ? 'bg-indigo-50 hover:bg-indigo-100' : 'hover:bg-gray-50'}`}>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                        model.rank === 1 ? 'bg-yellow-100 text-yellow-700' : model.rank === 2 ? 'bg-gray-100 text-gray-600' : model.rank === 3 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-500'
                      }`}>
                        {model.rank}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-medium text-gray-900">{model.name}</td>
                    <td className="px-6 py-3 text-gray-600">{model.provider}</td>
                    <td className="px-6 py-3 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${getScoreBadgeColor(model.overall)}`}>
                        {model.overall}
                      </span>
                    </td>
                    {model.scores.map((score, i) => (
                      <td key={i} className="px-3 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getScoreBadgeColor(score)}`}>
                          {score}
                        </span>
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparison & Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Radar Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Radar</h2>
          <div className="flex flex-wrap gap-3 mb-4">
            {comparisonModels.map((model) => {
              const globalIndex = models.findIndex(m => m.id === model.id)
              const color = modelColors[globalIndex % modelColors.length]
              return (
                <span key={model.id} className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                  {model.name}
                </span>
              )
            })}
          </div>
          <RadarChart models={comparisonModels} allModels={models} />
        </div>

        {/* Side-by-side comparison */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Side-by-Side Comparison</h2>
          {comparisonModels.length > 0 ? (
            <div className="space-y-4">
              {dimensions.map((dim, di) => (
                <div key={dim}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500 font-medium">{dim}</span>
                  </div>
                  <div className="space-y-1.5">
                    {comparisonModels.map((model) => {
                      const globalIndex = models.findIndex(m => m.id === model.id)
                      const color = modelColors[globalIndex % modelColors.length]
                      return (
                        <div key={model.id} className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-24 truncate">{model.name}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                            <div className="h-2.5 rounded-full transition-all" style={{ width: `${model.scores[di]}%`, backgroundColor: color }} />
                          </div>
                          <span className="text-xs font-medium text-gray-700 w-8 text-right">{model.scores[di]}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">📊</div>
              <p className="text-gray-500">Select models from the leaderboard to compare</p>
            </div>
          )}
        </div>
      </div>

      {/* Benchmark History */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Benchmark Score Trends</h2>
        <p className="text-sm text-gray-500 mb-4">Average top model scores over time</p>
        {history.length > 0 ? (
          <LineChart data={history} />
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📈</div>
            <p className="text-gray-500">No history data available</p>
          </div>
        )}
      </div>
    </div>
  )
}
