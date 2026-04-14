'use client'

import * as React from 'react'
import type { Reminder } from '@/lib/types'
import { ReminderForm } from '@/components/reminders/ReminderForm'
import { ReminderList } from '@/components/reminders/ReminderList'
import { Button } from '@/components/ui/button'

interface RemindersClientProps {
  profileId: string
  initialReminders: Reminder[]
}

export function RemindersClient({
  profileId,
  initialReminders,
}: RemindersClientProps) {
  const [reminders, setReminders] = React.useState<Reminder[]>(initialReminders)
  const [editingReminder, setEditingReminder] = React.useState<Reminder | null>(null)
  const [showForm, setShowForm] = React.useState(false)

  // Update reminders when initialReminders changes (after server refresh)
  React.useEffect(() => {
    setReminders(initialReminders)
  }, [initialReminders])

  const handleEdit = (reminder: Reminder) => {
    setEditingReminder(reminder)
    setShowForm(true)
  }

  const handleCancelEdit = () => {
    setEditingReminder(null)
    setShowForm(false)
  }

  const handleFormSuccess = () => {
    setEditingReminder(null)
    setShowForm(false)
    // Refresh will happen via router.refresh() in the form
  }

  return (
    <div className="space-y-8">
      {/* Add/Edit Form Section */}
      {showForm ? (
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-medium text-stone-800 mb-4">
            {editingReminder ? '编辑提醒' : '添加新提醒'}
          </h2>
          <ReminderForm
            profileId={profileId}
            reminderId={editingReminder?.id}
            initialTitle={editingReminder?.title}
            initialDate={editingReminder?.reminder_date}
            initialRecurrence={editingReminder?.recurrence}
            mode={editingReminder ? 'edit' : 'create'}
          />
          <div className="mt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancelEdit}
              className="text-stone-500 hover:text-stone-700"
            >
              取消
            </Button>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setShowForm(true)}
          className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-colors duration-150"
        >
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          添加提醒
        </Button>
      )}

      {/* Reminders List */}
      <div>
        <h2 className="text-lg font-medium text-stone-800 mb-4">
          已设置的提醒 ({reminders.length})
        </h2>
        <ReminderList
          profileId={profileId}
          reminders={reminders}
          onEdit={handleEdit}
        />
      </div>
    </div>
  )
}
