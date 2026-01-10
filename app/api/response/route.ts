import prisma from '../../../lib/prisma'
import { NextResponse } from 'next/server'
import { broadcastCloud } from '../../../lib/events'
import { aggregateCloudForPoll } from '../../../lib/words'
export const runtime = 'nodejs'

export async function POST(req: Request) {
  const { name, text } = await req.json()
  const poll = await prisma.poll.findFirst({ where: { status: 'ACTIVE' } })
  if (!poll) return new NextResponse('Опрос не запущен', { status: 409 })
  
  await prisma.response.create({ data: { pollId: poll.id, name, text } })
  
  // Wait a bit to ensure DB consistency before reading back
  // (SQLite is usually fast but just in case)
  
  const responses = await prisma.response.findMany({ where: { pollId: poll.id } })
  
  // Broadcast AFTER fetching fresh data
  const cloudData = aggregateCloudForPoll(responses)
  broadcastCloud(cloudData)
  
  return NextResponse.json({ ok: true })
}
