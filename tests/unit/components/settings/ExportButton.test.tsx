import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ExportButton } from '@/components/settings/ExportButton'

// Mock fetch globally
global.fetch = vi.fn()

describe('ExportButton', () => {
  const mockProfiles = [
    { id: 'profile-1', name: '爷爷', species: 'human' as const, relationship: 'grandfather', created_at: '2024-01-01' },
    { id: 'profile-2', name: '豆豆', species: 'pet' as const, relationship: 'pet_dog', created_at: '2024-01-02' },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render with profile selector and disabled button when no profile selected', () => {
    render(<ExportButton profiles={mockProfiles} />)

    // Check button is rendered but disabled
    const button = screen.getByRole('button', { name: /导出全部数据 \(ZIP\)/i })
    expect(button).toBeInTheDocument()
    expect(button).toBeDisabled()

    // Check profile selector is visible
    expect(screen.getByLabelText(/选择记忆空间/i)).toBeInTheDocument()
  })

  it('should enable button after profile selection', () => {
    render(<ExportButton profiles={mockProfiles} />)

    // Select a profile
    const select = screen.getByRole('combobox', { name: /选择记忆空间/i })
    fireEvent.change(select, { target: { value: 'profile-1' } })

    // Button should now be enabled
    const button = screen.getByRole('button', { name: /导出全部数据 \(ZIP\)/i })
    expect(button).toBeEnabled()
  })

  it('should show preparing state when export starts', async () => {
    // Mock fetch to return a streaming response
    const mockReader = {
      read: vi.fn()
        .mockResolvedValueOnce({ done: false, value: new Uint8Array([1, 2, 3]) })
        .mockResolvedValueOnce({ done: true, value: undefined }),
    }
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      headers: new Map([['Content-Length', '100']]),
      body: { getReader: () => mockReader },
    })

    render(<ExportButton profiles={mockProfiles} />)

    // Select a profile
    const select = screen.getByRole('combobox', { name: /选择记忆空间/i })
    fireEvent.change(select, { target: { value: 'profile-1' } })

    // Click export button
    const button = screen.getByRole('button', { name: /导出全部数据 \(ZIP\)/i })
    fireEvent.click(button)

    // Should show preparing state
    await waitFor(() => {
      expect(screen.getByText(/正在准备导出/i)).toBeInTheDocument()
    })
  })

  it('should show error state when export fails', async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      json: async () => ({ error: '导出失败' }),
    })

    render(<ExportButton profiles={mockProfiles} />)

    // Select a profile
    const select = screen.getByRole('combobox', { name: /选择记忆空间/i })
    fireEvent.change(select, { target: { value: 'profile-1' } })

    // Click export button
    const button = screen.getByRole('button', { name: /导出全部数据 \(ZIP\)/i })
    fireEvent.click(button)

    await waitFor(() => {
      // Should show error - multiple elements may contain the text, just check one exists
      const errorElements = screen.getAllByText('导出失败')
      expect(errorElements.length).toBeGreaterThan(0)
    })
  })

  it('should show retry button after error', async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      json: async () => ({ error: '网络错误' }),
    })

    render(<ExportButton profiles={mockProfiles} />)

    // Select a profile
    const select = screen.getByRole('combobox', { name: /选择记忆空间/i })
    fireEvent.change(select, { target: { value: 'profile-1' } })

    // Click export button
    const button = screen.getByRole('button', { name: /导出全部数据 \(ZIP\)/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('重试')).toBeInTheDocument()
    })
  })

  it('should be disabled when no profiles available', () => {
    render(<ExportButton profiles={[]} />)

    // Should show empty state message
    expect(screen.getByText(/暂无可导出的记忆空间/i)).toBeInTheDocument()

    // No export button should be visible
    expect(screen.queryByRole('button', { name: /导出全部数据 \(ZIP\)/i })).not.toBeInTheDocument()
  })

  it('should show empty state with helpful message when no profiles', () => {
    render(<ExportButton profiles={[]} />)

    expect(screen.getByText(/创建档案后即可导出数据/i)).toBeInTheDocument()
  })
})
