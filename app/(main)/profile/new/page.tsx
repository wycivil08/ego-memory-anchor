import { ProfileForm } from '@/components/profile/ProfileForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewProfilePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20 relative">
      <div className="w-full max-w-[560px] flex flex-col gap-12 relative z-10">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">为 TA 建一个记忆空间</h1>
          <p className="text-stone-500 leading-relaxed max-w-sm mx-auto">
            在这里，时间会慢下来。让我们用最庄重的方式，铭记那些不曾离去的温暖。
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-xl p-8 md:p-10 shadow-sm border border-stone-100 transition-all duration-300">
          <ProfileForm mode="create" />
        </div>

        {/* Footer Quote/Tip */}
        <div className="text-center">
          <p className="text-sm font-light italic text-stone-500">
            &ldquo;死亡不是终点，遗忘才是。&rdquo;
          </p>
          <div className="mt-8">
            <Link href="/dashboard" className="text-[11px] uppercase tracking-[0.2em] font-semibold text-stone-500 hover:text-amber-700 transition-colors flex items-center justify-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              返回个人中心
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-amber-700/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-stone-300/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
    </div>
  )
}
