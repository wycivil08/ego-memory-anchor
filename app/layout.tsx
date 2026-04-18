import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })

export const metadata: Metadata = {
  title: "Memory Anchor (忆锚) - 永不丢失 关于 TA 的真实记忆",
  description: "永不丢失关于TA的真实记忆。忆锚帮助失去至亲的人将散落的真实记录汇集到一处。",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" className={inter.variable}>
      <body className="min-h-full antialiased font-sans bg-stone-50 text-stone-900 selection:bg-amber-100 selection:text-amber-900">
        {children}
      </body>
    </html>
  )
}
