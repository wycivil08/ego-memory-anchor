'use client'

import * as React from 'react'
import { recordPrivacyConsent } from '@/lib/actions/consent'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

const STORAGE_KEY = 'ego_memory_upload_consentGiven'
const CONSENT_TYPE = 'sensitive_data_upload'

interface PrivacyConsentDialogProps {
  onConsentGiven?: () => void
}

export function PrivacyConsentDialog({ onConsentGiven }: PrivacyConsentDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [checked, setChecked] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Check if consent was already given in this session
  React.useEffect(() => {
    const hasConsentInSession = sessionStorage.getItem(STORAGE_KEY)
    if (!hasConsentInSession) {
      setOpen(true)
    }
  }, [])

  const handleConsent = async () => {
    if (!checked) return

    setIsSubmitting(true)
    try {
      // Record consent in database
      await recordPrivacyConsent(CONSENT_TYPE)

      // Store in session storage as backup
      sessionStorage.setItem(STORAGE_KEY, 'true')

      setOpen(false)
      onConsentGiven?.()
    } catch (error) {
      console.error('Failed to record consent:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    // Prevent closing without consent - user must consent or leave the page
    if (!newOpen && !sessionStorage.getItem(STORAGE_KEY)) {
      // User is trying to close without giving consent
      // Don't close the dialog
      return
    }
    setOpen(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">上传前请阅读</DialogTitle>
          <DialogDescription className="text-stone-500">
            在你上传关于 TA 的记忆之前，请先了解我们的承诺：
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-sm font-medium">
                1
              </span>
              <span className="text-sm text-stone-600">
                <strong className="text-stone-800">只保存你上传的真实内容</strong>
                <br />
                我们不会对你的照片、视频、语音做任何 AI 合成或修改
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-sm font-medium">
                2
              </span>
              <span className="text-sm text-stone-600">
                <strong className="text-stone-800">不做 AI 合成</strong>
                <br />
                永远不会有 AI 生成的内容出现在你的记忆空间里
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-sm font-medium">
                3
              </span>
              <span className="text-sm text-stone-600">
                <strong className="text-stone-800">不投广告、不追踪</strong>
                <br />
                不会有任何广告，也没有第三方追踪
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-sm font-medium">
                4
              </span>
              <span className="text-sm text-stone-600">
                <strong className="text-stone-800">随时可导出或删除全部数据</strong>
                <br />
                你的数据永远属于你，可以在设置页一键导出或删除
              </span>
            </li>
          </ul>
        </div>

        <div className="flex items-start gap-3 px-1">
          <Checkbox
            id="upload-consent"
            checked={checked}
            onCheckedChange={(v) => setChecked(v === true)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-stone-300 text-amber-600 focus-visible:ring-amber-600"
          />
          <label
            htmlFor="upload-consent"
            className="text-sm text-stone-600 leading-relaxed cursor-pointer"
          >
            我已知晓并同意上述承诺
          </label>
        </div>

        <DialogFooter>
          <Button
            onClick={handleConsent}
            disabled={!checked || isSubmitting}
            className="w-full bg-amber-600 hover:bg-amber-700"
          >
            {isSubmitting ? '处理中...' : '我已知晓'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Hook to check if upload consent was already given
export function useUploadConsent() {
  const [hasConsented, setHasConsented] = React.useState(false)

  React.useEffect(() => {
    setHasConsented(!!sessionStorage.getItem(STORAGE_KEY))
  }, [])

  return hasConsented
}
