'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import type { Reminder, Recurrence } from '@/lib/types'
import { RECURRENCE_LABELS } from '@/lib/types'
import { deleteReminder, toggleReminder } from '@/lib/actions/reminder'
import {
  getNextLunarOccurrence,
  getLunarDateDisplay,
  parseLunarDate,
} from '@/lib/reminder-utils'
import { Button } from '@/components/ui/button'

interface ReminderListProps {
  profileId: string
  reminders: Reminder[]
  onEdit: (reminder: Reminder) => void
}

function formatDate(dateStr: string, recurrence: Recurrence): string {
  if (recurrence === 'lunar_yearly') {
    const lunar = parseLunarDate(dateStr)
    if (lunar) {
      return getLunarDateDisplay(lunar.month, lunar.day)
    }
    return dateStr
  }

  // Solar date formatting
  try {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function getNextOccurrence(reminder: Reminder): string {
  if (!reminder.enabled) {
    return '已暂停'
  }

  if (reminder.recurrence === 'lunar_yearly') {
    const lunar = parseLunarDate(reminder.reminder_date)
    if (lunar) {
      const nextSolar = getNextLunarOccurrence(lunar.month, lunar.day)
      try {
        const date = new Date(nextSolar + 'T00:00:00')
        return date.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      } catch {
        return nextSolar
      }
    }
    return '-'
  }

  if (reminder.recurrence === 'once') {
    try {
      const date = new Date(reminder.reminder_date + 'T00:00:00')
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return reminder.reminder_date
    }
  }

  // yearly
  try {
    const date = new Date(reminder.reminder_date + 'T00:00:00')
    return date.toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return reminder.reminder_date
  }
}

function getRecurrenceBadgeColor(recurrence: Recurrence): string {
  switch (recurrence) {
    case 'lunar_yearly':
      return 'bg-purple-100 text-purple-700'
    case 'yearly':
      return 'bg-blue-100 text-blue-700'
    case 'once':
      return 'bg-gray-100 text-gray-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

export function ReminderList({
  profileId: _profileId,
  reminders,
  onEdit,
}: ReminderListProps) {
// profileId is prepared for future use (filtering by profile)
void _profileId
  const router = useRouter()
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [togglingId, setTogglingId] = React.useState<string | null>(null)

  const handleDelete = async (reminderId: string) => {
    if (!confirm('确定要删除这个提醒吗？')) return

    setDeletingId(reminderId)
    try {
      const result = await deleteReminder(reminderId)
      if (result.success) {
        router.refresh()
      } else {
        alert(result.error || '删除失败')
      }
    } catch {
      alert('删除失败，请稍后重试')
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggle = async (reminderId: string) => {
    setTogglingId(reminderId)
    try {
      const result = await toggleReminder(reminderId)
      if (result.success) {
        router.refresh()
      } else {
        alert(result.error || '更新失败')
      }
    } catch {
      alert('更新失败，请稍后重试')
    } finally {
      setTogglingId(null)
    }
  }

  if (reminders.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-stone-300 p-8 text-center">
        <div className="text-stone-400 text-lg mb-2">暂无提醒</div>
        <p className="text-stone-400 text-sm">添加重要日期的提醒，不忘记</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reminders.map((reminder: Reminder) => (
        <div
          key={reminder.id}
          className={`rounded-lg border p-4 transition-opacity ${
            reminder.enabled
              ? 'border-stone-200 bg-white'
              : 'border-stone-200 bg-stone-50 opacity-60'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Title and badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <h3
                  className={`font-medium ${
                    reminder.enabled ? 'text-stone-800' : 'text-stone-500'
                  }`}
                >
                  {reminder.title}
                </h3>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getRecurrenceBadgeColor(
                    reminder.recurrence
                  )}`}
                >
                  {RECURRENCE_LABELS[reminder.recurrence]}
                </span>
                {!reminder.enabled && (
                  <span className="inline-flex items-center rounded-full bg-stone-200 px-2 py-0.5 text-xs font-medium text-stone-500">
                    已暂停
                  </span>
                )}
              </div>

              {/* Date info */}
              <div className="mt-2 text-sm text-stone-500">
                <div>日期：{formatDate(reminder.reminder_date, reminder.recurrence)}</div>
                {reminder.enabled && (
                  <div className="mt-1">
                    下次提醒：
                    <span className="text-amber-600 font-medium">
                      {getNextOccurrence(reminder)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggle(reminder.id)}
                disabled={togglingId === reminder.id}
                className="border-stone-300 text-stone-700 hover:bg-stone-50 rounded-lg text-xs h-8"
              >
                {togglingId === reminder.id
                  ? '...'
                  : reminder.enabled
                  ? '暂停'
                  : '启用'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(reminder)}
                className="border-stone-300 text-stone-700 hover:bg-stone-50 rounded-lg text-xs h-8"
              >
                编辑
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(reminder.id)}
                disabled={deletingId === reminder.id}
                className="border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs h-8"
              >
                {deletingId === reminder.id ? '...' : '删除'}
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
