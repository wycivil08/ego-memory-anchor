import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getProfilesForExport } from '@/lib/actions/export'
import { SettingsClient } from '@/components/settings/SettingsClient'
import { ExportProgress } from '@/components/export/ExportProgress'

export default async function SettingsPage() {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get profiles for export dropdown
  const profiles = await getProfilesForExport()

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-stone-800">设置</h1>
        <p className="mt-1 text-sm text-stone-500">
          管理您的账户设置和数据
        </p>
      </div>

      {/* Settings Sections */}
      <SettingsClient profiles={profiles} />

      {/* Export Progress - rendered separately since it's a client component */}
      <div className="mt-6 max-w-2xl">
        <ExportProgress profiles={profiles} />
      </div>
    </div>
  )
}
