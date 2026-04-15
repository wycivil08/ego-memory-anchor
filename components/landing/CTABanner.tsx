import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function CTABanner() {
  return (
    <section className="bg-gradient-to-r from-amber-600 to-amber-500 py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          开始守护关于 TA 的真实记忆
        </h2>
        <p className="mt-4 text-lg text-amber-100">
          你的数据只属于你。我们不做 AI 合成，不投广告。
        </p>
        <div className="mt-8">
          <Link href="/register">
            <Button
              size="lg"
              className="h-12 px-10 bg-white text-amber-700 hover:bg-amber-50 rounded-lg font-medium"
            >
              开始纪念
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
