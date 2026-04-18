const steps = [
  {
    number: '01',
    title: '上传记忆',
    description: '拖拽照片、视频、语音到忆锚，系统自动读取拍摄日期',
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
        />
      </svg>
    ),
  },
  {
    number: '02',
    title: '时间线自动生成',
    description: '系统按日期自动排列，从出生到告别编织成完整生命故事',
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
        />
      </svg>
    ),
  },
  {
    number: '03',
    title: '家人一起守护',
    description: '邀请家人加入，每个人都可以补充记忆、添加注释',
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
  },
]

export function HowItWorks() {
  return (
    <section className="bg-stone-50 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
            简单三步，守护永恒
          </h2>
          <p className="mt-4 text-stone-600">从今天开始，为 TA 编织一条永不丢失的记忆时间线</p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {steps.map((step, index) => (
            <div key={index} className="relative text-center">
              {/* Connector line between steps */}
              {index < steps.length - 1 && (
                <div className="hidden sm:block absolute top-10 left-1/2 w-full h-px bg-stone-200 -z-10" />
              )}

              {/* Step number circle */}
              <div className="relative inline-flex items-center justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  {step.icon}
                </div>
                <span className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-700 text-xs font-medium text-white">
                  {step.number}
                </span>
              </div>

              <h3 className="mt-6 text-lg font-medium text-stone-800">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-stone-500">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
