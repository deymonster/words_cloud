import prisma from '../../../lib/prisma'
import { NextResponse } from 'next/server'
import { aggregateCloudForPoll } from '../../../lib/words'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const poll = await prisma.poll.findFirst({ where: { status: 'ACTIVE' }, include: { responses: true } })
  const cloud = poll ? aggregateCloudForPoll(poll.responses) : []
  return NextResponse.json({ poll: poll ? { id: poll.id, question: poll.question } : null, cloud })
}
