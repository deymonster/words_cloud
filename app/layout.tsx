import './globals.css'
import type { ReactNode } from 'react'

export const metadata = {
  title: 'WordCloud Live',
  description: 'Онлайн облако слов для мероприятий'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen">
        <main className="w-full h-full min-h-screen">{children}</main>
      </body>
    </html>
  )
}

