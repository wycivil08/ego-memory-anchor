import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface TimelineEmptyProps {
  profileId: string
  className?: string
}

export function TimelineEmpty({ profileId, className }: TimelineEmptyProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-white py-16 text-center ${className || ''}`}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
        <svg
          className="h-8 w-8 text-stone-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
      <h2 className="text-lg font-medium text-stone-700">还没有记忆</h2>
      <p className="mt-1 max-w-sm text-sm text-stone-500">
        上传照片、视频、语音或文字，记录关于 TA 的真实记忆
      </p>
      <Link href={`/profile/${profileId}/upload`} className="mt-6">
        <Button className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-colors duration-150">
          上传第一条记忆
        </Button>
      </Link>
    </div>
  )
}
