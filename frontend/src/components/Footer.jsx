import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="text-xl font-bold text-gray-900">AgentHub</span>
            </div>
            <p className="text-gray-500 text-sm">
              The definitive marketplace and orchestration platform for AI agents.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Platform</h3>
            <ul className="space-y-2">
              <li><Link to="/marketplace" className="text-gray-500 hover:text-gray-900 text-sm">Marketplace</Link></li>
              <li><Link to="/builder" className="text-gray-500 hover:text-gray-900 text-sm">Agent Builder</Link></li>
              <li><Link to="/workflows" className="text-gray-500 hover:text-gray-900 text-sm">Workflows</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><span className="text-gray-500 text-sm">Documentation</span></li>
              <li><span className="text-gray-500 text-sm">API Reference</span></li>
              <li><span className="text-gray-500 text-sm">Pricing</span></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Company</h3>
            <ul className="space-y-2">
              <li><span className="text-gray-500 text-sm">About</span></li>
              <li><span className="text-gray-500 text-sm">Blog</span></li>
              <li><span className="text-gray-500 text-sm">Contact</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-8 pt-8">
          <p className="text-gray-400 text-sm text-center">
            &copy; 2024 AgentHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
