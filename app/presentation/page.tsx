"use client"
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const Cloud = dynamic(() => import('@/components/Cloud'), { ssr: false })

export default function PresentationPage() {
  const [words, setWords] = useState<{ text: string; value: number }[]>([])
  const [question, setQuestion] = useState('')

  useEffect(() => {
    let es: EventSource | null = null;

    function connect() {
      // Initial fetch
      fetch('/api/poll/current').then(async (r) => {
        if (r.ok) {
          const data = await r.json()
          if (data.poll) setQuestion(data.poll.question)
          if (data.cloud) setWords(data.cloud)
        }
      })

      es = new EventSource('/api/stream')
      es.onmessage = (ev) => {
        try {
          const payload = JSON.parse(ev.data)
          if (payload.type === 'cloud') setWords(payload.data)
          if (payload.type === 'poll') setQuestion(payload.data?.question || '')
        } catch {}
      }
      es.onerror = () => {
        es?.close()
        // Try to reconnect in 3s
        setTimeout(connect, 3000)
      }
    }

    connect()

    // Fallback: Poll every 2 seconds to ensure data is fresh even if SSE fails
    const interval = setInterval(() => {
      fetch('/api/poll/current').then(async (r) => {
        if (r.ok) {
          const data = await r.json()
          if (data.poll) setQuestion(data.poll.question)
          if (data.cloud) setWords(data.cloud)
        }
      })
    }, 2000)

    return () => {
      es?.close()
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-900 text-white overflow-hidden">
      {question && (
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center max-w-5xl z-10 relative">
          {question}
        </h1>
      )}
      <div className="flex-1 w-full flex items-center justify-center relative">
        <div className="absolute inset-0 -z-10 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-900 to-slate-900"></div>
        {words.length > 0 ? (
          <Cloud words={words} width={1200} height={700} />
        ) : (
          <p className="text-2xl opacity-50 animate-pulse">Ожидание ответов...</p>
        )}
      </div>
    </div>
  )
}
