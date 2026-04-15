'use client'

import { useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

interface ExportProfile {
  id: string
  name: string
  species: 'human' | 'pet'
  relationship: string
  created_at: string
}

interface ExportButtonProps {
  profiles: ExportProfile[]
}

type ExportStatus = 'idle' | 'preparing' | 'downloading' | 'complete' | 'error'

/**
 * ExportButton - Most prominent export trigger for settings page
 * A trust signal showing users can export their data anytime
 */
export function ExportButton({ profiles }: ExportButtonProps) {
  const [selectedProfileId, setSelectedProfileId] = useState<string>('')
  const [status, setStatus] = useState<ExportStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId)

  const handleExport = useCallback(async () => {
    if (!selectedProfileId) return

    // Reset state
    setStatus('preparing')
    setProgress(0)
    setError(null)

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

      // Trigger download
      const profileName = selectedProfile?.name || 'export'
      const dateStr = new Date().toISOString().split('T')[0]
      const filename = `${profileName}_的记忆_${dateStr}.zip`

      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setStatus('complete')
      setProgress(100)
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
  }, [selectedProfileId, selectedProfile])

  const handleCancel = useCallback(() => {
    abortControllerRef.current?.abort()
    setStatus('idle')
    setProgress(0)
  }, [])

  const handleReset = useCallback(() => {
    setStatus('idle')
    setProgress(0)
    setError(null)
    setSelectedProfileId('')
  }, [])

  // Empty state - no profiles available
  if (profiles.length === 0) {
    return (
      <Card className="border-amber-200 bg-amber-50/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            导出全部数据
          </CardTitle>
          <CardDescription>备份您的记忆空间</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-stone-500">暂无可导出的记忆空间</p>
          <p className="text-xs text-stone-400 mt-2">创建档案后即可导出数据</p>
        </CardContent>
      </Card>
    )
  }

  // Idle state - show export button and profile selector
  if (status === 'idle') {
    return (
      <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            导出全部数据 (ZIP)
          </CardTitle>
          <CardDescription>
            一键导出所有记忆到本地，包含照片、视频、音频、文字和元数据
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Profile Selection */}
          <div className="space-y-2">
            <Label htmlFor="export-profile">选择记忆空间</Label>
            <select
              id="export-profile"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={selectedProfileId}
              onChange={(e) => setSelectedProfileId(e.target.value)}
            >
              <option value="">请选择要导出的档案...</option>
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name} ({profile.species === 'human' ? '人物' : '宠物'})
                </option>
              ))}
            </select>
          </div>

          {/* Export Button - Most Prominent */}
          <Button
            onClick={handleExport}
            disabled={!selectedProfileId}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 text-base shadow-lg shadow-amber-200"
            size="lg"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            导出全部数据 (ZIP)
          </Button>

          <p className="text-xs text-center text-stone-400">
            导出的 ZIP 文件包含所有媒体和元数据，可永久保存
          </p>
        </CardContent>
      </Card>
    )
  }

  // Preparing state
  if (status === 'preparing') {
    return (
      <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <svg className="h-5 w-5 text-amber-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            正在准备导出...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-stone-600">正在整理 {selectedProfile?.name} 的记忆数据...</p>
          <Button onClick={handleCancel} variant="outline" className="w-full">
            取消
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Downloading state
  if (status === 'downloading') {
    return (
      <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <svg className="h-5 w-5 text-amber-600 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            正在下载...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-600">下载进度</span>
              <span className="text-stone-600 font-medium">{progress}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-stone-200">
              <div
                className="h-full bg-amber-600 transition-all duration-300 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-stone-500 text-center">
            正在打包 {selectedProfile?.name} 的记忆，请稍候...
          </p>
          <Button onClick={handleCancel} variant="outline" className="w-full">
            取消导出
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Complete state
  if (status === 'complete') {
    return (
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-emerald-700">
            <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            导出完成
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-emerald-600 text-center">
            {selectedProfile?.name} 的记忆已成功导出！
          </p>
          <p className="text-xs text-stone-500 text-center">
            文件已保存到您的下载文件夹
          </p>
          <Button onClick={handleReset} variant="outline" className="w-full bg-white">
            导出其他档案
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (status === 'error') {
    return (
      <Card className="border-red-200 bg-gradient-to-br from-red-50 to-orange-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-red-600">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            导出失败
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-red-500 text-center">{error}</p>
          <div className="flex gap-2">
            <Button onClick={handleReset} variant="outline" className="flex-1 bg-white">
              重试
            </Button>
            <Button onClick={handleCancel} variant="ghost" className="flex-1">
              取消
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}
