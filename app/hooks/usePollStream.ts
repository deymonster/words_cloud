"use client"

import { useCallback, useEffect, useRef, useState } from 'react'

type Poll = { id: string; question: string } | null
export type CloudWord = { text: string; value: number }

type UsePollStreamOptions = {
  pollingIntervalMs?: number
  sseReconnectMs?: number
}

export function usePollStream(options: UsePollStreamOptions = {}) {
  const { pollingIntervalMs = 2000, sseReconnectMs = 3000 } = options
  const [poll, setPoll] = useState<Poll>(null)
  const [cloud, setCloud] = useState<CloudWord[]>([])
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  const fetchCurrent = useCallback(async () => {
    try {
      const res = await fetch('/api/poll/current')
      if (!res.ok) return
      const data = await res.json()
      setPoll(data.poll)
      setCloud(data.cloud || [])
    } catch {
      // Ignore fetch errors; SSE or next polling tick can recover.
    }
  }, [])

  const connect = useCallback(() => {
    eventSourceRef.current?.close()
    const es = new EventSource('/api/stream')
    eventSourceRef.current = es

    es.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data)
        if (payload.type === 'cloud') setCloud(payload.data)
        if (payload.type === 'poll') setPoll(payload.data)
      } catch {
        // Ignore malformed payloads.
      }
    }

    es.onerror = () => {
      es.close()
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = setTimeout(connect, sseReconnectMs)
    }
  }, [sseReconnectMs])

  useEffect(() => {
    fetchCurrent()
    connect()

    const interval = setInterval(fetchCurrent, pollingIntervalMs)

    return () => {
      eventSourceRef.current?.close()
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
      clearInterval(interval)
    }
  }, [connect, fetchCurrent, pollingIntervalMs])

  return { poll, cloud }
}
