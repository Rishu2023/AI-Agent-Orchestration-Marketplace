import { useState, useCallback } from 'react'
import api from '../utils/api'

export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const request = useCallback(async (method, url, data = null, config = {}) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api[method](url, data, config)
      return response.data
    } catch (err) {
      const message = err.response?.data?.detail || err.message || 'An error occurred'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const get = useCallback((url, config) => request('get', url, null, config), [request])
  const post = useCallback((url, data, config) => request('post', url, data, config), [request])
  const put = useCallback((url, data, config) => request('put', url, data, config), [request])
  const del = useCallback((url, config) => request('delete', url, null, config), [request])

  return { loading, error, get, post, put, del, setError }
}
