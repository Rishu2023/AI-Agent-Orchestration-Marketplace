import { Link } from 'react-router-dom'
import { Star, Zap, DollarSign, Crown } from 'lucide-react'

const CATEGORY_COLORS = {
  'Customer Support': 'bg-green-100 text-green-700',
  'Data Analysis': 'bg-purple-100 text-purple-700',
  'Code Assistant': 'bg-blue-100 text-blue-700',
  'Content Creation': 'bg-pink-100 text-pink-700',
  'Research': 'bg-yellow-100 text-yellow-700',
  'Finance': 'bg-emerald-100 text-emerald-700',
  'Healthcare': 'bg-red-100 text-red-700',
  'Legal': 'bg-indigo-100 text-indigo-700',
  'Marketing': 'bg-orange-100 text-orange-700',
  'Education': 'bg-cyan-100 text-cyan-700',
  'Productivity': 'bg-teal-100 text-teal-700',
  'Other': 'bg-gray-100 text-gray-700',
}

const PRICING_BADGE = {
  free: { label: 'Free', icon: Zap, className: 'bg-green-100 text-green-700' },
  per_use: { label: 'Per Use', icon: DollarSign, className: 'bg-blue-100 text-blue-700' },
  subscription: { label: 'Subscription', icon: Crown, className: 'bg-purple-100 text-purple-700' },
}

function StarRating({ rating, count }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
      <span className="text-xs text-gray-500 ml-1">{rating.toFixed(1)} ({count})</span>
    </div>
  )
}

export default function AgentCard({ agent }) {
  const categoryColor = CATEGORY_COLORS[agent.category] || CATEGORY_COLORS['Other']
  const pricing = PRICING_BADGE[agent.pricing_type] || PRICING_BADGE.free
  const PricingIcon = pricing.icon

  return (
    <Link to={`/marketplace/${agent.id}`} className="block group">
      <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-blue-200 transition-all duration-200 h-full flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${categoryColor}`}>
            {agent.category}
          </span>
          <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${pricing.className}`}>
            <PricingIcon className="w-3 h-3" />
            {agent.pricing_type === 'free' ? 'Free' : agent.pricing_type === 'per_use' ? `$${agent.price}` : `$${agent.price}/mo`}
          </span>
        </div>

        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-1">
          {agent.name}
        </h3>

        <p className="text-sm text-gray-500 line-clamp-2 flex-1 mb-4">
          {agent.description}
        </p>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
          <StarRating rating={agent.rating} count={agent.review_count} />
          <span className="text-xs text-gray-400">{agent.execution_count?.toLocaleString()} runs</span>
        </div>
      </div>
    </Link>
  )
}
