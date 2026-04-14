'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface AnnotationEditorProps {
  memoryId: string
  initialAnnotation: string | null
  onSave: (memoryId: string, annotation: string) => Promise<{ error: string | null }>
  onCancel?: () => void
  className?: string
}

const MAX_ANNOTATION_LENGTH = 2000

export function AnnotationEditor({
  memoryId,
  initialAnnotation,
  onSave,
  onCancel,
  className,
}: AnnotationEditorProps) {
  const [annotation, setAnnotation] = useState(initialAnnotation || '')
  const [isEditing, setIsEditing] = useState(!initialAnnotation)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Track if there are unsaved changes
  useEffect(() => {
    setHasChanges(annotation !== (initialAnnotation || ''))
  }, [annotation, initialAnnotation])

  // Auto-save on blur when there are changes
  const handleBlur = useCallback(async () => {
    if (!hasChanges || isSaving) return

    setIsSaving(true)
    try {
      const result = await onSave(memoryId, annotation)
      if (!result.error) {
        setHasChanges(false)
        if (!annotation) {
          setIsEditing(false)
        }
      }
    } finally {
      setIsSaving(false)
    }
  }, [hasChanges, isSaving, onSave, memoryId, annotation])

  // Manual save
  const handleSave = useCallback(async () => {
    if (isSaving) return

    setIsSaving(true)
    try {
      const result = await onSave(memoryId, annotation)
      if (!result.error) {
        setHasChanges(false)
        setIsEditing(false)
      }
    } finally {
      setIsSaving(false)
    }
  }, [isSaving, onSave, memoryId, annotation])

  // Cancel editing
  const handleCancel = useCallback(() => {
    setAnnotation(initialAnnotation || '')
    setIsEditing(false)
    setHasChanges(false)
    onCancel?.()
  }, [initialAnnotation, onCancel])

  // Start editing
  const handleEdit = useCallback(() => {
    setIsEditing(true)
  }, [])

  // Show read mode if not editing and has annotation
  if (!isEditing && initialAnnotation) {
    return (
      <div className={className}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-stone-700">记忆注释</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="text-stone-500 hover:text-stone-700"
          >
            <svg
              className="mr-1 h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            编辑
          </Button>
        </div>
        <p className="mt-2 whitespace-pre-wrap text-sm text-stone-600 leading-relaxed">
          {initialAnnotation}
        </p>
      </div>
    )
  }

  // Show edit mode
  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-stone-700">记忆注释</h3>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="text-stone-500 hover:text-stone-700"
              >
                取消
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {isSaving ? '保存中...' : '保存'}
              </Button>
            </>
          )}
          {!hasChanges && !initialAnnotation && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="text-stone-500 hover:text-stone-700"
            >
              关闭
            </Button>
          )}
        </div>
      </div>
      <div className="mt-2">
        <Textarea
          value={annotation}
          onChange={(e) => setAnnotation(e.target.value)}
          onBlur={handleBlur}
          placeholder="添加关于这段记忆的故事或注释..."
          maxLength={MAX_ANNOTATION_LENGTH}
          className="min-h-[120px] resize-none border-stone-200 bg-white text-stone-700 placeholder:text-stone-400 focus:border-amber-400 focus:ring-amber-100"
        />
        <div className="mt-1 flex justify-end">
          <span
            className={`text-xs ${
              annotation.length > MAX_ANNOTATION_LENGTH * 0.9
                ? 'text-amber-600'
                : 'text-stone-400'
            }`}
          >
            {annotation.length} / {MAX_ANNOTATION_LENGTH}
          </span>
        </div>
      </div>
    </div>
  )
}
