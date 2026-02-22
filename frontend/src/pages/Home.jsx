import React from 'react'
import { Link } from 'react-router-dom'
import AgentCard from '../components/AgentCard'

const featuredAgents = [
  {
    id: '1',
    name: 'Research Assistant Pro',
    description: 'Comprehensive research agent that can analyze papers, summarize findings, and generate literature reviews with citations.',
    category: 'research',
    pricing_model: 'per_use',
    price: 0.05,
    average_rating: 4.8,
    total_reviews: 342,
    total_runs: 15420,
    model_provider: 'anthropic',
    model_name: 'claude-3',
  },
  {
    id: '2',
    name: 'CodeCraft',
    description: 'AI coding assistant that writes, reviews, and refactors code across 20+ programming languages with best practices.',
    category: 'coding',
    pricing_model: 'subscription',
    price: 29.99,
    average_rating: 4.9,
    total_reviews: 891,
    total_runs: 52100,
    model_provider: 'openai',
    model_name: 'gpt-4',
  },
  {
    id: '3',
    name: 'Content Writer AI',
    description: 'Professional content writer that creates blog posts, articles, social media content, and marketing copy.',
    category: 'writing',
    pricing_model: 'per_use',
    price: 0.10,
    average_rating: 4.6,
    total_reviews: 567,
    total_runs: 28900,
    model_provider: 'openai',
    model_name: 'gpt-4',
  },
  {
    id: '4',
    name: 'Data Analyzer',
    description: 'Analyzes datasets, generates visualizations, identifies trends, and produces comprehensive analytical reports.',
    category: 'analysis',
    pricing_model: 'free',
    price: 0,
    average_rating: 4.5,
    total_reviews: 234,
    total_runs: 12300,
    model_provider: 'anthropic',
    model_name: 'claude-3',
  },
  {
    id: '5',
    name: 'Marketing Strategist',
    description: 'Creates comprehensive marketing strategies, campaign plans, audience analysis, and competitive research.',
    category: 'marketing',
    pricing_model: 'subscription',
    price: 49.99,
    average_rating: 4.7,
    total_reviews: 189,
    total_runs: 8900,
    model_provider: 'openai',
    model_name: 'gpt-4',
  },
  {
    id: '6',
    name: 'Sales Outreach Bot',
    description: 'Generates personalized sales emails, follow-ups, and prospecting messages based on lead profiles.',
    category: 'sales',
    pricing_model: 'per_use',
    price: 0.02,
    average_rating: 4.4,
    total_reviews: 156,
    total_runs: 34500,
    model_provider: 'openai',
    model_name: 'gpt-4',
  },
]

const stats = [
  { label: 'AI Agents', value: '2,500+' },
  { label: 'Active Users', value: '50,000+' },
  { label: 'Workflows Created', value: '125,000+' },
  { label: 'Tasks Completed', value: '10M+' },
]

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              The App Store for{' '}
              <span className="text-primary-200">AI Agents</span>
            </h1>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Discover, deploy, and orchestrate AI agents to accomplish complex tasks.
              Build powerful workflows with drag-and-drop simplicity.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/marketplace"
                className="bg-white text-primary-700 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary-50 transition w-full sm:w-auto"
              >
                Explore Marketplace
              </Link>
              <Link
                to="/builder"
                className="border-2 border-white text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white/10 transition w-full sm:w-auto"
              >
                Build an Agent
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary-600">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need for AI Agent Orchestration
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              From discovery to deployment, we provide the complete platform for working with AI agents.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 border border-gray-200 hover:shadow-lg transition">
              <div className="text-4xl mb-4">🏪</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Agent Marketplace</h3>
              <p className="text-gray-500">
                Browse thousands of AI agents across categories. Compare features, read reviews,
                and deploy with one click.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 border border-gray-200 hover:shadow-lg transition">
              <div className="text-4xl mb-4">🔧</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Agent Builder</h3>
              <p className="text-gray-500">
                Create custom AI agents with an intuitive builder. Configure prompts, tools,
                and publish to the marketplace.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 border border-gray-200 hover:shadow-lg transition">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Workflow Orchestration</h3>
              <p className="text-gray-500">
                Chain agents together with visual workflows. Add conditional logic,
                parallel execution, and human checkpoints.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Agents */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Featured Agents</h2>
              <p className="text-gray-500 mt-2">Top-rated agents ready to deploy</p>
            </div>
            <Link
              to="/marketplace"
              className="text-primary-600 hover:text-primary-700 font-medium text-sm"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Build Your AI Agent?
          </h2>
          <p className="text-primary-100 text-lg mb-8">
            Join thousands of builders creating the future of AI-powered automation.
          </p>
          <Link
            to="/builder"
            className="inline-block bg-white text-primary-700 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary-50 transition"
          >
            Start Building for Free
          </Link>
        </div>
      </section>
    </div>
  )
}
