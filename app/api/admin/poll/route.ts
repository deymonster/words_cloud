import prisma from '../../../lib/prisma'
import { NextResponse } from 'next/server'
import { broadcastPoll } from '../../../lib/events'
export const runtime = 'nodejs'

function isAuthorized(headers: Headers) {
  const key = headers.get('x-admin-key') || ''
  const expected = process.env.ADMIN_SECRET || ''
  return expected ? key === expected : true
}

export async function POST(req: Request) {
  if (!isAuthorized(req.headers)) return new NextResponse('Unauthorized', { status: 401 })
  const { question } = await req.json()
  await prisma.poll.updateMany({ data: { status: 'INACTIVE' }, where: { status: 'ACTIVE' } })
  const poll = await prisma.poll.create({ data: { question, status: 'ACTIVE' } })
  broadcastPoll({ id: poll.id, question: poll.question })
  return NextResponse.json({ poll: { id: poll.id, question: poll.question } })
}
