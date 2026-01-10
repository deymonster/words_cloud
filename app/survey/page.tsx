"use client"
import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { usePollStream } from '@/app/hooks/usePollStream'
const Cloud = dynamic(() => import('@/components/Cloud'), { ssr: false })

export default function SurveyPage() {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { poll, cloud } = usePollStream()

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
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-20 h-20 mb-6 rounded-full bg-white/5 flex items-center justify-center animate-pulse">
           <span className="text-4xl">⏳</span>
        </div>
        <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">Опрос пока не запущен</h2>
        <p className="opacity-60 text-lg max-w-md">Пожалуйста, подождите, пока ведущий начнет голосование. Эта страница обновится автоматически.</p>
      </div>
    )
  }

  // Step 1: Name
  if (step === 1) {
    return (
      <div className="max-w-md mx-auto card rounded-2xl p-8 mt-10 shadow-2xl transform transition-all hover:shadow-blue-900/20">
        <h2 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">Давайте знакомиться!</h2>
        <div className="mb-8">
          <label className="block mb-3 text-sm uppercase tracking-wider text-blue-200 opacity-80 font-semibold">Как вас зовут?</label>
          <input 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-4 text-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-white/20" 
            placeholder="Ваше имя" 
            autoFocus
          />
        </div>
        <button 
          onClick={() => setStep(2)} 
          disabled={!canGoToStep2} 
          className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-900/50"
        >
          Далее
        </button>
      </div>
    )
  }

  // Step 2: Answer
  if (step === 2) {
    return (
      <div className="max-w-md mx-auto card rounded-2xl p-8 mt-10 shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 opacity-90 leading-relaxed">{poll.question}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block mb-3 text-sm uppercase tracking-wider text-blue-200 opacity-80 font-semibold">Ваш ответ</label>
            <textarea 
              value={answer} 
              onChange={(e) => setAnswer(e.target.value)} 
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-4 text-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-white/20 resize-none" 
              placeholder="Введите ответ..." 
              rows={5} 
              autoFocus
            />
            <p className="text-xs text-right mt-2 opacity-50">Нажмите Enter для переноса строки</p>
          </div>
          {error && <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6 text-sm">{error}</div>}
          <button 
            type="submit"
            disabled={!canSubmit} 
            className="w-full py-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-900/50"
          >
            Отправить ответ
          </button>
        </form>
        <button onClick={() => setStep(1)} className="mt-6 text-sm opacity-50 hover:opacity-100 flex items-center justify-center w-full transition-opacity">
          <span className="mr-1">←</span> Назад
        </button>
      </div>
    )
  }

  // Step 3: Cloud
  return (
    <div className="max-w-5xl mx-auto mt-6 px-4">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-blue-300">Спасибо, {name}!</h2>
        <p className="opacity-70 text-lg">Ваш ответ принят. Наблюдайте за результатами в реальном времени:</p>
      </div>
      
      <section className="card rounded-3xl p-8 relative min-h-[600px] border border-white/10 shadow-[0_0_100px_rgba(50,50,150,0.2)]">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-500/5 to-purple-500/5 rounded-3xl"></div>
        <div className="h-[550px]">
          <Cloud words={cloud} width={900} height={550} />
        </div>
      </section>
    </div>
  )
}
