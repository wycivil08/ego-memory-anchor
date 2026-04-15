import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28 lg:py-36">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-50" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center lg:flex-row lg:items-center lg:justify-between lg:gap-16">
          {/* Left content */}
          <div className="max-w-2xl text-center lg:text-left">
            <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl lg:text-6xl">
              永不丢失
              <br />
              <span className="text-amber-700">关于 TA 的真实记忆</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-stone-600 sm:text-xl">
              一站式聚合照片、视频、语音、文字，
              <br className="hidden sm:block" />
              为逝去的亲人或宠物编织一条生命时间线。
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Link href="/register">
                <Button
                  size="lg"
                  className="h-12 px-8 bg-amber-700 hover:bg-amber-800 text-white rounded-lg"
                >
                  开始守护记忆
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 border-stone-300 text-stone-700 hover:bg-stone-50 rounded-lg"
                >
                  已有账号
                </Button>
              </Link>
            </div>
          </div>

          {/* Right illustration */}
          <div className="mt-12 lg:mt-0 flex-shrink-0">
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96">
              {/* Warm gradient circle */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 opacity-60" />
              {/* Timeline illustration */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 200 200" className="w-64 h-64 text-amber-600 opacity-80">
                  {/* Timeline dots */}
                  <circle cx="60" cy="50" r="8" fill="currentColor" opacity="0.8" />
                  <circle cx="60" cy="100" r="8" fill="currentColor" opacity="0.6" />
                  <circle cx="60" cy="150" r="8" fill="currentColor" opacity="0.4" />
                  {/* Connecting line */}
                  <line x1="60" y1="58" x2="60" y2="142" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                  {/* Photo frames */}
                  <rect x="80" y="35" width="60" height="45" rx="4" fill="currentColor" opacity="0.2" />
                  <rect x="90" y="90" width="50" height="35" rx="4" fill="currentColor" opacity="0.15" />
                  <rect x="75" y="135" width="55" height="40" rx="4" fill="currentColor" opacity="0.1" />
                  {/* Heart */}
                  <path
                    d="M140 160 C140 155, 145 150, 150 155 C155 150, 160 155, 160 160 C160 170, 150 175, 150 175 C150 175, 140 170, 140 160"
                    fill="currentColor"
                    opacity="0.6"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
