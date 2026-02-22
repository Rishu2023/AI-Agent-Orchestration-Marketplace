import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

describe('App', () => {
  it('renders the navigation', () => {
    render(<App />)
    const elements = screen.getAllByText('AgentHub')
    expect(elements.length).toBeGreaterThan(0)
  })

  it('renders the marketplace link', () => {
    render(<App />)
    const links = screen.getAllByText('Marketplace')
    expect(links.length).toBeGreaterThan(0)
  })
})
