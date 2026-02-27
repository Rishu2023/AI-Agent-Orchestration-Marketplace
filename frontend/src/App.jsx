import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Marketplace from './pages/Marketplace'
import AgentDetail from './pages/AgentDetail'
import AgentBuilder from './pages/AgentBuilder'
import WorkflowBuilder from './pages/WorkflowBuilder'
import Home from './pages/Home'
import EconomyDashboard from './pages/EconomyDashboard'
import FederationDashboard from './pages/FederationDashboard'
import MemoryManagement from './pages/MemoryManagement'

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/agents/:id" element={<AgentDetail />} />
            <Route path="/builder" element={<AgentBuilder />} />
            <Route path="/workflows" element={<WorkflowBuilder />} />
            <Route path="/economy" element={<EconomyDashboard />} />
            <Route path="/federation" element={<FederationDashboard />} />
            <Route path="/memory" element={<MemoryManagement />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}
