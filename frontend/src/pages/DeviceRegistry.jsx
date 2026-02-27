import React, { useState, useEffect } from 'react'

const demoDevices = [
  { id: 'd1', name: 'Warehouse Bot Alpha', device_type: 'robot', status: 'online', capabilities: ['navigation', 'pick-and-place', 'inventory-scan'], location_lat: 37.7749, location_lng: -122.4194, owner_id: 'user_1', last_seen_at: '2024-01-15T10:30:00Z', created_at: '2023-11-01T08:00:00Z' },
  { id: 'd2', name: 'Aerial Scout 7', device_type: 'drone', status: 'online', capabilities: ['aerial-survey', 'thermal-imaging', 'gps-tracking'], location_lat: 40.7128, location_lng: -74.006, owner_id: 'user_2', last_seen_at: '2024-01-15T10:28:00Z', created_at: '2023-12-10T14:00:00Z' },
  { id: 'd3', name: 'Security Cam East Wing', device_type: 'camera', status: 'offline', capabilities: ['motion-detection', 'night-vision', 'streaming'], location_lat: 51.5074, location_lng: -0.1278, owner_id: 'user_1', last_seen_at: '2024-01-14T23:45:00Z', created_at: '2023-10-15T09:00:00Z' },
  { id: 'd4', name: 'Env Sensor Grid Node 12', device_type: 'sensor', status: 'online', capabilities: ['temperature', 'humidity', 'air-quality'], location_lat: 35.6762, location_lng: 139.6503, owner_id: 'user_3', last_seen_at: '2024-01-15T10:29:00Z', created_at: '2023-09-20T11:00:00Z' },
  { id: 'd5', name: 'Edge Processor Unit 3', device_type: 'edge', status: 'error', capabilities: ['ml-inference', 'data-aggregation', 'edge-compute'], location_lat: 48.8566, location_lng: 2.3522, owner_id: 'user_2', last_seen_at: '2024-01-15T08:12:00Z', created_at: '2024-01-02T16:00:00Z' },
  { id: 'd6', name: 'Assembly Arm R-200', device_type: 'robotic_arm', status: 'online', capabilities: ['welding', 'assembly', 'precision-placement'], location_lat: 52.52, location_lng: 13.405, owner_id: 'user_1', last_seen_at: '2024-01-15T10:31:00Z', created_at: '2023-08-05T07:00:00Z' },
]

const demoCommands = [
  { id: 'c1', device_id: 'd1', command_type: 'move_to', status: 'completed', created_at: '2024-01-15T10:25:00Z' },
  { id: 'c2', device_id: 'd2', command_type: 'start_survey', status: 'in_progress', created_at: '2024-01-15T10:20:00Z' },
  { id: 'c3', device_id: 'd5', command_type: 'restart', status: 'failed', created_at: '2024-01-15T09:50:00Z' },
  { id: 'c4', device_id: 'd6', command_type: 'calibrate', status: 'completed', created_at: '2024-01-15T09:30:00Z' },
]

const demoMarketplace = [
  { id: 'm1', device_name: 'Industrial Drone Fleet Access', description: 'Access a fleet of 5 industrial drones for aerial surveys and thermal imaging across urban environments.', price_per_command: 2.5, device_type: 'drone' },
  { id: 'm2', device_name: 'Smart Sensor Network', description: 'Network of 50+ environmental sensors providing real-time temperature, humidity, and air quality data.', price_per_command: 0.1, device_type: 'sensor' },
  { id: 'm3', device_name: 'Edge ML Compute Cluster', description: 'Distributed edge computing cluster for low-latency ML inference at the edge. 99.9% uptime SLA.', price_per_command: 1.0, device_type: 'edge' },
]

const DEVICE_TYPE_ICONS = {
  robot: '🤖',
  drone: '🛸',
  camera: '📷',
  sensor: '📡',
  edge: '🖥️',
  robotic_arm: '🦾',
}

const DEVICE_TYPE_COLORS = {
  robot: 'bg-blue-100 text-blue-800',
  drone: 'bg-purple-100 text-purple-800',
  camera: 'bg-gray-100 text-gray-800',
  sensor: 'bg-teal-100 text-teal-800',
  edge: 'bg-orange-100 text-orange-800',
  robotic_arm: 'bg-indigo-100 text-indigo-800',
}

const ROLE_LIMITS = {
  user: 3,
  pro: 20,
  enterprise: Infinity,
}

