import React, { useState } from 'react'

const modelOptions = [
  { provider: 'openai', model: 'gpt-4', label: 'OpenAI GPT-4' },
  { provider: 'openai', model: 'gpt-3.5-turbo', label: 'OpenAI GPT-3.5 Turbo' },
  { provider: 'anthropic', model: 'claude-3-opus', label: 'Anthropic Claude 3 Opus' },
  { provider: 'anthropic', model: 'claude-3-sonnet', label: 'Anthropic Claude 3 Sonnet' },
]

const categoryOptions = [
  { value: 'research', label: '🔬 Research' },
  { value: 'writing', label: '✍️ Writing' },
  { value: 'coding', label: '💻 Coding' },
  { value: 'analysis', label: '📊 Analysis' },
  { value: 'marketing', label: '📢 Marketing' },
  { value: 'sales', label: '💼 Sales' },
  { value: 'design', label: '🎨 Design' },
  { value: 'customer_support', label: '🎧 Customer Support' },
  { value: 'data_processing', label: '🔄 Data Processing' },
  { value: 'creative', label: '✨ Creative' },
  { value: 'productivity', label: '⚡ Productivity' },
  { value: 'other', label: '🤖 Other' },
]

const pricingOptions = [
  { value: 'free', label: 'Free' },
  { value: 'per_use', label: 'Pay Per Use' },
  { value: 'subscription', label: 'Subscription' },
  { value: 'one_time', label: 'One-Time Purchase' },
]

export default function AgentBuilder() {
  const [step, setStep] = useState(1)
  const [agent, setAgent] = useState({
    name: '',
    description: '',
    long_description: '',
    category: 'other',
    system_prompt: '',
    model: 'gpt-4',
    provider: 'openai',
    pricing_model: 'free',
    price: 0,
    tags: '',
  })
  const [testInput, setTestInput] = useState('')
  const [testOutput, setTestOutput] = useState('')

  const updateAgent = (field, value) => {
    setAgent((prev) => ({ ...prev, [field]: value }))
  }

  const handleTest = () => {
    setTestOutput(
      `[Simulated Output]\n\nAgent "${agent.name}" processed your input:\n"${testInput}"\n\nUsing model: ${agent.provider}/${agent.model}\nSystem prompt: ${agent.system_prompt?.substring(0, 100) || 'Not configured'}...\n\nThis is a sandbox test. In production, this would call the actual AI model.`
    )
  }

  const totalSteps = 4

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Agent Builder</h1>
        <p className="text-gray-500">Create and publish your AI agent to the marketplace</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  s <= step
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {s}
              </div>
              {s < totalSteps && (
                <div className={`w-16 sm:w-24 md:w-32 h-1 mx-2 ${s < step ? 'bg-primary-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Basic Info</span>
          <span>Configuration</span>
          <span>Test</span>
          <span>Publish</span>
        </div>
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Agent Name</label>
              <input
                type="text"
                value={agent.name}
                onChange={(e) => updateAgent('name', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., Research Assistant Pro"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
              <textarea
                value={agent.description}
                onChange={(e) => updateAgent('description', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={3}
                placeholder="Brief description of what your agent does..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={agent.category}
                onChange={(e) => updateAgent('category', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {categoryOptions.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
              <input
                type="text"
                value={agent.tags}
                onChange={(e) => updateAgent('tags', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., research, academic, NLP"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Description</label>
              <textarea
                value={agent.long_description}
                onChange={(e) => updateAgent('long_description', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={6}
                placeholder="Detailed description with features, use cases, and examples..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Configuration */}
      {step === 2 && (
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Agent Configuration</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">AI Model</label>
              <select
                value={`${agent.provider}/${agent.model}`}
                onChange={(e) => {
                  const [provider, model] = e.target.value.split('/')
                  updateAgent('provider', provider)
                  updateAgent('model', model)
                }}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {modelOptions.map((m) => (
                  <option key={`${m.provider}/${m.model}`} value={`${m.provider}/${m.model}`}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">System Prompt</label>
              <textarea
                value={agent.system_prompt}
                onChange={(e) => updateAgent('system_prompt', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={10}
                placeholder="You are a helpful AI assistant specialized in..."
              />
              <p className="text-xs text-gray-400 mt-1">
                Define the personality, capabilities, and behavior of your agent.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pricing Model</label>
                <select
                  value={agent.pricing_model}
                  onChange={(e) => updateAgent('pricing_model', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {pricingOptions.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              {agent.pricing_model !== 'free' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (USD)</label>
                  <input
                    type="number"
                    value={agent.price}
                    onChange={(e) => updateAgent('price', parseFloat(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    min="0"
                    step="0.01"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Test */}
      {step === 3 && (
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Test Your Agent</h2>
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                Test your agent in the sandbox before publishing. This simulates how users will interact with it.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Test Input</label>
              <textarea
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={4}
                placeholder="Enter test input for your agent..."
              />
            </div>
            <button
              onClick={handleTest}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition"
            >
              Run Test
            </button>
            {testOutput && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Output</label>
                <div className="bg-gray-900 rounded-lg p-4">
                  <pre className="text-green-400 text-sm whitespace-pre-wrap font-mono">{testOutput}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 4: Publish */}
      {step === 4 && (
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Review & Publish</h2>
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Agent Summary</h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-500">Name</dt>
                  <dd className="font-medium text-gray-900">{agent.name || 'Not set'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Category</dt>
                  <dd className="font-medium text-gray-900 capitalize">{agent.category}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Model</dt>
                  <dd className="font-medium text-gray-900">{agent.provider}/{agent.model}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Pricing</dt>
                  <dd className="font-medium text-gray-900">
                    {agent.pricing_model === 'free' ? 'Free' : `$${agent.price} (${agent.pricing_model})`}
                  </dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-sm text-gray-500">Description</dt>
                  <dd className="font-medium text-gray-900">{agent.description || 'Not set'}</dd>
                </div>
              </dl>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                Once published, your agent will be reviewed by our team before appearing in the marketplace.
                This usually takes 1-2 business days.
              </p>
            </div>
            <button
              className="w-full bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition text-lg"
            >
              Publish Agent
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          className={`px-6 py-2 rounded-lg font-medium ${
            step === 1
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Previous
        </button>
        {step < totalSteps && (
          <button
            onClick={() => setStep(Math.min(totalSteps, step + 1))}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition"
          >
            Next
          </button>
        )}
      </div>
    </div>
  )
}
