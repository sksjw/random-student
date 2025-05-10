import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '随机选人',
  description: 'VacuolePao开发的随机选人工具，支持丰富的自定义功能',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
