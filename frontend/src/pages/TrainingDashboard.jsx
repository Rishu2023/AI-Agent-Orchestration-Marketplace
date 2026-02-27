import React, { useState, useEffect } from 'react'

const demoJobs = [
  { id: 'j1', name: 'Customer Support Fine-tune', status: 'running', progress: 67, base_model: 'Llama 3 8B', dataset: 'support-tickets-v2', epochs: 5, learning_rate: 0.0002, batch_size: 16, started_at: '2024-01-15T08:30:00Z', metrics: { loss: 0.342, accuracy: 91.2, eval_loss: 0.389 } },
  { id: 'j2', name: 'Code Assistant v3', status: 'running', progress: 34, base_model: 'CodeLlama 13B', dataset: 'code-instructions-50k', epochs: 3, learning_rate: 0.0001, batch_size: 8, started_at: '2024-01-15T10:15:00Z', metrics: { loss: 0.518, accuracy: 84.7, eval_loss: 0.556 } },
  { id: 'j3', name: 'Marketing Copy Writer', status: 'queued', progress: 0, base_model: 'Mistral 7B', dataset: 'marketing-copy-10k', epochs: 4, learning_rate: 0.0003, batch_size: 32, started_at: '2024-01-15T11:00:00Z', metrics: null },
  { id: 'j4', name: 'Legal Doc Analyzer', status: 'completed', progress: 100, base_model: 'Llama 3 70B', dataset: 'legal-documents-25k', epochs: 2, learning_rate: 0.00005, batch_size: 4, started_at: '2024-01-14T14:00:00Z', metrics: { loss: 0.198, accuracy: 95.8, eval_loss: 0.231 } },
  { id: 'j5', name: 'Sentiment Classifier', status: 'failed', progress: 45, base_model: 'BERT Large', dataset: 'reviews-100k', epochs: 10, learning_rate: 0.001, batch_size: 64, started_at: '2024-01-14T09:00:00Z', metrics: { loss: 0.887, accuracy: 62.3, eval_loss: 1.102 } },
]

const demoFineTunedModels = [
  { id: 'ft1', name: 'SupportBot-v2-Llama3', base_model: 'Llama 3 8B', downloads: 1240, published: true, created_at: '2024-01-10T12:00:00Z', accuracy: 94.5 },
  { id: 'ft2', name: 'CodeAssist-v2-CL13B', base_model: 'CodeLlama 13B', downloads: 890, published: true, created_at: '2024-01-08T10:00:00Z', accuracy: 91.2 },
  { id: 'ft3', name: 'LegalMind-Llama70B', base_model: 'Llama 3 70B', downloads: 456, published: false, created_at: '2024-01-14T18:00:00Z', accuracy: 95.8 },
  { id: 'ft4', name: 'MarketWriter-Mistral', base_model: 'Mistral 7B', downloads: 312, published: true, created_at: '2024-01-05T15:00:00Z', accuracy: 88.9 },
  { id: 'ft5', name: 'DataCrunch-Qwen72B', base_model: 'Qwen 2 72B', downloads: 178, published: false, created_at: '2024-01-12T08:00:00Z', accuracy: 92.1 },
  { id: 'ft6', name: 'HealthBot-Llama3', base_model: 'Llama 3 8B', downloads: 567, published: true, created_at: '2024-01-03T09:00:00Z', accuracy: 90.3 },
]

const baseModelOptions = ['Llama 3 8B', 'Llama 3 70B', 'CodeLlama 13B', 'Mistral 7B', 'Mixtral 8x22B', 'Qwen 2 72B', 'BERT Large', 'GPT-2 Large']

function getStatusStyle(status) {
  switch (status) {
    case 'running': return 'bg-blue-100 text-blue-700'
    case 'completed': return 'bg-green-100 text-green-700'
    case 'failed': return 'bg-red-100 text-red-700'
    case 'queued': return 'bg-yellow-100 text-yellow-700'
    default: return 'bg-gray-100 text-gray-600'
  }
}

function getStatusIcon(status) {
  switch (status) {
    case 'running': return '⚡'
    case 'completed': return '✓'
    case 'failed': return '✕'
    case 'queued': return '⏳'
    default: return '•'
  }
}

