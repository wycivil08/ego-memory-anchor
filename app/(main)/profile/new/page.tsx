import { ProfileForm } from '@/components/profile/ProfileForm'

export default function NewProfilePage() {
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-stone-800">
          为 TA 建一个记忆空间
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          填写基本信息，创建一个守护真实记忆的空间
        </p>
      </div>

      {/* Form Card */}
      <div className="max-w-xl">
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <ProfileForm mode="create" />
        </div>
      </div>
    </div>
  )
}
