import React, { useState, useCallback } from 'react'

const availableAgents = [
  { id: '1', name: 'Research Assistant', category: 'research', icon: '🔬' },
  { id: '2', name: 'Code Generator', category: 'coding', icon: '💻' },
  { id: '3', name: 'Content Writer', category: 'writing', icon: '✍️' },
  { id: '4', name: 'Data Analyzer', category: 'analysis', icon: '📊' },
  { id: '5', name: 'Email Composer', category: 'marketing', icon: '📧' },
]

const stepTypes = [
  { type: 'agent', label: 'Agent Step', icon: '🤖', description: 'Run an AI agent' },
  { type: 'condition', label: 'Condition', icon: '🔀', description: 'Add conditional logic' },
  { type: 'parallel', label: 'Parallel', icon: '⚡', description: 'Run steps in parallel' },
  { type: 'human_review', label: 'Human Review', icon: '👤', description: 'Pause for human input' },
  { type: 'delay', label: 'Delay', icon: '⏱️', description: 'Wait before continuing' },
  { type: 'transform', label: 'Transform', icon: '🔄', description: 'Transform data between steps' },
]

const workflowTemplates = [
  {
    id: 'content-pipeline',
    name: 'Content Creation Pipeline',
    description: 'Research → Write → Review → Publish',
    steps: [
      { name: 'Research Topic', type: 'agent', agentId: '1' },
      { name: 'Write Draft', type: 'agent', agentId: '3' },
      { name: 'Human Review', type: 'human_review' },
      { name: 'Final Edit', type: 'agent', agentId: '3' },
    ],
  },
  {
    id: 'code-review',
    name: 'Code Review Pipeline',
    description: 'Analyze → Review → Fix → Test',
    steps: [
      { name: 'Analyze Code', type: 'agent', agentId: '4' },
      { name: 'Generate Review', type: 'agent', agentId: '2' },
      { name: 'Apply Fixes', type: 'agent', agentId: '2' },
      { name: 'Verify Changes', type: 'human_review' },
    ],
  },
  {
    id: 'data-report',
    name: 'Data Analysis Report',
    description: 'Collect → Analyze → Visualize → Report',
    steps: [
      { name: 'Collect Data', type: 'agent', agentId: '4' },
      { name: 'Analyze Patterns', type: 'agent', agentId: '4' },
      { name: 'Generate Report', type: 'agent', agentId: '3' },
      { name: 'Review Report', type: 'human_review' },
    ],
  },
]

export default function WorkflowBuilder() {
  const [workflowName, setWorkflowName] = useState('')
  const [workflowDescription, setWorkflowDescription] = useState('')
  const [steps, setSteps] = useState([])
  const [showAddStep, setShowAddStep] = useState(false)
  const [selectedStep, setSelectedStep] = useState(null)

  const addStep = useCallback((type, agentId = null, name = null) => {
    const newStep = {
      id: `step-${Date.now()}`,
      name: name || `${type.charAt(0).toUpperCase() + type.slice(1)} Step ${steps.length + 1}`,
      type,
      agentId,
      config: {},
      position: steps.length,
    }
    setSteps((prev) => [...prev, newStep])
    setShowAddStep(false)
  }, [steps.length])

  const removeStep = useCallback((stepId) => {
    setSteps((prev) => prev.filter((s) => s.id !== stepId))
    if (selectedStep === stepId) setSelectedStep(null)
  }, [selectedStep])

  const moveStep = useCallback((index, direction) => {
    setSteps((prev) => {
      const newSteps = [...prev]
      const newIndex = index + direction
      if (newIndex < 0 || newIndex >= newSteps.length) return prev
      ;[newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]]
      return newSteps
    })
  }, [])

  const loadTemplate = useCallback((template) => {
    setWorkflowName(template.name)
    setWorkflowDescription(template.description)
    setSteps(
      template.steps.map((s, i) => ({
        id: `step-${Date.now()}-${i}`,
        name: s.name,
        type: s.type,
        agentId: s.agentId || null,
        config: {},
        position: i,
      }))
    )
  }, [])

  const getStepIcon = (type) => {
    const found = stepTypes.find((st) => st.type === type)
    return found?.icon || '🔧'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Workflow Builder</h1>
          <p className="text-gray-500">Create and manage AI agent workflows</p>
        </div>
        <button className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition">
          Save Workflow
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Workflow Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Workflow Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="My Workflow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={workflowDescription}
                  onChange={(e) => setWorkflowDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                  placeholder="Describe your workflow..."
                />
              </div>
            </div>
          </div>

          {/* Templates */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Templates</h3>
            <div className="space-y-3">
              {workflowTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => loadTemplate(template)}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition"
                >
                  <p className="text-sm font-medium text-gray-900">{template.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Available Agents */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Available Agents</h3>
            <div className="space-y-2">
              {availableAgents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => addStep('agent', agent.id, agent.name)}
                  className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition text-left"
                >
                  <span className="text-xl">{agent.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{agent.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{agent.category}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Canvas */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-gray-200 p-8 min-h-[600px]">
            {steps.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-96 text-center">
                <div className="text-6xl mb-4">⚡</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Start Building Your Workflow</h3>
                <p className="text-gray-500 mb-6 max-w-md">
                  Add agents and steps to create a workflow. You can also start from a template.
                </p>
                <button
                  onClick={() => setShowAddStep(true)}
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition"
                >
                  Add First Step
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div key={step.id}>
                    <div
                      className={`border-2 rounded-lg p-4 transition cursor-pointer ${
                        selectedStep === step.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedStep(step.id === selectedStep ? null : step.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{getStepIcon(step.type)}</span>
                          <div>
                            <p className="font-medium text-gray-900">{step.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{step.type.replace('_', ' ')}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); moveStep(index, -1) }}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                            aria-label="Move up"
                          >
                            ↑
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); moveStep(index, 1) }}
                            disabled={index === steps.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                            aria-label="Move down"
                          >
                            ↓
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); removeStep(step.id) }}
                            className="p-1 text-red-400 hover:text-red-600"
                            aria-label="Remove step"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="flex justify-center py-1">
                        <div className="w-px h-6 bg-gray-300" />
                      </div>
                    )}
                  </div>
                ))}
                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => setShowAddStep(true)}
                    className="border-2 border-dashed border-gray-300 rounded-lg px-6 py-3 text-gray-500 hover:border-primary-400 hover:text-primary-600 transition"
                  >
                    + Add Step
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Add Step Modal */}
          {showAddStep && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl max-w-lg w-full p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Add Step</h3>
                  <button
                    onClick={() => setShowAddStep(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {stepTypes.map((st) => (
                    <button
                      key={st.type}
                      onClick={() => addStep(st.type)}
                      className="p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition text-left"
                    >
                      <span className="text-2xl">{st.icon}</span>
                      <p className="font-medium text-gray-900 mt-2">{st.label}</p>
                      <p className="text-xs text-gray-500 mt-1">{st.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
