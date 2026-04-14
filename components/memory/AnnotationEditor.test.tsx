import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AnnotationEditor } from './AnnotationEditor'

// Mock onSave function
const mockOnSave = vi.fn().mockResolvedValue({ error: null })
const mockOnCancel = vi.fn()

describe('AnnotationEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders read mode when annotation exists and not editing', () => {
    render(
      <AnnotationEditor
        memoryId="test-id"
        initialAnnotation="这是一段测试注释"
        onSave={mockOnSave}
      />
    )

    expect(screen.getByText('这是一段测试注释')).toBeInTheDocument()
    expect(screen.getByText('编辑')).toBeInTheDocument()
  })

  it('renders edit mode when no initial annotation', () => {
    render(
      <AnnotationEditor
        memoryId="test-id"
        initialAnnotation={null}
        onSave={mockOnSave}
      />
    )

    expect(screen.getByPlaceholderText('添加关于这段记忆的故事或注释...')).toBeInTheDocument()
  })

  it('shows edit button and enters edit mode when clicking edit', async () => {
    render(
      <AnnotationEditor
        memoryId="test-id"
        initialAnnotation="原有注释"
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    )

    const editButton = screen.getByText('编辑')
    fireEvent.click(editButton)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('添加关于这段记忆的故事或注释...')).toBeInTheDocument()
    })
  })

  it('calls onSave with correct arguments when saving', async () => {
    render(
      <AnnotationEditor
        memoryId="test-memory-id"
        initialAnnotation={null}
        onSave={mockOnSave}
      />
    )

    const textarea = screen.getByPlaceholderText('添加关于这段记忆的故事或注释...')
    fireEvent.change(textarea, { target: { value: '新注释内容' } })

    // Find and click save button
    const saveButton = screen.getByText('保存')
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith('test-memory-id', '新注释内容')
    })
  })

  it('shows cancel button when there are unsaved changes', async () => {
    render(
      <AnnotationEditor
        memoryId="test-id"
        initialAnnotation={null}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    )

    const textarea = screen.getByPlaceholderText('添加关于这段记忆的故事或注释...')
    fireEvent.change(textarea, { target: { value: '修改的内容' } })

    await waitFor(() => {
      expect(screen.getByText('取消')).toBeInTheDocument()
      expect(screen.getByText('保存')).toBeInTheDocument()
    })
  })

  it('calls onCancel when cancel is clicked', async () => {
    render(
      <AnnotationEditor
        memoryId="test-id"
        initialAnnotation={null}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    )

    const textarea = screen.getByPlaceholderText('添加关于这段记忆的故事或注释...')
    fireEvent.change(textarea, { target: { value: '修改的内容' } })

    const cancelButton = screen.getByText('取消')
    fireEvent.click(cancelButton)

    await waitFor(() => {
      expect(mockOnCancel).toHaveBeenCalled()
    })
  })

  it('displays character count', async () => {
    render(
      <AnnotationEditor
        memoryId="test-id"
        initialAnnotation={null}
        onSave={mockOnSave}
      />
    )

    const textarea = screen.getByPlaceholderText('添加关于这段记忆的故事或注释...')
    fireEvent.change(textarea, { target: { value: '测试内容' } })

    await waitFor(() => {
      expect(screen.getByText(/^4 \/ 2000$/)).toBeInTheDocument()
    })
  })
})
