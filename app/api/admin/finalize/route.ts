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
  const poll = await prisma.poll.findFirst({ where: { status: 'ACTIVE' } })
  if (poll) {
    await prisma.poll.update({ where: { id: poll.id }, data: { status: 'INACTIVE', finalizedAt: new Date() } })
    broadcastPoll(null)
  }
  return NextResponse.json({ ok: true })
}
