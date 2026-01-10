"use client"
import { useEffect, useState } from 'react'
import QRCode from 'react-qr-code'

export default function QrCodeView({ initialUrl }: { initialUrl?: string }) {
  const [url, setUrl] = useState(initialUrl || '')

  useEffect(() => {
    if (!url) {
      setUrl(`${window.location.origin}/survey`)
    }
  }, [url])

  if (!url) return null

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white p-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400">
          Присоединяйтесь!
        </h1>
        <p className="text-xl md:text-2xl opacity-80">Сканируйте QR-код для участия в опросе</p>
      </div>
      
      <div className="p-6 bg-white rounded-3xl shadow-[0_0_50px_rgba(100,100,255,0.3)] transform hover:scale-105 transition-transform duration-300">
        <QRCode value={url} size={350} />
      </div>

      <div className="mt-12 px-6 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
        <p className="text-lg md:text-xl font-mono text-blue-200 tracking-wide">{url}</p>
      </div>
    </div>
  )
}
