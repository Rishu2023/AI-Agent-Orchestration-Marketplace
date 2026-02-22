import { Link, useLocation } from 'react-router-dom'
import { Bot, LayoutDashboard, ShoppingBag, Wrench, GitBranch, History, LogOut, LogIn } from 'lucide-react'

const navLinks = [
  { to: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
  { to: '/builder', label: 'Agent Builder', icon: Wrench },
  { to: '/workflows', label: 'Workflows', icon: GitBranch },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/executions', label: 'History', icon: History },
]

export default function Navbar() {
  const location = useLocation()
  const token = localStorage.getItem('token')

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/marketplace" className="flex items-center gap-2 font-bold text-xl text-blue-600">
            <Bot className="w-7 h-7" />
            <span>AgentHub</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname.startsWith(to)
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>

          <div>
            {token ? (
              <button
                onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/marketplace'; }}
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            ) : (
              <Link to="/dashboard" className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium">
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
