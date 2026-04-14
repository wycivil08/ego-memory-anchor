'use client'

import * as React from 'react'
import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import type { Recurrence } from '@/lib/types'
import { RECURRENCE_LABELS } from '@/lib/types'
import {
  LUNAR_MONTHS,
  LUNAR_DAYS,
  parseLunarDate,
  encodeLunarDate,
  getNextLunarOccurrence,
  getLunarDateDisplay,
} from '@/lib/reminder-utils'
import { createReminder, updateReminder, type ReminderState } from '@/lib/actions/reminder'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ReminderFormProps {
  profileId: string
  reminderId?: string
  initialTitle?: string
  initialDate?: string
  initialRecurrence?: Recurrence
  mode: 'create' | 'edit'
}

const initialState: ReminderState = {
  error: null,
  success: false,
}

export function ReminderForm({
  profileId,
  reminderId,
  initialTitle = '',
  initialDate = '',
  initialRecurrence = 'yearly',
  mode,
}: ReminderFormProps) {
  const router = useRouter()

  // Parse initial date for lunar
  const initialLunar = parseLunarDate(initialDate)
  const [title, setTitle] = React.useState(initialTitle)
  const [solarDate, setSolarDate] = React.useState(
    initialLunar ? '' : initialDate
  )
  const [lunarMonth, setLunarMonth] = React.useState(initialLunar?.month || 1)
  const [lunarDay, setLunarDay] = React.useState(initialLunar?.day || 1)
  const [recurrence, setRecurrence] = React.useState<Recurrence>(initialRecurrence)
  const [isPending, setIsPending] = React.useState(false)

  const action = mode === 'create'
    ? createReminder
    : updateReminder.bind(null, reminderId || '')

  const [state, formAction] = useActionState(action, initialState)

  // Handle successful submission
  React.useEffect(() => {
    if (state.success) {
      router.refresh()
    }
  }, [state.success, router])

  // Handle pending state
  React.useEffect(() => {
    setIsPending(state.success === false && state.error !== null ? false : isPending)
  }, [state.error, state.success])

  const handleRecurrenceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRecurrence(e.target.value as Recurrence)
  }

  const getFormData = (): FormData => {
    const formData = new FormData()
    formData.append('title', title)
    formData.append('recurrence', recurrence)

    if (mode === 'create') {
      formData.append('profile_id', profileId)
    }

    if (recurrence === 'lunar_yearly') {
      formData.append('reminder_date', encodeLunarDate(lunarMonth, lunarDay))
    } else {
      formData.append('reminder_date', solarDate)
    }

    return formData
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)
    formAction(getFormData())
  }

  const isLunar = recurrence === 'lunar_yearly'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {state.error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {state.error}
        </div>
      )}

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-stone-700">
          提醒标题 <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          name="title"
          type="text"
          placeholder="例如：爷爷的生日"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={200}
          disabled={isPending}
          className="border-stone-300 bg-white text-stone-800 placeholder:text-stone-400 focus-visible:ring-amber-600"
        />
      </div>

      {/* Recurrence */}
      <div className="space-y-2">
        <Label htmlFor="recurrence" className="text-stone-700">
          重复方式
        </Label>
        <select
          id="recurrence"
          name="recurrence"
          value={recurrence}
          onChange={handleRecurrenceChange}
          disabled={isPending}
          className="flex h-10 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        >
          {(Object.keys(RECURRENCE_LABELS) as Recurrence[]).map((key) => (
            <option key={key} value={key}>
              {RECURRENCE_LABELS[key]}
            </option>
          ))}
        </select>
      </div>

      {/* Date Selection */}
      {isLunar ? (
        <div className="space-y-2">
          <Label className="text-stone-700">
            农历日期 <span className="text-red-500">*</span>
          </Label>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="lunar_month" className="text-sm text-stone-500">
                月份
              </Label>
              <select
                id="lunar_month"
                name="lunar_month"
                value={lunarMonth}
                onChange={(e) => setLunarMonth(Number(e.target.value))}
                disabled={isPending}
                className="mt-1 flex h-10 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              >
                {LUNAR_MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <Label htmlFor="lunar_day" className="text-sm text-stone-500">
                日期
              </Label>
              <select
                id="lunar_day"
                name="lunar_day"
                value={lunarDay}
                onChange={(e) => setLunarDay(Number(e.target.value))}
                disabled={isPending}
                className="mt-1 flex h-10 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              >
                {LUNAR_DAYS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-xs text-stone-400">
            将转换为农历每年重复的公历日期
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="reminder_date" className="text-stone-700">
            日期 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="reminder_date"
            name="reminder_date"
            type="date"
            value={solarDate}
            onChange={(e) => setSolarDate(e.target.value)}
            required={!isLunar}
            disabled={isPending}
            className="border-stone-300 bg-white text-stone-800 focus-visible:ring-amber-600"
          />
          {recurrence === 'once' && (
            <p className="text-xs text-stone-400">将在指定日期发送提醒</p>
          )}
          {recurrence === 'yearly' && (
            <p className="text-xs text-stone-400">每年此日期发送提醒</p>
          )}
        </div>
      )}

      {/* Preview for lunar yearly */}
      {isLunar && title && (
        <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
          <span className="font-medium">{title}</span> - 每年{' '}
          {getLunarDateDisplay(lunarMonth, lunarDay)}
          <br />
          <span className="text-amber-600">
            下次提醒：{getNextLunarOccurrence(lunarMonth, lunarDay)}
          </span>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-4 pt-4">
        <Button
          type="submit"
          disabled={isPending}
          className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-colors duration-150"
        >
          {isPending ? '保存中...' : mode === 'create' ? '添加提醒' : '保存修改'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
          className="border-stone-300 text-stone-700 hover:bg-stone-50 rounded-xl"
        >
          取消
        </Button>
      </div>
    </form>
  )
}
