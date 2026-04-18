import Link from 'next/link'
import { Sparkles, CalendarPlus } from 'lucide-react'

interface TimelineEmptyProps {
  profileId: string
  className?: string
}

export function TimelineEmpty({ profileId, className }: TimelineEmptyProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 bg-white/50 py-24 text-center backdrop-blur-sm transition-all hover:bg-white hover:border-amber-700/30 ${className || ''}`}
    >
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-amber-100 rounded-full blur-xl scale-150 opacity-50" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-stone-50 border border-stone-100 text-stone-400 shadow-sm">
          <CalendarPlus className="h-10 w-10 text-amber-700/40" />
        </div>
      </div>
      
      <h2 className="text-xl font-medium text-stone-800 tracking-tight">记忆的开端</h2>
      <p className="mt-3 max-w-sm text-sm text-stone-500 leading-relaxed font-light">
        在这里，时间会慢下来。上传那些珍贵的影像与文字，将散落的光影锚定在永恒的长廊里。
      </p>
      
      <Link href={`/profile/${profileId}/upload`} className="mt-8">
        <button className="flex items-center gap-2 bg-amber-700 text-white font-medium px-8 py-3.5 rounded-full shadow-lg shadow-amber-700/20 hover:bg-amber-800 hover:scale-[1.02] transition-all active:scale-[0.98]">
          <Sparkles className="w-4 h-4" />
          开启第一段记忆
        </button>
      </Link>
    </div>
  )
}
