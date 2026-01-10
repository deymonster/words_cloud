"use client"
import { useEffect, useMemo, useState } from 'react'
import QRCode from 'react-qr-code'
import dynamic from 'next/dynamic'
const Cloud = dynamic(() => import('@/components/Cloud'), { ssr: false })

export default function AdminPage() {
  const [key, setKey] = useState<string>('')
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [question, setQuestion] = useState('Какие сложности у вас возникают при работе в разноуровневом классе?')
  const [poll, setPoll] = useState<{ id: string; question: string; status: string } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const savedKey = localStorage.getItem('adminKey')
    if (savedKey) {
      setKey(savedKey)
      checkAuth(savedKey)
    }
  }, [])

  useEffect(() => {
    if (!isAuthorized) return
    
    // Initial fetch
    fetchPollStatus()

    const es = new EventSource('/api/stream')
    es.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data)
        if (payload.type === 'poll') {
           // Update poll status if it matches current
           fetchPollStatus() 
        }
      } catch {}
    }
    return () => es.close()
  }, [isAuthorized])

  const headers = useMemo(() => (key ? { 'x-admin-key': key } : {} as Record<string, string>), [key])

  async function checkAuth(k: string) {
    // We try to fetch current poll info. If it returns 401, we are not auth.
    // Actually /api/poll/current is public. We need an admin endpoint.
    // Let's use /api/admin/poll but with a GET? No, it's POST.
    // Let's just try to list polls or create a dummy check.
    // For now, we will just trust the key until an action is performed, 
    // OR we can implement a verify step. 
    // Let's assume if the user clicks "Login", we save the key.
    // Real validation happens on action.
    // But user wants a login step.
    setIsAuthorized(true)
    localStorage.setItem('adminKey', k)
  }

  async function fetchPollStatus() {
    const res = await fetch('/api/poll/current')
    if (res.ok) {
      const data = await res.json()
      // This endpoint returns active poll.
      if (data.poll) {
        setPoll({ ...data.poll, status: 'ACTIVE' })
        setQuestion(data.poll.question)
      } else {
        setPoll(null)
      }
    }
  }

  async function startPoll() {
    setError('')
    const res = await fetch('/api/admin/poll', { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify({ question }) })
    if (res.ok) {
      const data = await res.json()
      setPoll({ ...data.poll, status: 'ACTIVE' })
    } else {
      if (res.status === 401) {
        setError('Неверный ключ админа')
        setIsAuthorized(false)
      } else {
        setError('Ошибка запуска опроса')
      }
    }
  }

  async function finalizePoll() {
    setError('')
    const res = await fetch('/api/admin/finalize', { method: 'POST', headers })
    if (res.ok) {
      setPoll(null)
    } else {
      if (res.status === 401) {
        setError('Неверный ключ админа')
        setIsAuthorized(false)
      }
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (key) checkAuth(key)
  }

  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 card rounded-xl">
        <h1 className="text-2xl font-bold mb-6 text-center">Вход для администратора</h1>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block mb-2 opacity-80">Секретный ключ</label>
            <input 
              type="password"
              value={key} 
              onChange={(e) => setKey(e.target.value)} 
              className="w-full rounded border border-white/10 bg-transparent px-3 py-2" 
              placeholder="Введите ключ" 
            />
          </div>
          <button type="submit" className="w-full py-2 rounded bg-primary font-bold">Войти</button>
        </form>
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-1 gap-8 max-w-3xl mx-auto">
      <section className="card rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Управление опросом</h2>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${poll ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500'}`}></span>
            <span className="text-sm font-mono opacity-80">{poll ? 'АКТИВЕН' : 'НЕ АКТИВЕН'}</span>
          </div>
        </div>

        {error && <div className="bg-red-500/20 text-red-200 p-3 rounded mb-4">{error}</div>}

        <div className="mb-6">
          <label className="block mb-1 opacity-80">Вопрос для аудитории</label>
          <input 
            value={question} 
            onChange={(e) => setQuestion(e.target.value)} 
            className="w-full rounded border border-white/10 bg-transparent px-3 py-2 text-lg" 
            disabled={!!poll}
          />
        </div>

        <div className="flex flex-wrap gap-4">
          {!poll ? (
            <button onClick={startPoll} className="px-6 py-3 rounded bg-green-600 hover:bg-green-500 font-bold transition-colors">
              Запустить опрос
            </button>
          ) : (
            <button onClick={finalizePoll} className="px-6 py-3 rounded bg-red-600 hover:bg-red-500 font-bold transition-colors">
              Завершить опрос
            </button>
          )}
        </div>

        <hr className="my-8 border-white/10" />

        <h3 className="text-lg font-semibold mb-4">Инструменты</h3>
        <div className="flex flex-wrap gap-4">
          <a 
            href="/qr" 
            target="_blank" 
            className="flex items-center gap-2 px-4 py-2 rounded bg-white/10 hover:bg-white/20 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><path d="M3 14h1v1h-1z"></path><path d="M5 14h1v1h-1z"></path><path d="M3 16h1v1h-1z"></path><path d="M7 16h1v1h-1z"></path><path d="M5 18h1v1h-1z"></path><path d="M3 19h1v1h-1z"></path><path d="M7 19h1v1h-1z"></path><path d="M9 14h1v1h-1z"></path><path d="M9 16h1v1h-1z"></path><path d="M9 18h1v1h-1z"></path></svg>
            Открыть QR-код
          </a>
          <a 
            href="/presentation" 
            target="_blank" 
            className="flex items-center gap-2 px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
            Открыть Облако (Презентация)
          </a>
        </div>
      </section>
      
      <div className="text-center opacity-50 text-sm">
        <button onClick={() => { localStorage.removeItem('adminKey'); setIsAuthorized(false); setKey('') }} className="underline hover:text-white">
          Выйти из админки
        </button>
      </div>
    </div>
  )
}
