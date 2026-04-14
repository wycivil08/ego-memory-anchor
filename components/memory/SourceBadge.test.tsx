import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SourceBadge } from './SourceBadge'

describe('SourceBadge', () => {
  it('renders with default label', () => {
    render(<SourceBadge />)
    expect(screen.getByText('原始记录')).toBeInTheDocument()
  })

  it('renders with custom label', () => {
    render(<SourceBadge label="自定义来源" />)
    expect(screen.getByText('自定义来源')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<SourceBadge className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('has correct styling classes', () => {
    const { container } = render(<SourceBadge />)
    const span = container.querySelector('span')
    expect(span).toHaveClass('inline-flex', 'items-center', 'rounded-full', 'bg-amber-50', 'px-2', 'py-0.5', 'text-xs', 'text-amber-600', 'ring-1', 'ring-amber-100')
  })
})
