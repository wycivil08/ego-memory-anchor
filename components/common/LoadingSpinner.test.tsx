import { render, screen } from '@testing-library/react'
import { LoadingSpinner, LoadingOverlay } from './LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders with default size', () => {
    render(<LoadingSpinner />)
    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
  })

  it('renders with small size', () => {
    render(<LoadingSpinner size="sm" />)
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('h-4', 'w-4', 'border-[1.5px]')
  })

  it('renders with medium size', () => {
    render(<LoadingSpinner size="md" />)
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('h-6', 'w-6', 'border-2')
  })

  it('renders with large size', () => {
    render(<LoadingSpinner size="lg" />)
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('h-8', 'w-8', 'border-2')
  })

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-class" />)
    expect(screen.getByRole('status')).toHaveClass('custom-class')
  })

  it('has accessible label', () => {
    render(<LoadingSpinner />)
    expect(screen.getByText('加载中...')).toBeInTheDocument()
  })
})

describe('LoadingOverlay', () => {
  it('renders with default message', () => {
    render(<LoadingOverlay />)
    expect(screen.getByText('加载中...')).toBeInTheDocument()
  })

  it('renders with custom message', () => {
    render(<LoadingOverlay message="Please wait..." />)
    expect(screen.getByText('Please wait...')).toBeInTheDocument()
  })

  it('contains a spinner', () => {
    render(<LoadingOverlay />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
