import { Handle, Position } from '@xyflow/react'
import { Bot, Zap, Filter, Play } from 'lucide-react'

const NODE_ICONS = {
  agent: Bot,
  trigger: Zap,
  condition: Filter,
  output: Play,
}

const NODE_COLORS = {
  agent: 'border-blue-400 bg-blue-50',
  trigger: 'border-green-400 bg-green-50',
  condition: 'border-yellow-400 bg-yellow-50',
  output: 'border-purple-400 bg-purple-50',
}

export default function WorkflowNode({ data, type = 'agent' }) {
  const Icon = NODE_ICONS[type] || Bot
  const colorClass = NODE_COLORS[type] || NODE_COLORS.agent

  return (
    <div className={`px-4 py-3 rounded-xl border-2 shadow-sm min-w-[160px] ${colorClass}`}>
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />

      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-gray-600 shrink-0" />
        <div className="min-w-0">
          <div className="text-sm font-semibold text-gray-800 truncate">{data.label}</div>
          {data.description && (
            <div className="text-xs text-gray-500 truncate">{data.description}</div>
          )}
        </div>
      </div>

      {data.status && (
        <div className={`mt-2 text-xs px-2 py-0.5 rounded-full inline-block font-medium ${
          data.status === 'completed' ? 'bg-green-100 text-green-700' :
          data.status === 'running' ? 'bg-blue-100 text-blue-700' :
          data.status === 'failed' ? 'bg-red-100 text-red-700' :
          'bg-gray-100 text-gray-600'
        }`}>
          {data.status}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
    </div>
  )
}
