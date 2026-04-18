'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function FounderStory() {
  const [expanded, setExpanded] = useState(false)

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
            关于创始人
          </h2>
        </div>

        <div className="mt-10 flex flex-col items-center gap-8 sm:flex-row sm:items-start">
          {/* Avatar placeholder */}
          <div className="flex-shrink-0">
            <div className="h-32 w-32 rounded-full bg-gradient-to-br from-amber-100 to-stone-200 flex items-center justify-center text-4xl">
              🕯️
            </div>
          </div>

          {/* Story content */}
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-lg font-medium text-stone-800">Kevin</h3>
            <p className="mt-1 text-sm text-stone-500">忆锚创始人</p>

            <div className="mt-4 space-y-3 text-sm leading-relaxed text-stone-600">
              <p>
                2024年，我永远失去了陪伴我12年的狗狗球球。
                在整理它的照片时，我发现记忆正在以我无法控制的速度消散——
                那些照片散落在各个云盘里，聊天记录早就找不到了。
              </p>
              {expanded && (
                <>
                  <p>
                    我开始思考：为什么我们能轻易找回误删的工作文档，
                    却无法保护关于家人的珍贵记忆？那些记忆，一旦丢失，就再也找不回来了。
                  </p>
                  <p>
                    忆锚就这样诞生了。它不是一个普通的云盘，
                    而是一个专门为纪念逝者设计的记忆空间。
                    在这里，每一份记忆都被标记为{"\u201c"}原始记录{"\u201d"}，
                    永远不会被篡改或生成。
                  </p>
                  <p className="font-medium text-stone-700">
                    球球教会我：真正的告别不是遗忘，而是在记忆中继续相爱。
                  </p>
                </>
              )}
            </div>

            <Button
              variant="link"
              onClick={() => setExpanded(!expanded)}
              className="mt-4 h-auto p-0 text-amber-700 hover:text-amber-800"
            >
              {expanded ? '收起' : '展开全文'}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
