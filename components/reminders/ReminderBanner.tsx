'use client'

import * as React from 'react'
import Link from 'next/link'
import type { Reminder, Profile } from '@/lib/types'
import {
  getNextLunarOccurrence,
  parseLunarDate,
} from '@/lib/reminder-utils'

interface ReminderBannerProps {
  reminders: Reminder[]
  profile: Profile
}

function getDaysUntil(dateStr: string, recurrence: Reminder['recurrence']): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let targetDate: Date

  if (recurrence === 'lunar_yearly') {
    const lunar = parseLunarDate(dateStr)
    if (lunar) {
      const solarStr = getNextLunarOccurrence(lunar.month, lunar.day)
      targetDate = new Date(solarStr + 'T00:00:00')
    } else {
      return -1
    }
  } else {
    targetDate = new Date(dateStr + 'T00:00:00')
  }

  const diffTime = targetDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

function getOccurrenceDate(dateStr: string, recurrence: Reminder['recurrence']): string {
  if (recurrence === 'lunar_yearly') {
    const lunar = parseLunarDate(dateStr)
    if (lunar) {
      const solarStr = getNextLunarOccurrence(lunar.month, lunar.day)
      const date = new Date(solarStr + 'T00:00:00')
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    }
    return dateStr
  }

  if (recurrence === 'once') {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // yearly
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
  })
}

export function ReminderBanner({ reminders, profile }: ReminderBannerProps) {
  // Filter enabled reminders and get upcoming ones (within 7 days)
  const upcomingReminders = React.useMemo(() => {
    return reminders
      .filter((r) => r.enabled)
      .map((r) => ({
        ...r,
        daysUntil: getDaysUntil(r.reminder_date, r.recurrence),
      }))
      .filter((r) => r.daysUntil >= 0 && r.daysUntil <= 7)
      .sort((a, b) => a.daysUntil - b.daysUntil)
  }, [reminders])

  if (upcomingReminders.length === 0) {
    return null
  }

  const formatMessage = (reminder: Reminder & { daysUntil: number }): string => {
    const profileName = profile.name

    if (reminder.daysUntil === 0) {
      return `今天是${profileName}的${reminder.title}`
    }

    if (reminder.daysUntil === 1) {
      return `明天是${profileName}的${reminder.title}`
    }

    return `${reminder.daysUntil}天后是${profileName}的${reminder.title}`
  }

  return (
    <div className="space-y-3">
      {upcomingReminders.map((reminder) => (
        <Link
          key={reminder.id}
          href={`/profile/${profile.id}/reminders`}
          className="block rounded-xl border border-amber-200 bg-amber-50 p-4 transition-all hover:bg-amber-100 hover:border-amber-300"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                {/* Candle with animated flame */}
                <div className="relative">
                  {/* Candle body */}
                  <svg
                    className="h-7 w-7 text-amber-600"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <rect x="9" y="10" width="6" height="10" rx="1" fill="currentColor" />
                    <rect x="8" y="9" width="8" height="2" rx="0.5" fill="currentColor" opacity="0.8" />
                  </svg>
                  {/* Animated flame */}
                  <svg
                    className="absolute -top-2 left-1/2 -translate-x-1/2 h-4 w-4 animate-flame"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M12 2C12 2 8 6 8 10C8 12.21 9.79 14 12 14C14.21 14 16 12.21 16 10C16 6 12 2 12 2Z"
                      fill="#f59e0b"
                      className="animate-flame-inner"
                    />
                    <path
                      d="M12 4C12 4 10 7 10 9C10 10.1 10.9 11 12 11C13.1 11 14 10.1 14 9C14 7 12 4 12 4Z"
                      fill="#fbbf24"
                      className="animate-flame-core"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-amber-800">
                {formatMessage(reminder)}
              </p>
              <p className="mt-1 text-sm text-amber-600">
                {getOccurrenceDate(reminder.reminder_date, reminder.recurrence)}
              </p>
            </div>
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-amber-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
