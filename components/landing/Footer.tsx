import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          {/* Logo and tagline */}
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium text-stone-800">忆锚</span>
              <span className="text-sm text-stone-400">—</span>
              <span className="text-sm text-stone-500">守护真实记忆</span>
            </div>
            <p className="text-sm text-stone-400">
              © {currentYear} 忆锚. 让爱与回忆永不消逝。
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link
              href="/privacy"
              className="text-stone-500 hover:text-stone-700 transition-colors"
            >
              隐私政策
            </Link>
            <Link
              href="/terms"
              className="text-stone-500 hover:text-stone-700 transition-colors"
            >
              用户协议
            </Link>
            <a
              href="mailto:contact@yimao.app"
              className="text-stone-500 hover:text-stone-700 transition-colors"
            >
              联系
            </a>
          </div>
        </div>

        {/* ICP备案 - placeholder */}
        <div className="mt-6 text-center text-xs text-stone-400">
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-stone-500 transition-colors"
          >
            京ICP备XXXXXXXX号
          </a>
        </div>
      </div>
    </footer>
  )
}
