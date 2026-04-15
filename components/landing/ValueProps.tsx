import { Card, CardContent } from '@/components/ui/card'

const features = [
  {
    icon: (
      <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
    title: '汇集',
    description: '把散落在手机、微信、云盘里的照片和录音收集到一个安全的地方',
  },
  {
    icon: (
      <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
    title: '时间线',
    description: '自动按日期排列，编织成一条从出生到告别的生命故事',
  },
  {
    icon: (
      <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
    title: '家人共建',
    description: '邀请家人一起补充记忆，每个人的视角都珍贵',
  },
]

export function ValueProps() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="sr-only text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
          核心功能
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-stone-200 bg-white text-center transition-shadow hover:shadow-md"
            >
              <CardContent className="pt-8">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-medium text-stone-800">{feature.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-stone-500">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
