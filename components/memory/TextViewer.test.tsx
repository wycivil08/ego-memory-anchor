import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TextViewer } from './TextViewer'

describe('TextViewer', () => {
  const defaultProps = {
    content: '这是一段测试文字内容。',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders text content', () => {
    render(<TextViewer {...defaultProps} />)
    expect(screen.getByText('这是一段测试文字内容。')).toBeInTheDocument()
  })

  it('displays header', () => {
    render(<TextViewer {...defaultProps} />)
    expect(screen.getByText('文字内容')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(<TextViewer {...defaultProps} onClose={onClose} />)

    const closeButton = screen.getByRole('button')
    fireEvent.click(closeButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('renders multiline content', () => {
    const multilineContent = `第一行文字
第二行文字
第三行文字`

    render(<TextViewer content={multilineContent} />)

    expect(screen.getByText('第一行文字')).toBeInTheDocument()
    expect(screen.getByText('第二行文字')).toBeInTheDocument()
    expect(screen.getByText('第三行文字')).toBeInTheDocument()
  })

  it('renders bold text with ** markup', () => {
    render(<TextViewer content="这是**粗体文字**测试" />)

    const boldElement = screen.getByText('粗体文字')
    expect(boldElement).toBeInTheDocument()
    expect(boldElement.tagName).toBe('STRONG')
  })

  it('renders italic text with * markup', () => {
    render(<TextViewer content="这是*斜体文字*测试" />)

    const italicElement = screen.getByText('斜体文字')
    expect(italicElement).toBeInTheDocument()
    expect(italicElement.tagName).toBe('EM')
  })

  it('renders blockquote with > markup', () => {
    render(<TextViewer content="> 这是引用的文字" />)

    const blockquote = document.querySelector('blockquote')
    expect(blockquote).toBeInTheDocument()
    expect(blockquote).toHaveTextContent('这是引用的文字')
  })

  it('shows expand button for long content', () => {
    const longContent = '测试内容 '.repeat(100)
    render(<TextViewer content={longContent} />)

    await waitFor(() => {
      const expandButton = screen.getByRole('button', { name: '展开全部' })
      expect(expandButton).toBeInTheDocument()
    })
  })

  it('expands content when expand button is clicked', async () => {
    const longContent = '测试内容 '.repeat(100)
    render(<TextViewer content={longContent} />)

    await waitFor(() => {
      const expandButton = screen.getByRole('button', { name: '展开全部' })
      fireEvent.click(expandButton)
    })

    await waitFor(() => {
      const collapseButton = screen.getByRole('button', { name: '收起' })
      expect(collapseButton).toBeInTheDocument()
    })
  })

  it('applies custom className', () => {
    const { container } = render(<TextViewer {...defaultProps} className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('does not show expand button for short content', () => {
    render(<TextViewer content="短内容" />)

    const expandButton = screen.queryByRole('button', { name: '展开全部' })
    expect(expandButton).not.toBeInTheDocument()
  })
})
