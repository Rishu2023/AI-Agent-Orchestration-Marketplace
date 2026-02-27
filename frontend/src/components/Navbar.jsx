import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="text-xl font-bold text-gray-900">AgentHub</span>
            </Link>
            <div className="hidden md:flex ml-10 space-x-8">
              <Link to="/marketplace" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Marketplace
              </Link>
              <Link to="/builder" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Build Agent
              </Link>
              <Link to="/workflows" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Workflows
              </Link>
              <Link to="/economy" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Economy
              </Link>
              <Link to="/federation" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Federation
              </Link>
              <Link to="/memory" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Memory
              </Link>
              <Link to="/benchmarks" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Benchmarks
              </Link>
              <Link to="/training" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Training
              </Link>
              <Link to="/research" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Research
              </Link>
              <Link to="/governance" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Governance
              </Link>
              <Link to="/billing" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Billing
              </Link>
              <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Dashboard
              </Link>
              <Link to="/admin" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Admin
              </Link>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <button className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
              Sign In
            </button>
            <button className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition">
              Get Started
            </button>
          </div>
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900 p-2"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link to="/marketplace" className="block px-3 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium">
              Marketplace
            </Link>
            <Link to="/builder" className="block px-3 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium">
              Build Agent
            </Link>
            <Link to="/workflows" className="block px-3 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium">
              Workflows
            </Link>
            <Link to="/economy" className="block px-3 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium">
              Economy
            </Link>
            <Link to="/federation" className="block px-3 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium">
              Federation
            </Link>
            <Link to="/memory" className="block px-3 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium">
              Memory
            </Link>
            <Link to="/benchmarks" className="block px-3 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium">
              Benchmarks
            </Link>
            <Link to="/training" className="block px-3 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium">
              Training
            </Link>
            <Link to="/research" className="block px-3 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium">
              Research
            </Link>
            <Link to="/governance" className="block px-3 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium">
              Governance
            </Link>
            <Link to="/billing" className="block px-3 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium">
              Billing
            </Link>
            <Link to="/dashboard" className="block px-3 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium">
              Dashboard
            </Link>
            <Link to="/admin" className="block px-3 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium">
              Admin
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
