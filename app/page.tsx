import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  HeroSection,
  ValueProps,
  HowItWorks,
  FounderStory,
  PrivacyPledge,
  CTABanner,
  Footer,
} from '@/components/landing'

export const metadata: Metadata = {
  title: '忆锚 — 永不丢失关于 TA 的真实记忆',
  description:
    '忆锚是一款面向丧亲/丧宠人群的真实记忆聚合平台。守护真实记录，对抗第二重丧失。绝不生成合成内容。',
  openGraph: {
    title: '忆锚 — 永不丢失关于 TA 的真实记忆',
    description:
      '一站式聚合照片、视频、语音、文字，为逝去的亲人或宠物编织一条生命时间线。',
    type: 'website',
    locale: 'zh_CN',
  },
  twitter: {
    card: 'summary_large_image',
    title: '忆锚 — 永不丢失关于 TA 的真实记忆',
    description: '守护真实记录，对抗第二重丧失。',
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
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
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button
                variant="ghost"
                className="text-stone-600 hover:text-stone-800 hover:bg-stone-100"
              >
                登录
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-amber-600 hover:bg-amber-700 text-white">开始纪念</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content sections */}
      <main>
        <HeroSection />
        <ValueProps />
        <HowItWorks />
        <FounderStory />
        <PrivacyPledge />
        <CTABanner />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
