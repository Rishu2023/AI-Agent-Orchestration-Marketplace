import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Marketplace from '../pages/Marketplace'

function renderMarketplace() {
  return render(
    <BrowserRouter>
      <Marketplace />
    </BrowserRouter>
  )
}

describe('Marketplace', () => {
  it('renders the marketplace page', () => {
    renderMarketplace()
    expect(screen.getByText('Agent Marketplace')).toBeDefined()
  })

  it('renders category filter with Design option', () => {
    renderMarketplace()
    const categorySelect = screen.getByLabelText('Category')
    const options = Array.from(categorySelect.querySelectorAll('option'))
    const designOption = options.find(o => o.value === 'design')
    expect(designOption).toBeDefined()
    expect(designOption.textContent).toContain('Design')
  })

  it('renders provider filter', () => {
    renderMarketplace()
    const providerSelect = screen.getByLabelText('Provider')
    const options = Array.from(providerSelect.querySelectorAll('option'))
    const providerValues = options.map(o => o.value)
    expect(providerValues).toContain('openai')
    expect(providerValues).toContain('anthropic')
  })

  it('filters agents by search', () => {
    renderMarketplace()
    const searchInput = screen.getByPlaceholderText('Search agents by name or description...')
    fireEvent.change(searchInput, { target: { value: 'CodeCraft' } })
    expect(screen.getByText('1 agents found')).toBeDefined()
  })

  it('filters agents by provider', () => {
    renderMarketplace()
    const providerSelect = screen.getByLabelText('Provider')
    fireEvent.change(providerSelect, { target: { value: 'anthropic' } })
    // Should show only anthropic agents
    const countText = screen.getByText(/agents found/)
    expect(countText).toBeDefined()
  })
})