export default function TrainingDashboard() {
  const [jobs, setJobs] = useState([])
  const [fineTunedModels, setFineTunedModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showNewJobModal, setShowNewJobModal] = useState(false)
  const [expandedJob, setExpandedJob] = useState(null)
  const [newJob, setNewJob] = useState({ name: '', base_model: baseModelOptions[0], dataset: '', epochs: 3, learning_rate: 0.0002, batch_size: 16 })

  useEffect(() => {
    fetchTrainingData()
  }, [])

  async function fetchTrainingData() {
    setLoading(true)
    setError(null)
    try {
      const [jobsRes, modelsRes] = await Promise.allSettled([
        fetch('/api/v1/training/jobs'),
        fetch('/api/v1/training/models'),
      ])

      if (jobsRes.status === 'fulfilled' && jobsRes.value.ok) {
        const data = await jobsRes.value.json()
        setJobs(Array.isArray(data) ? data : data.jobs ?? [])
      } else {
        setJobs(demoJobs)
      }

      if (modelsRes.status === 'fulfilled' && modelsRes.value.ok) {
        const data = await modelsRes.value.json()
        setFineTunedModels(Array.isArray(data) ? data : data.models ?? [])
      } else {
        setFineTunedModels(demoFineTunedModels)
      }
    } catch {
      setError('Failed to load training data. Showing demo data.')
      setJobs(demoJobs)
      setFineTunedModels(demoFineTunedModels)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateJob(e) {
    e.preventDefault()
    const job = {
      id: `j-${Date.now()}`,
      ...newJob,
      status: 'queued',
      progress: 0,
      started_at: new Date().toISOString(),
      metrics: null,
    }
    try {
      const res = await fetch('/api/v1/training/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJob),
      })
      if (res.ok) {
        const data = await res.json()
        setJobs(prev => [data, ...prev])
      } else {
        setJobs(prev => [job, ...prev])
      }
    } catch {
      setJobs(prev => [job, ...prev])
    }
    setNewJob({ name: '', base_model: baseModelOptions[0], dataset: '', epochs: 3, learning_rate: 0.0002, batch_size: 16 })
    setShowNewJobModal(false)
  }

  async function handlePublishModel(modelId) {
    try {
      await fetch(`/api/v1/training/models/${modelId}/publish`, { method: 'POST' })
    } catch {
      // Fall through to optimistic update
    }
    setFineTunedModels(prev => prev.map(m => m.id === modelId ? { ...m, published: true } : m))
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="animate-spin inline-block w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full mb-4" />
        <p className="text-gray-500">Loading training dashboard...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Training Dashboard</h1>
          <p className="text-gray-500">Fine-tune models, manage training jobs, and publish your models</p>
        </div>
        <button
          onClick={() => setShowNewJobModal(true)}
          className="mt-4 md:mt-0 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Training Job
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {/* Stats overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Active Jobs</p>
          <p className="text-2xl font-bold text-gray-900">{jobs.filter(j => j.status === 'running').length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Queued</p>
          <p className="text-2xl font-bold text-gray-900">{jobs.filter(j => j.status === 'queued').length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Completed</p>
          <p className="text-2xl font-bold text-green-600">{jobs.filter(j => j.status === 'completed').length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Published Models</p>
          <p className="text-2xl font-bold text-primary-600">{fineTunedModels.filter(m => m.published).length}</p>
        </div>
      </div>

      {/* Active Training Jobs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Training Jobs</h2>
        </div>
        {jobs.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {jobs.map(job => (
              <div key={job.id}>
                <div
                  onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                  className="px-6 py-4 cursor-pointer hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">{job.name}</p>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(job.status)}`}>
                          {getStatusIcon(job.status)} {job.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Base: {job.base_model} · Started: {formatDate(job.started_at)}</p>
                    </div>
                    <div className="w-48 hidden sm:block">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full transition-all ${
                              job.status === 'failed' ? 'bg-red-500' : job.status === 'completed' ? 'bg-green-500' : 'bg-primary-500'
                            }`}
                            style={{ width: `${job.progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600 w-10 text-right">{job.progress}%</span>
                      </div>
                    </div>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedJob === job.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  {/* Mobile progress bar */}
                  <div className="sm:hidden mt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            job.status === 'failed' ? 'bg-red-500' : job.status === 'completed' ? 'bg-green-500' : 'bg-primary-500'
                          }`}
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600">{job.progress}%</span>
                    </div>
                  </div>
                </div>
                {expandedJob === job.id && (
                  <div className="px-6 pb-4 bg-gray-50 border-t border-gray-100">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Dataset</p>
                        <p className="text-sm font-medium text-gray-900">{job.dataset}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Epochs</p>
                        <p className="text-sm font-medium text-gray-900">{job.epochs}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Learning Rate</p>
                        <p className="text-sm font-medium text-gray-900">{job.learning_rate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Batch Size</p>
                        <p className="text-sm font-medium text-gray-900">{job.batch_size}</p>
                      </div>
                    </div>
                    {job.metrics && (
                      <div className="border-t border-gray-200 pt-4">
                        <p className="text-xs text-gray-500 font-medium mb-3">Training Metrics</p>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                            <p className="text-xs text-gray-500">Loss</p>
                            <p className="text-lg font-bold text-gray-900">{job.metrics.loss}</p>
                          </div>
                          <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                            <p className="text-xs text-gray-500">Accuracy</p>
                            <p className="text-lg font-bold text-green-600">{job.metrics.accuracy}%</p>
                          </div>
                          <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                            <p className="text-xs text-gray-500">Eval Loss</p>
                            <p className="text-lg font-bold text-gray-900">{job.metrics.eval_loss}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🏋️</div>
            <p className="text-gray-500">No training jobs yet</p>
          </div>
        )}
      </div>

      {/* Fine-tuned Models Gallery */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Fine-tuned Models</h2>
        {fineTunedModels.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {fineTunedModels.map(model => (
              <div key={model.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{model.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Based on {model.base_model}</p>
                  </div>
                  {model.published ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 flex-shrink-0">
                      Published
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 flex-shrink-0">
                      Draft
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {model.downloads.toLocaleString()} downloads
                  </span>
                  <span>Acc: {model.accuracy}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{formatDate(model.created_at)}</span>
                  {!model.published && (
                    <button
                      onClick={() => handlePublishModel(model.id)}
                      className="bg-primary-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-primary-700 transition"
                    >
                      Publish Model
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 text-center py-12">
            <div className="text-4xl mb-3">🤖</div>
            <p className="text-gray-500">No fine-tuned models yet</p>
          </div>
        )}
      </div>

      {/* New Training Job Modal */}
      {showNewJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">New Training Job</h3>
              <button onClick={() => setShowNewJobModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleCreateJob}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model Name</label>
                  <input
                    type="text"
                    value={newJob.name}
                    onChange={e => setNewJob(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., My Custom Assistant"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base Model</label>
                  <select
                    value={newJob.base_model}
                    onChange={e => setNewJob(prev => ({ ...prev, base_model: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                  >
                    {baseModelOptions.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dataset Name</label>
                  <input
                    type="text"
                    value={newJob.dataset}
                    onChange={e => setNewJob(prev => ({ ...prev, dataset: e.target.value }))}
                    placeholder="e.g., my-dataset-v1"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Epochs</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={newJob.epochs}
                      onChange={e => setNewJob(prev => ({ ...prev, epochs: parseInt(e.target.value) || 1 }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Learning Rate</label>
                    <input
                      type="number"
                      step="0.00001"
                      min="0.000001"
                      value={newJob.learning_rate}
                      onChange={e => setNewJob(prev => ({ ...prev, learning_rate: parseFloat(e.target.value) || 0.0001 }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Batch Size</label>
                    <input
                      type="number"
                      min="1"
                      max="256"
                      value={newJob.batch_size}
                      onChange={e => setNewJob(prev => ({ ...prev, batch_size: parseInt(e.target.value) || 1 }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowNewJobModal(false)} className="flex-1 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition">
                  Start Training
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
