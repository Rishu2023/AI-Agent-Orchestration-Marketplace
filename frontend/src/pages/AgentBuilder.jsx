import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Save, ArrowLeft, Bot } from 'lucide-react'
import { useApi } from '../hooks/useApi'

const CATEGORIES = [
  'Customer Support', 'Data Analysis', 'Code Assistant', 'Content Creation',
  'Research', 'Finance', 'Healthcare', 'Legal', 'Marketing', 'Education', 'Productivity', 'Other',
]

const TOOLS = [
  { id: 'web_search', label: 'Web Search' },
  { id: 'code_interpreter', label: 'Code Interpreter' },
  { id: 'file_reader', label: 'File Reader' },
  { id: 'image_analysis', label: 'Image Analysis' },
  { id: 'email_sender', label: 'Email Sender' },
  { id: 'calendar', label: 'Calendar Access' },
  { id: 'database_query', label: 'Database Query' },
  { id: 'api_caller', label: 'API Caller' },
]

const INITIAL_FORM = {
  name: '',
  description: '',
  category: 'Other',
  pricing_type: 'free',
  price: 0,
  system_prompt: '',
  tools_config: '',
}

export default function AgentBuilder() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { get, post, put, loading, error } = useApi()
  const [form, setForm] = useState(INITIAL_FORM)
  const [selectedTools, setSelectedTools] = useState([])
  const [saved, setSaved] = useState(false)

  const isEditing = Boolean(id)

  useEffect(() => {
    if (id) fetchAgent()
  }, [id])

  async function fetchAgent() {
    try {
      const data = await get(`/agents/${id}`)
      setForm({
        name: data.name,
        description: data.description,
        category: data.category,
        pricing_type: data.pricing_type,
        price: data.price,
        system_prompt: data.system_prompt,
        tools_config: data.tools_config || '',
      })
      if (data.tools_config) {
        try { setSelectedTools(JSON.parse(data.tools_config)) } catch (_) {}
      }
    } catch (_) { navigate('/builder') }
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function toggleTool(toolId) {
    setSelectedTools((prev) =>
      prev.includes(toolId) ? prev.filter((t) => t !== toolId) : [...prev, toolId]
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!localStorage.getItem('token')) { alert('Please sign in to create agents'); return }
    const payload = { ...form, price: parseFloat(form.price) || 0, tools_config: JSON.stringify(selectedTools) }
    try {
      if (isEditing) {
        await put(`/agents/${id}`, payload)
      } else {
        const newAgent = await post('/agents', payload)
        navigate(`/builder/${newAgent.id}`)
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (_) {}
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <Bot className="w-6 h-6 text-blue-600" />
        <h1 className="text-xl font-bold text-gray-900">{isEditing ? 'Edit Agent' : 'Create New Agent'}</h1>
      </div>

      {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}
      {saved && <div className="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
        <Save className="w-4 h-4" /> Agent saved successfully!
      </div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Basic Information</h2>
          <div>
            <label className="label">Agent Name *</label>
            <input name="name" value={form.name} onChange={handleChange} required className="input" placeholder="My Awesome Agent" />
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea name="description" value={form.description} onChange={handleChange} required rows={3} className="input resize-none" placeholder="Describe what your agent does..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select name="category" value={form.category} onChange={handleChange} className="input">
                {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Pricing Type</label>
              <select name="pricing_type" value={form.pricing_type} onChange={handleChange} className="input">
                <option value="free">Free</option>
                <option value="per_use">Per Use</option>
                <option value="subscription">Subscription</option>
              </select>
            </div>
          </div>
          {form.pricing_type !== 'free' && (
            <div>
              <label className="label">Price ($)</label>
              <input type="number" name="price" value={form.price} onChange={handleChange} min="0" step="0.01" className="input" />
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Agent Intelligence</h2>
          <div>
            <label className="label">System Prompt *</label>
            <textarea
              name="system_prompt"
              value={form.system_prompt}
              onChange={handleChange}
              required
              rows={6}
              className="input resize-none font-mono text-xs"
              placeholder="You are a helpful assistant that specializes in..."
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Tools & Capabilities</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {TOOLS.map((tool) => (
              <button
                key={tool.id}
                type="button"
                onClick={() => toggleTool(tool.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  selectedTools.includes(tool.id)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                }`}
              >
                {tool.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 disabled:opacity-50">
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Agent'}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={() => navigate(`/marketplace/${id}`)}
              className="btn-secondary"
            >
              View in Marketplace
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
