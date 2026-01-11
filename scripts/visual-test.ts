import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const TEST_WORD = 'ПРОВЕРКА_' + Math.floor(Math.random() * 1000)
  console.log(`Starting visual test with word: ${TEST_WORD}`)

  // 1. Get active poll
  const poll = await prisma.poll.findFirst({ where: { status: 'ACTIVE' } })
  if (!poll) {
    console.error('No active poll found!')
    return
  }

  console.log(`Adding word "${TEST_WORD}" 5 times...`)

  // Add the word 5 times to ensure it has enough weight
  for (let i = 0; i < 5; i++) {
    await prisma.response.create({
      data: {
        pollId: poll.id,
        name: 'VisualTester',
        text: TEST_WORD,
      }
    })
    console.log(`Added ${i + 1}/5`)
    // Small delay to simulate real users
    await new Promise(r => setTimeout(r, 500))
  }

  console.log('Finished adding words. Check the presentation screen!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