const CAPABILITY_OPTIONS = [
  'navigation', 'pick-and-place', 'inventory-scan',
  'aerial-survey', 'thermal-imaging', 'gps-tracking',
  'motion-detection', 'night-vision', 'streaming',
  'temperature', 'humidity', 'air-quality',
  'ml-inference', 'data-aggregation', 'edge-compute',
  'welding', 'assembly', 'precision-placement',
]

export default function DeviceRegistry() {
  const [userRole, setUserRole] = useState('user')
  const [devices, setDevices] = useState([])
  const [commands, setCommands] = useState([])
  const [marketplace, setMarketplace] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [registerName, setRegisterName] = useState('')
  const [registerType, setRegisterType] = useState('robot')
  const [registerCapabilities, setRegisterCapabilities] = useState([])
  const [registerLat, setRegisterLat] = useState('')
  const [registerLng, setRegisterLng] = useState('')

  const [showCommandModal, setShowCommandModal] = useState(false)
  const [commandDeviceId, setCommandDeviceId] = useState(null)
  const [commandType, setCommandType] = useState('move_to')
  const [commandPayload, setCommandPayload] = useState('')

  useEffect(() => {
    fetchDeviceData()
  }, [])

  async function fetchDeviceData() {
    setLoading(true)
    setError(null)
    try {
      const [devicesRes, commandsRes, marketplaceRes] = await Promise.allSettled([
        fetch('/api/v1/devices/'),
        fetch('/api/v1/devices/commands/recent'),
        fetch('/api/v1/devices/marketplace'),
      ])

      if (devicesRes.status === 'fulfilled' && devicesRes.value.ok) {
        const data = await devicesRes.value.json()
        setDevices(Array.isArray(data) ? data : data.devices ?? [])
      } else {
        setDevices(demoDevices)
      }

      if (commandsRes.status === 'fulfilled' && commandsRes.value.ok) {
        const data = await commandsRes.value.json()
        setCommands(Array.isArray(data) ? data : data.commands ?? [])
      } else {
        setCommands(demoCommands)
      }

      if (marketplaceRes.status === 'fulfilled' && marketplaceRes.value.ok) {
        const data = await marketplaceRes.value.json()
        setMarketplace(Array.isArray(data) ? data : data.listings ?? [])
      } else {
        setMarketplace(demoMarketplace)
      }
    } catch (err) {
      setError('Failed to load device data. Showing demo data.')
      setDevices(demoDevices)
      setCommands(demoCommands)
      setMarketplace(demoMarketplace)
    } finally {
      setLoading(false)
    }
  }

  async function handleRegisterDevice(e) {
    e.preventDefault()
    if (!registerName.trim()) return
    const limit = ROLE_LIMITS[userRole]
    if (devices.length >= limit) {
      setError(`Device limit reached for ${userRole} role (${limit === Infinity ? 'unlimited' : limit} devices).`)
      return
    }
    const newDevice = {
      id: `d-${Date.now()}`,
      name: registerName,
      device_type: registerType,
      status: 'online',
      capabilities: registerCapabilities,
      location_lat: parseFloat(registerLat) || 0,
      location_lng: parseFloat(registerLng) || 0,
      owner_id: 'current_user',
      last_seen_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }
    try {
      const res = await fetch('/api/v1/devices/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDevice),
      })
      if (res.ok) {
        const data = await res.json()
        setDevices((prev) => [data, ...prev])
      } else {
        setDevices((prev) => [newDevice, ...prev])
      }
    } catch {
      setDevices((prev) => [newDevice, ...prev])
    }
    setRegisterName('')
    setRegisterType('robot')
    setRegisterCapabilities([])
    setRegisterLat('')
    setRegisterLng('')
    setShowRegisterModal(false)
  }

  async function handleSendCommand(e) {
    e.preventDefault()
    if (!commandDeviceId) return
    const newCommand = {
      id: `c-${Date.now()}`,
      device_id: commandDeviceId,
      command_type: commandType,
      status: 'in_progress',
      created_at: new Date().toISOString(),
    }
    try {
      const res = await fetch(`/api/v1/devices/${commandDeviceId}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command_type: commandType, payload: commandPayload }),
      })
      if (res.ok) {
        const data = await res.json()
        setCommands((prev) => [data, ...prev])
      } else {
        setCommands((prev) => [newCommand, ...prev])
      }
    } catch {
      setCommands((prev) => [newCommand, ...prev])
    }
    setCommandType('move_to')
    setCommandPayload('')
    setCommandDeviceId(null)
    setShowCommandModal(false)
  }

  function handleDeregister(deviceId) {
    setDevices((prev) => prev.filter((d) => d.id !== deviceId))
  }

  function toggleCapability(cap) {
    setRegisterCapabilities((prev) =>
      prev.includes(cap) ? prev.filter((c) => c !== cap) : [...prev, cap]
    )
  }

  function getDeviceName(deviceId) {
    const device = devices.find((d) => d.id === deviceId)
    return device ? device.name : deviceId
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const onlineCount = devices.filter((d) => d.status === 'online').length
  const commandsToday = commands.length
  const edgeCount = devices.filter((d) => d.device_type === 'edge').length
  const limit = ROLE_LIMITS[userRole]

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="animate-spin inline-block w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full mb-4" />
        <p className="text-gray-500">Loading device registry...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Physical Device Registry</h1>
          <p className="text-gray-500">Register, monitor, and send commands to physical devices across your infrastructure</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Role:</label>
          <select
            value={userRole}
            onChange={(e) => setUserRole(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="user">User</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Hero / Stats */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 rounded-2xl p-8 text-white mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-primary-200 text-sm font-medium mb-1">Device Fleet Overview</p>
            <p className="text-5xl font-bold">{devices.length}</p>
            <p className="text-primary-200 text-sm mt-1">
              registered devices · Limit: {limit === Infinity ? 'Unlimited' : `${devices.length}/${limit}`} ({userRole})
            </p>
          </div>
          <div className="flex gap-3 mt-6 md:mt-0">
            <button
              onClick={() => setShowRegisterModal(true)}
              className="bg-white text-primary-700 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition"
            >
              + Register Device
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Total Devices</p>
          <p className="text-2xl font-bold text-gray-900">{devices.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Online Now</p>
          <p className="text-2xl font-bold text-green-600">{onlineCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Commands Today</p>
          <p className="text-2xl font-bold text-gray-900">{commandsToday}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Edge Deployments</p>
          <p className="text-2xl font-bold text-gray-900">{edgeCount}</p>
        </div>
      </div>

      {/* Device List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Registered Devices</h2>
        </div>
        {devices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {devices.map((device) => (
              <div key={device.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{DEVICE_TYPE_ICONS[device.device_type] || '📟'}</span>
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{device.name}</h3>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${DEVICE_TYPE_COLORS[device.device_type] || 'bg-gray-100 text-gray-800'}`}>
                    {device.device_type.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mb-3">
                  <span className={`w-2 h-2 rounded-full ${
                    device.status === 'online' ? 'bg-green-500'
                      : device.status === 'offline' ? 'bg-red-500'
                      : 'bg-yellow-500'
                  }`} />
                  <span className="text-xs text-gray-500 capitalize">{device.status}</span>
                  <span className="text-xs text-gray-400 ml-auto">Last seen: {formatDate(device.last_seen_at)}</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {device.capabilities.map((cap) => (
                    <span key={cap} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                      {cap}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 text-xs font-medium text-primary-600 border border-primary-200 rounded-lg py-1.5 hover:bg-primary-50 transition">
                    View
                  </button>
                  <button
                    onClick={() => { setCommandDeviceId(device.id); setShowCommandModal(true) }}
                    className="flex-1 text-xs font-medium text-white bg-primary-600 rounded-lg py-1.5 hover:bg-primary-700 transition"
                  >
                    Send Command
                  </button>
                  <button
                    onClick={() => handleDeregister(device.id)}
                    className="text-xs font-medium text-red-600 border border-red-200 rounded-lg px-2 py-1.5 hover:bg-red-50 transition"
                  >
                    Deregister
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📟</div>
            <p className="text-gray-500">No devices registered yet</p>
          </div>
        )}
      </div>

      {/* Device Map Placeholder */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Device Map</h2>
        </div>
        <div className="flex items-center justify-center h-64 bg-gray-50">
          <div className="text-center">
            <div className="text-4xl mb-3">🗺️</div>
            <p className="text-gray-500 text-sm">World map showing device locations</p>
            <p className="text-gray-400 text-xs mt-1">{devices.filter((d) => d.status === 'online').length} devices online across {new Set(devices.map((d) => `${d.location_lat},${d.location_lng}`)).size} locations</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Recent Commands */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Commands</h2>
          </div>
          {commands.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-6 py-3 text-gray-500 font-medium">Command</th>
                    <th className="px-6 py-3 text-gray-500 font-medium">Device</th>
                    <th className="px-6 py-3 text-gray-500 font-medium">Status</th>
                    <th className="px-6 py-3 text-gray-500 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {commands.map((cmd) => (
                    <tr key={cmd.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-gray-900 font-medium">{cmd.command_type}</td>
                      <td className="px-6 py-3 text-gray-700">{getDeviceName(cmd.device_id)}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          cmd.status === 'completed' ? 'bg-green-100 text-green-800'
                            : cmd.status === 'in_progress' ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {cmd.status === 'completed' ? '✓ Completed' : cmd.status === 'in_progress' ? '⟳ In Progress' : '✗ Failed'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-500">{formatDate(cmd.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-gray-500">No commands sent yet</p>
            </div>
          )}
        </div>

        {/* Role-based Limits */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Plan Limits</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {Object.entries(ROLE_LIMITS).map(([role, roleLimit]) => (
              <div key={role} className={`px-6 py-4 flex items-center justify-between ${role === userRole ? 'bg-primary-50' : 'hover:bg-gray-50'}`}>
                <div>
                  <p className={`text-sm font-medium ${role === userRole ? 'text-primary-700' : 'text-gray-900'} capitalize`}>{role}</p>
                  <p className="text-xs text-gray-500">{roleLimit === Infinity ? 'Unlimited devices' : `Up to ${roleLimit} devices`}</p>
                </div>
                {role === userRole && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                    Current
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Device Marketplace */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Device Marketplace</h2>
        </div>
        {marketplace.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
            {marketplace.map((listing) => (
              <div key={listing.id} className="px-6 py-5 hover:bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{DEVICE_TYPE_ICONS[listing.device_type] || '📟'}</span>
                  <p className="text-sm font-semibold text-gray-900">{listing.device_name}</p>
                </div>
                <p className="text-xs text-gray-500 mb-3">{listing.description}</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-primary-600">{listing.price_per_command} credits/command</p>
                  <button className="text-xs font-medium text-primary-600 border border-primary-200 rounded-lg px-3 py-1.5 hover:bg-primary-50 transition">
                    Browse
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🏪</div>
            <p className="text-gray-500">No marketplace listings available</p>
          </div>
        )}
      </div>

      {/* Register Device Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Register Device</h3>
              <button onClick={() => setShowRegisterModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleRegisterDevice}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Device Name</label>
              <input
                type="text"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                placeholder="Enter device name"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
                required
              />
              <label className="block text-sm font-medium text-gray-700 mb-2">Device Type</label>
              <select
                value={registerType}
                onChange={(e) => setRegisterType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
              >
                <option value="robot">Robot</option>
                <option value="drone">Drone</option>
                <option value="camera">Camera</option>
                <option value="sensor">Sensor</option>
                <option value="edge">Edge Processor</option>
                <option value="robotic_arm">Robotic Arm</option>
              </select>
              <label className="block text-sm font-medium text-gray-700 mb-2">Capabilities</label>
              <div className="flex flex-wrap gap-2 mb-4">
                {CAPABILITY_OPTIONS.map((cap) => (
                  <button
                    key={cap}
                    type="button"
                    onClick={() => toggleCapability(cap)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition ${
                      registerCapabilities.includes(cap)
                        ? 'bg-primary-100 text-primary-700 border-primary-300'
                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {cap}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={registerLat}
                    onChange={(e) => setRegisterLat(e.target.value)}
                    placeholder="e.g. 37.7749"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={registerLng}
                    onChange={(e) => setRegisterLng(e.target.value)}
                    placeholder="e.g. -122.4194"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowRegisterModal(false)} className="flex-1 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition">
                  Register Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send Command Modal */}
      {showCommandModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Send Command</h3>
              <button onClick={() => { setShowCommandModal(false); setCommandDeviceId(null) }} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Sending to: <span className="font-medium text-gray-900">{getDeviceName(commandDeviceId)}</span></p>
            <form onSubmit={handleSendCommand}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Command Type</label>
              <select
                value={commandType}
                onChange={(e) => setCommandType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
              >
                <option value="move_to">Move To</option>
                <option value="start_survey">Start Survey</option>
                <option value="restart">Restart</option>
                <option value="calibrate">Calibrate</option>
                <option value="stop">Stop</option>
                <option value="update_firmware">Update Firmware</option>
                <option value="run_diagnostic">Run Diagnostic</option>
              </select>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payload (JSON)</label>
              <textarea
                value={commandPayload}
                onChange={(e) => setCommandPayload(e.target.value)}
                placeholder='{"target": "zone_a", "speed": 0.5}'
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4 font-mono"
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowCommandModal(false); setCommandDeviceId(null) }} className="flex-1 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition">
                  Send Command
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
