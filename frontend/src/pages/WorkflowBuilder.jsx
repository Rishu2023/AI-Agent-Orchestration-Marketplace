import { useState, useCallback, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ReactFlow, Background, Controls, MiniMap,
  addEdge, useNodesState, useEdgesState,
  Panel,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Save, Play, Plus, ArrowLeft, GitBranch } from 'lucide-react'
import WorkflowNode from '../components/WorkflowNode'
import { useApi } from '../hooks/useApi'

const nodeTypes = { workflowNode: WorkflowNode }

const NODE_TEMPLATES = [
  { type: 'workflowNode', label: 'Agent', nodeType: 'agent', description: 'Run an AI agent' },
  { type: 'workflowNode', label: 'Trigger', nodeType: 'trigger', description: 'Start point' },
  { type: 'workflowNode', label: 'Condition', nodeType: 'condition', description: 'Branch logic' },
  { type: 'workflowNode', label: 'Output', nodeType: 'output', description: 'End point' },
]

let nodeIdCounter = 0

export default function WorkflowBuilder() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { get, post, put, loading, error } = useApi()
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [name, setName] = useState('My Workflow')
  const [description, setDescription] = useState('')
  const [saved, setSaved] = useState(false)
  const [executing, setExecuting] = useState(false)
  const [execResult, setExecResult] = useState(null)
  const isEditing = Boolean(id)

  useEffect(() => {
    if (id) fetchWorkflow()
  }, [id])

  async function fetchWorkflow() {
    try {
      const data = await get(`/workflows/${id}`)
      setName(data.name)
      setDescription(data.description || '')
      setNodes(JSON.parse(data.nodes || '[]'))
      setEdges(JSON.parse(data.edges || '[]'))
    } catch (_) { navigate('/workflows') }
  }

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  )

  function addNode(template) {
    const newNode = {
      id: `node_${++nodeIdCounter}_${Date.now()}`,
      type: template.type,
      position: { x: 200 + Math.random() * 200, y: 100 + Math.random() * 200 },
      data: { label: template.label, description: template.description, nodeType: template.nodeType },
    }
    setNodes((nds) => [...nds, newNode])
  }

  async function handleSave() {
    if (!localStorage.getItem('token')) { alert('Please sign in'); return }
    const payload = {
      name,
      description,
      nodes: JSON.stringify(nodes),
      edges: JSON.stringify(edges),
    }
    try {
      if (isEditing) {
        await put(`/workflows/${id}`, payload)
      } else {
        const wf = await post('/workflows', payload)
        navigate(`/workflows/${wf.id}`)
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (_) {}
  }

  async function handleExecute() {
    if (!id) { alert('Save the workflow first'); return }
    setExecuting(true)
    setExecResult(null)
    try {
      const result = await post(`/workflows/${id}/execute`, {})
      setExecResult({ success: true, data: result })
    } catch (err) {
      setExecResult({ success: false, error: err.message })
    } finally {
      setExecuting(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 flex-wrap">
        <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <GitBranch className="w-5 h-5 text-blue-600" />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="font-semibold text-gray-900 border-0 outline-none bg-transparent text-lg w-48"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description..."
          className="text-sm text-gray-500 border-0 outline-none bg-transparent flex-1 min-w-0"
        />
        <div className="flex items-center gap-2 ml-auto">
          {saved && <span className="text-green-600 text-sm font-medium">Saved!</span>}
          {error && <span className="text-red-500 text-sm">{error}</span>}
          {execResult && (
            <span className={`text-sm font-medium ${execResult.success ? 'text-green-600' : 'text-red-500'}`}>
              {execResult.success ? `✓ Executed (ID: ${execResult.data.execution_id})` : `✗ ${execResult.error}`}
            </span>
          )}
          <button onClick={handleExecute} disabled={executing || !isEditing} className="btn-secondary flex items-center gap-1.5 text-sm disabled:opacity-40">
            <Play className="w-4 h-4" />
            {executing ? 'Running...' : 'Execute'}
          </button>
          <button onClick={handleSave} disabled={loading} className="btn-primary flex items-center gap-1.5 text-sm disabled:opacity-50">
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Node palette */}
        <div className="w-52 bg-white border-r border-gray-200 p-3 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Add Nodes</p>
          <div className="space-y-2">
            {NODE_TEMPLATES.map((template) => (
              <button
                key={template.nodeType}
                onClick={() => addNode(template)}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
              >
                <Plus className="w-4 h-4 text-blue-500 shrink-0" />
                <div>
                  <div className="text-sm font-medium text-gray-700">{template.label}</div>
                  <div className="text-xs text-gray-400">{template.description}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 font-medium mb-1">Nodes: {nodes.length}</p>
            <p className="text-xs text-gray-500">Edges: {edges.length}</p>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
            <Panel position="top-right">
              {nodes.length === 0 && (
                <div className="bg-white/80 backdrop-blur rounded-xl px-4 py-3 shadow-sm border text-sm text-gray-500">
                  ← Add nodes from the palette to get started
                </div>
              )}
            </Panel>
          </ReactFlow>
        </div>
      </div>
    </div>
  )
}
