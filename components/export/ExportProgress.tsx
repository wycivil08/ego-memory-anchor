'use client'

import { useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

interface ExportProfile {
  id: string
  name: string
  species: string
  relationship: string
  created_at: string
}

interface ExportProgressProps {
  profiles: ExportProfile[]
  onExportComplete?: () => void
}

type ExportStatus = 'idle' | 'preparing' | 'downloading' | 'complete' | 'error'

export function ExportProgress({ profiles, onExportComplete }: ExportProgressProps) {
  const [selectedProfileId, setSelectedProfileId] = useState<string>('')
  const [status, setStatus] = useState<ExportStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [, setDownloadUrl] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId)

  const handleExport = useCallback(async () => {
    if (!selectedProfileId) return

    // Reset state
    setStatus('preparing')
    setProgress(0)
    setError(null)
    setDownloadUrl(null)

    try {
      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController()

      // Start the download by fetching the API route
      const response = await fetch(`/api/export/${selectedProfileId}`, {
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '导出失败')
      }

      // Get the content-length if available
      const contentLength = response.headers.get('Content-Length')
      const total = contentLength ? parseInt(contentLength, 10) : 0

      // Read the response as a blob
      setStatus('downloading')

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('无法读取响应')
      }

      const chunks: Uint8Array[] = []
      let receivedLength = 0

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          break
        }

        chunks.push(value)
        receivedLength += value.length

        if (total > 0) {
          setProgress(Math.round((receivedLength / total) * 100))
        }
      }

      // Combine chunks into a single blob
      const blob = new Blob(chunks as BlobPart[], { type: 'application/zip' })

      // Create download URL
      const url = window.URL.createObjectURL(blob)
      setDownloadUrl(url)
      setStatus('complete')
      setProgress(100)

      // Trigger download
      const profileName = selectedProfile?.name || 'export'
      const filename = `${profileName}_回忆录_${new Date().toISOString().split('T')[0]}.zip`
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      onExportComplete?.()
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setStatus('idle')
        setProgress(0)
      } else {
        console.error('Export error:', err)
        setError(err instanceof Error ? err.message : '导出过程中出现错误')
        setStatus('error')
      }
    }
  }, [selectedProfileId, selectedProfile, onExportComplete])

  const handleCancel = useCallback(() => {
    abortControllerRef.current?.abort()
    setStatus('idle')
    setProgress(0)
  }, [])

  const handleReset = useCallback(() => {
    setStatus('idle')
    setProgress(0)
    setError(null)
    setDownloadUrl(null)
  }, [])

  if (profiles.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-stone-500">暂无可以导出的记忆空间</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">导出数据</CardTitle>
        <CardDescription>
          将选择的记忆空间导出为 ZIP 文件，包含所有媒体文件和元数据
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Profile Selection */}
        {status === 'idle' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="profile-select">选择记忆空间</Label>
              <select
                id="profile-select"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={selectedProfileId}
                onChange={(e) => setSelectedProfileId(e.target.value)}
              >
                <option value="">请选择...</option>
                {profiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name} ({profile.species === 'human' ? '人物' : '宠物'})
                  </option>
                ))}
              </select>
            </div>

            <Button
              onClick={handleExport}
              disabled={!selectedProfileId}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            >
              开始导出
            </Button>
          </>
        )}

        {/* Preparing Status */}
        {status === 'preparing' && (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-sm text-stone-600">
              <svg
                className="h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>正在准备导出数据...</span>
            </div>
            <Button onClick={handleCancel} variant="outline" className="w-full">
              取消
            </Button>
          </div>
        )}

        {/* Downloading Status */}
        {status === 'downloading' && (
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-600">正在下载...</span>
                <span className="text-stone-600">{progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200">
                <div
                  className="h-full bg-amber-600 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <Button onClick={handleCancel} variant="outline" className="w-full">
              取消
            </Button>
          </div>
        )}

        {/* Complete Status */}
        {status === 'complete' && (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-sm text-emerald-600">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>导出完成！</span>
            </div>
            <p className="text-xs text-stone-500 text-center">
              文件已自动下载到您的设备
            </p>
            <Button onClick={handleReset} variant="outline" className="w-full">
              导出其他档案
            </Button>
          </div>
        )}

        {/* Error Status */}
        {status === 'error' && (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-sm text-red-500">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
            <Button onClick={handleReset} variant="outline" className="w-full">
              重试
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
