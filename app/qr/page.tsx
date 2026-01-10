"use client"
import { useEffect, useState } from 'react'
import QRCode from 'react-qr-code'

export default function QrPage() {
  const [url, setUrl] = useState('')

  useEffect(() => {
    setUrl(`${window.location.origin}/survey`)
  }, [])

  if (!url) return null

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Сканируйте для участия</h1>
      <div className="p-4 bg-white rounded-xl shadow-xl border-4 border-black">
        <QRCode value={url} size={400} />
      </div>
      <p className="mt-8 text-2xl font-mono">{url}</p>
    </div>
  )
}
