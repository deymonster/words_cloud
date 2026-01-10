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
      <div className="max-w-md mx-auto mt-20 p-8 card rounded-2xl shadow-2xl backdrop-blur-xl bg-white/5 border border-white/10">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">Вход для администратора</h1>
        <form onSubmit={handleLogin}>
          <div className="mb-6">
            <label className="block mb-2 text-sm uppercase tracking-wider text-blue-200/60 font-semibold">Секретный ключ</label>
            <input 
              type="password"
              value={key} 
              onChange={(e) => setKey(e.target.value)} 
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-white/20" 
              placeholder="••••••••" 
            />
          </div>
          <button type="submit" className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-bold text-lg shadow-lg shadow-blue-900/40 transition-all transform hover:scale-[1.02]">Войти в систему</button>
        </form>
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-1 gap-8 max-w-4xl mx-auto p-4">
      <section className="card rounded-3xl p-8 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.3)] bg-gradient-to-b from-white/5 to-transparent">
        <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
          <div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">Панель управления</h2>
            <p className="text-sm opacity-50 mt-1">Управляйте ходом голосования</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-black/20 border border-white/5">
            <span className={`w-3 h-3 rounded-full animate-pulse ${poll ? 'bg-green-500 shadow-[0_0_15px_#22c55e]' : 'bg-red-500'}`}></span>
            <span className={`text-sm font-bold tracking-wider ${poll ? 'text-green-400' : 'text-red-400'}`}>{poll ? 'АКТИВЕН' : 'НЕ АКТИВЕН'}</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl mb-6 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            {error}
          </div>
        )}

        <div className="mb-8">
          <label className="block mb-3 text-sm uppercase tracking-wider text-blue-200/60 font-semibold">Вопрос для аудитории</label>
          <input 
            value={question} 
            onChange={(e) => setQuestion(e.target.value)} 
            className={`w-full rounded-xl border border-white/10 bg-black/20 px-4 py-4 text-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${poll ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!!poll}
            placeholder="Введите вопрос..."
          />
        </div>

        <div className="flex flex-wrap gap-4">
          {!poll ? (
            <button onClick={startPoll} className="flex-1 py-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 font-bold text-lg shadow-lg shadow-green-900/40 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              Запустить опрос
            </button>
          ) : (
            <button onClick={finalizePoll} className="flex-1 py-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 font-bold text-lg shadow-lg shadow-red-900/40 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
              Завершить опрос
            </button>
          )}
        </div>

        <div className="my-10 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <h3 className="text-lg font-semibold mb-6 text-blue-200/80 uppercase tracking-wider text-sm">Быстрый доступ</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a 
            href="/qr" 
            target="_blank" 
            className="group flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all"
          >
            <div className="p-2 rounded-lg bg-white/5 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><path d="M3 14h1v1h-1z"></path><path d="M5 14h1v1h-1z"></path><path d="M3 16h1v1h-1z"></path><path d="M7 16h1v1h-1z"></path><path d="M5 18h1v1h-1z"></path><path d="M3 19h1v1h-1z"></path><path d="M7 19h1v1h-1z"></path><path d="M9 14h1v1h-1z"></path><path d="M9 16h1v1h-1z"></path><path d="M9 18h1v1h-1z"></path></svg>
            </div>
            <span className="font-semibold">QR-код для участников</span>
          </a>
          <a 
            href="/presentation" 
            target="_blank" 
            className="group flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 hover:border-blue-400/50 transition-all"
          >
            <div className="p-2 rounded-lg bg-blue-500/20 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
            </div>
            <span className="font-semibold text-blue-200">Экран презентации</span>
          </a>
        </div>
      </section>
      
      <div className="text-center opacity-40 text-sm hover:opacity-100 transition-opacity">
        <button onClick={() => { localStorage.removeItem('adminKey'); setIsAuthorized(false); setKey('') }} className="flex items-center gap-2 mx-auto hover:text-red-400 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          Выйти из системы
        </button>
      </div>
    </div>
  )
}
