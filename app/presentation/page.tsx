"use client"
import dynamic from 'next/dynamic'
import { usePollStream } from '@/app/hooks/usePollStream'

const Cloud = dynamic(() => import('@/components/Cloud'), { ssr: false })

export default function PresentationPage() {
  const { poll, cloud } = usePollStream()
  const question = poll?.question || ''

  if (!question) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-[url('/grid.svg')]">
        <div className="w-32 h-32 mb-8 rounded-full bg-white/5 flex items-center justify-center animate-pulse">
           <span className="text-6xl">⏳</span>
        </div>
        <h2 className="text-4xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">Опрос не запущен</h2>
        <p className="opacity-60 text-2xl">Ожидание начала сессии...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#0b1020] to-[#0b1020]">
      {/* Header: Question (Top, Full Width, Smaller Font) */}
      <header className="flex-none w-full p-4 md:p-6 z-20 relative bg-black/30 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1 text-center md:text-left min-w-0">
             <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] leading-tight break-words">
              {question}
            </h1>
          </div>
          
          <div className="flex-none flex items-center gap-3 text-blue-200/60 text-xs uppercase tracking-widest font-semibold bg-white/5 px-4 py-2 rounded-full">
             <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
             Live Results
          </div>
        </div>
      </header>
      
      {/* Main: Cloud (Centered, Oval/Circle shape) */}
      <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] animate-pulse"></div>
        
        <div className="relative w-full h-full flex items-center justify-center">
           <Cloud words={cloud} />
        </div>
      </div>

      <footer className="fixed bottom-2 right-4 text-white/10 text-[10px] font-mono pointer-events-none">
        Words Cloud Project
      </footer>
    </div>
  )
}
