import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            {/* Logo icon */}
            <svg
              className="h-8 w-8 text-amber-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
              />
            </svg>
            <span className="text-xl font-medium text-stone-800">忆锚</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-stone-600 hover:text-stone-800">
                登录
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                开始纪念
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <main className="mx-auto max-w-6xl px-4 py-20 lg:py-32">
        <div className="flex flex-col items-center text-center">
          {/* Main headline */}
          <h1 className="max-w-3xl text-4xl font-medium leading-tight text-stone-800 lg:text-5xl">
            守护真实记忆
            <br />
            <span className="text-amber-600">对抗第二重丧失</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 max-w-xl text-lg text-stone-600">
            忆锚是一款面向丧亲/丧宠人群的真实记忆聚合平台。
            在这里，保存关于 TA 的每一个真实瞬间——照片、视频、语音、文字，
            让爱与回忆跨越时间，永远留存。
          </p>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link href="/register">
              <Button
                size="lg"
                className="h-12 px-8 bg-amber-600 hover:bg-amber-700 text-white rounded-xl"
              >
                开始纪念
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 border-stone-300 text-stone-700 hover:bg-stone-50 rounded-xl"
              >
                已有账号
              </Button>
            </Link>
          </div>

          {/* Feature cards */}
          <div className="mt-20 grid w-full max-w-4xl gap-6 sm:grid-cols-3">
            <FeatureCard
              icon={
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              }
              title="真实记录"
              description="只保存您上传的真实内容，绝不生成合成记忆"
            />
            <FeatureCard
              icon={
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              }
              title="家庭共享"
              description="邀请家人共同守护回忆，凝聚爱的记忆"
            />
            <FeatureCard
              icon={
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              }
              title="纪念提醒"
              description="重要日期自动提醒，让爱不被遗忘"
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 text-center text-sm text-stone-500">
          <p>忆锚 — 守护真实记忆，对抗第二重丧失</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
        {icon}
      </div>
      <h3 className="text-base font-medium text-stone-800">{title}</h3>
      <p className="mt-2 text-sm text-stone-500">{description}</p>
    </div>
  )
}
