import React from 'react'
import { Link } from 'react-router-dom'

const categoryColors = {
  research: 'bg-blue-100 text-blue-800',
  writing: 'bg-green-100 text-green-800',
  coding: 'bg-purple-100 text-purple-800',
  analysis: 'bg-yellow-100 text-yellow-800',
  marketing: 'bg-pink-100 text-pink-800',
  sales: 'bg-orange-100 text-orange-800',
  customer_support: 'bg-teal-100 text-teal-800',
  data_processing: 'bg-indigo-100 text-indigo-800',
  creative: 'bg-red-100 text-red-800',
  productivity: 'bg-cyan-100 text-cyan-800',
  other: 'bg-gray-100 text-gray-800',
}

const categoryIcons = {
  research: '🔬',
  writing: '✍️',
  coding: '💻',
  analysis: '📊',
  marketing: '📢',
  sales: '💼',
  customer_support: '🎧',
  data_processing: '🔄',
  creative: '🎨',
  productivity: '⚡',
  other: '🤖',
}

export default function AgentCard({ agent }) {
  const colorClass = categoryColors[agent.category] || categoryColors.other
  const icon = categoryIcons[agent.category] || categoryIcons.other

  return (
    <Link
      to={`/agents/${agent.id}`}
      className="block bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-200 overflow-hidden group"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="text-3xl">{icon}</div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
            {agent.category}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition mb-2">
          {agent.name}
        </h3>
        <p className="text-gray-500 text-sm line-clamp-2 mb-4">
          {agent.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <span className="text-yellow-400">★</span>
            <span className="text-sm font-medium text-gray-700">
              {agent.average_rating?.toFixed(1) || '0.0'}
            </span>
            <span className="text-sm text-gray-400">
              ({agent.total_reviews || 0})
            </span>
          </div>
          <div className="text-sm font-medium">
            {agent.pricing_model === 'free' ? (
              <span className="text-green-600">Free</span>
            ) : (
              <span className="text-gray-900">${agent.price?.toFixed(2)}</span>
            )}
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>{agent.total_runs?.toLocaleString() || 0} runs</span>
            <span>{agent.model_provider}/{agent.model_name}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
