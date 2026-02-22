import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Star, Zap, DollarSign, Crown, Play, ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import { useApi } from '../hooks/useApi'

function StarRating({ rating, interactive = false, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-5 h-5 cursor-pointer transition-colors ${
            star <= (interactive ? hover || rating : Math.round(rating))
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
          }`}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onChange && onChange(star)}
        />
      ))}
    </div>
  )
}

export default function AgentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { get, post, loading } = useApi()
  const [agent, setAgent] = useState(null)
  const [reviews, setReviews] = useState([])
  const [executing, setExecuting] = useState(false)
  const [execResult, setExecResult] = useState(null)
  const [prompt, setPrompt] = useState('')
  const [newRating, setNewRating] = useState(0)
  const [comment, setComment] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)

  useEffect(() => {
    fetchAgent()
    fetchReviews()
  }, [id])

  async function fetchAgent() {
    try {
      const data = await get(`/marketplace/agents/${id}`)
      setAgent(data)
    } catch (_) { navigate('/marketplace') }
  }

  async function fetchReviews() {
    try {
      const data = await get(`/users/reviews/${id}`)
      setReviews(data)
    } catch (_) {}
  }

  async function handleExecute() {
    if (!localStorage.getItem('token')) {
      alert('Please sign in to execute agents')
      return
    }
    setExecuting(true)
    setExecResult(null)
    try {
      const result = await post(`/executions/agents/${id}/run`, { input_data: JSON.stringify({ prompt }) })
      setExecResult({ success: true, data: result })
    } catch (err) {
      setExecResult({ success: false, error: err.response?.data?.detail || 'Execution failed' })
    } finally {
      setExecuting(false)
    }
  }

  async function handleReview(e) {
    e.preventDefault()
    if (!localStorage.getItem('token')) { alert('Please sign in to leave a review'); return }
    if (!newRating) { alert('Please select a rating'); return }
    setReviewSubmitting(true)
    try {
      await post('/users/reviews', { agent_id: parseInt(id), rating: newRating, comment })
      setNewRating(0)
      setComment('')
      fetchReviews()
      fetchAgent()
    } catch (_) {} finally {
      setReviewSubmitting(false)
    }
  }

  if (loading && !agent) {
    return <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/3 mb-4" /></div>
  }
  if (!agent) return null

  const pricingLabel = agent.pricing_type === 'free' ? 'Free' : agent.pricing_type === 'per_use' ? `$${agent.price} / run` : `$${agent.price} / month`

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => navigate('/marketplace')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Marketplace
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <span className="inline-block bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full mb-3">
              {agent.category}
            </span>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{agent.name}</h1>
            <p className="text-gray-500">{agent.description}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 shrink-0 min-w-[180px]">
            <div className="text-2xl font-bold text-gray-900 mb-1">{pricingLabel}</div>
            <div className="flex items-center gap-1 mb-3">
              <StarRating rating={agent.rating} />
              <span className="text-sm text-gray-500">({agent.review_count})</span>
            </div>
            <div className="text-xs text-gray-400">{agent.execution_count?.toLocaleString()} executions</div>
          </div>
        </div>

        {/* Execute */}
        <div className="border-t border-gray-100 pt-6">
          <h3 className="font-semibold text-gray-900 mb-3">Try this agent</h3>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt here..."
            rows={4}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3 resize-none"
          />
          <button
            onClick={handleExecute}
            disabled={executing || !prompt.trim()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-xl transition-colors"
          >
            <Play className="w-4 h-4" />
            {executing ? 'Running...' : 'Execute Agent'}
          </button>

          {execResult && (
            <div className={`mt-4 rounded-xl p-4 ${execResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                {execResult.success
                  ? <CheckCircle className="w-4 h-4 text-green-600" />
                  : <XCircle className="w-4 h-4 text-red-600" />}
                <span className={`text-sm font-medium ${execResult.success ? 'text-green-700' : 'text-red-700'}`}>
                  {execResult.success ? 'Execution completed' : 'Execution failed'}
                </span>
              </div>
              {execResult.success && execResult.data.output_data && (
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(JSON.parse(execResult.data.output_data), null, 2)}
                </pre>
              )}
              {!execResult.success && <p className="text-sm text-red-600">{execResult.error}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <h3 className="font-semibold text-gray-900 mb-6">Reviews ({reviews.length})</h3>

        <form onSubmit={handleReview} className="border border-gray-200 rounded-xl p-4 mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">Leave a review</p>
          <div className="mb-3">
            <StarRating rating={newRating} interactive onChange={setNewRating} />
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your review (optional)"
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3 resize-none"
          />
          <button type="submit" disabled={reviewSubmitting || !newRating} className="btn-primary text-sm disabled:opacity-50">
            {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>

        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
              <div className="flex items-center gap-2 mb-1">
                <StarRating rating={review.rating} />
                <span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</span>
              </div>
              {review.comment && <p className="text-sm text-gray-600">{review.comment}</p>}
            </div>
          ))}
          {reviews.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No reviews yet. Be the first!</p>}
        </div>
      </div>
    </div>
  )
}
