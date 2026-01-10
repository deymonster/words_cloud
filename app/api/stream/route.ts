import { NextResponse } from 'next/server'
import { addSubscriber, removeSubscriber } from '../../lib/events'
export const runtime = 'nodejs'

export async function GET() {
  let subscriberId: number | null = null

  const stream = new ReadableStream({
    start(controller) {
      const send = (payload: unknown) => {
        try {
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(payload)}\n\n`))
        } catch (e) {
          if (subscriberId) removeSubscriber(subscriberId)
        }
      }
      subscriberId = addSubscriber(send)
    },
    cancel() {
      if (subscriberId) removeSubscriber(subscriberId)
    }
  })

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Content-Encoding': 'none'
    }
  })
}
