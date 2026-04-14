import { render, screen } from '@testing-library/react'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('renders title correctly', () => {
    render(<EmptyState title="No items found" />)
    expect(screen.getByText('No items found')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(<EmptyState title="No items" description="Add some items to get started" />)
    expect(screen.getByText('No items')).toBeInTheDocument()
    expect(screen.getByText('Add some items to get started')).toBeInTheDocument()
  })

  it('does not render description when not provided', () => {
    render(<EmptyState title="No items" />)
    expect(screen.queryByText('Add some items')).not.toBeInTheDocument()
  })

  it('renders action button when provided', () => {
    const handleClick = vi.fn()
    render(
      <EmptyState
        title="No items"
        action={{ label: 'Add Item', onClick: handleClick }}
      />
    )
    const button = screen.getByRole('button', { name: 'Add Item' })
    expect(button).toBeInTheDocument()
  })

  it('calls onClick when action button is clicked', () => {
    const handleClick = vi.fn()
    render(
      <EmptyState
        title="No items"
        action={{ label: 'Add Item', onClick: handleClick }}
      />
    )
    screen.getByRole('button', { name: 'Add Item' }).click()
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('does not render action button when not provided', () => {
    render(<EmptyState title="No items" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders custom icon when provided', () => {
    const customIcon = <svg data-testid="custom-icon" />
    render(<EmptyState title="No items" icon={customIcon} />)
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<EmptyState title="No items" className="custom-class" />)
    const container = screen.getByText('No items').parentElement
    expect(container).toHaveClass('custom-class')
  })
})
