import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Marketplace from './pages/Marketplace'
import AgentDetail from './pages/AgentDetail'
import AgentBuilder from './pages/AgentBuilder'
import WorkflowBuilder from './pages/WorkflowBuilder'
import Dashboard from './pages/Dashboard'
import ExecutionHistory from './pages/ExecutionHistory'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/marketplace" replace />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/marketplace/:id" element={<AgentDetail />} />
            <Route path="/builder" element={<AgentBuilder />} />
            <Route path="/builder/:id" element={<AgentBuilder />} />
            <Route path="/workflows" element={<WorkflowBuilder />} />
            <Route path="/workflows/:id" element={<WorkflowBuilder />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/executions" element={<ExecutionHistory />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
