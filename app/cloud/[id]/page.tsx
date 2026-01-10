import React from 'react'
import { aggregateCloudForPoll } from '../../lib/words'
import prisma from '../../lib/prisma'
import CloudWrapper from '@/components/CloudWrapper'

export default async function CloudById({ params }: { params: { id: string } }) {
  const poll = await prisma.poll.findUnique({ where: { id: params.id }, include: { responses: true } })
  const words = poll ? aggregateCloudForPoll(poll.responses) : []
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Облако слов</h1>
      <p className="opacity-80 mb-6">{poll?.question}</p>
      <div className="h-[520px] card rounded-xl p-6">
        <CloudWrapper words={words} width={900} height={480} />
      </div>
    </div>
  )
}
