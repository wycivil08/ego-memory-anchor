import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "忆锚 - 真实记忆聚合平台",
  description: "永不丢失关于TA的真实记忆。忆锚帮助失去至亲的人将散落的真实记录汇集到一处。",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-full antialiased">{children}</body>
    </html>
  )
}
