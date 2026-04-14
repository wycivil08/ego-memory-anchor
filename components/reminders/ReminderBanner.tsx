'use client'

import * as React from 'react'
import Link from 'next/link'
import type { Reminder, Profile } from '@/lib/types'
import {
  getNextLunarOccurrence,
  getLunarDateDisplay,
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
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-200">
                <svg
                  className="h-5 w-5 text-amber-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
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
