"use client"
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
const Cloud = dynamic(() => import('@/components/Cloud'), { ssr: false })

type CurrentPoll = { id: string; question: string } | null

export default function SurveyPage() {
  const [poll, setPoll] = useState<CurrentPoll>(null)
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [answer, setAnswer] = useState('')
  const [words, setWords] = useState<{ text: string; value: number }[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/poll/current').then(async (r) => {
      if (r.ok) {
        const data = await r.json()
        setPoll(data.poll)
        setWords(data.cloud || [])
      }
    })

    // Fallback: Poll every 2 seconds
    const interval = setInterval(() => {
      fetch('/api/poll/current').then(async (r) => {
        if (r.ok) {
          const data = await r.json()
          setPoll(data.poll)
          setWords(data.cloud || [])
        }
      })
    }, 2000)

    const es = new EventSource('/api/stream')
    es.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data)
        if (payload.type === 'cloud') setWords(payload.data)
        if (payload.type === 'poll') setPoll(payload.data)
      } catch {}
    }
    
    // Auto-reconnect on error
    es.onerror = () => {
       es.close()
       setTimeout(() => {
          // The useEffect will not re-run to create new ES, but the interval will keep working.
          // To properly reconnect ES, we'd need more complex logic or just rely on interval.
          // Since we have interval, we can just let ES die or try to reload page? 
          // Actually, relying on interval is enough for fallback.
       }, 3000)
    }

    return () => {
      es.close()
      clearInterval(interval)
    }
  }, [])

  const canGoToStep2 = useMemo(() => name.trim().length >= 2, [name])
  const canSubmit = useMemo(() => answer.trim().length >= 2 && !!poll, [answer, poll])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const res = await fetch('/api/response', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, text: answer })
    })
    if (!res.ok) {
      const msg = await res.text()
      setError(msg || 'Ошибка отправки')
      return
    }
    setStep(3)
  }

  // Waiting for poll
  if (!poll) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4 opacity-70">Опрос не запущен</h2>
        <p className="opacity-50">Пожалуйста, подождите, пока ведущий запустит опрос.</p>
      </div>
    )
  }

  // Step 1: Name
  if (step === 1) {
    return (
      <div className="max-w-md mx-auto card rounded-xl p-8 mt-10">
        <h2 className="text-2xl font-bold mb-6">Добро пожаловать!</h2>
        <div className="mb-6">
          <label className="block mb-2 opacity-80">Как вас зовут?</label>
          <input 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="w-full rounded border border-white/10 bg-transparent px-3 py-3 text-lg" 
            placeholder="Ваше имя" 
            autoFocus
          />
        </div>
        <button 
          onClick={() => setStep(2)} 
          disabled={!canGoToStep2} 
          className="w-full py-3 rounded bg-primary font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Далее
        </button>
      </div>
    )
  }

  // Step 2: Answer
  if (step === 2) {
    return (
      <div className="max-w-md mx-auto card rounded-xl p-8 mt-10">
        <h2 className="text-xl font-bold mb-4 opacity-80">{poll.question}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block mb-2 opacity-80">Ваш ответ</label>
            <textarea 
              value={answer} 
              onChange={(e) => setAnswer(e.target.value)} 
              className="w-full rounded border border-white/10 bg-transparent px-3 py-3 text-lg" 
              placeholder="Коротко опишите..." 
              rows={4} 
              autoFocus
            />
          </div>
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <button 
            type="submit"
            disabled={!canSubmit} 
            className="w-full py-3 rounded bg-primary font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Отправить ответ
          </button>
        </form>
        <button onClick={() => setStep(1)} className="mt-4 text-sm opacity-50 hover:opacity-100">← Назад</button>
      </div>
    )
  }

  // Step 3: Cloud
  return (
    <div className="max-w-4xl mx-auto mt-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Спасибо за ответ, {name}!</h2>
        <p className="opacity-70">Ваш голос учтен. Вот что думают другие:</p>
      </div>
      
      <section className="card rounded-xl p-6 relative min-h-[500px]">
        <div className="absolute inset-0 -z-10 animate-spinSlow opacity-10"></div>
        <div className="h-[480px]">
          <Cloud words={words} width={800} height={450} />
        </div>
      </section>
    </div>
  )
}
