type SendFn = (payload: unknown) => void

const globalForEvents = global as unknown as {
  subscribers: Map<number, SendFn>
  nextId: number
}

const subscribers = globalForEvents.subscribers || new Map<number, SendFn>()
let nextId = globalForEvents.nextId || 1

if (process.env.NODE_ENV !== 'production') {
  globalForEvents.subscribers = subscribers
  globalForEvents.nextId = nextId
}

export function addSubscriber(send: SendFn) {
  const id = nextId++
  if (process.env.NODE_ENV !== 'production') globalForEvents.nextId = nextId
  subscribers.set(id, send)
  return id
}

export function removeSubscriber(id: number) {
  subscribers.delete(id)
}

export function broadcastCloud(data: unknown) {
  for (const send of subscribers.values()) send({ type: 'cloud', data })
}

export function broadcastPoll(data: unknown) {
  for (const send of subscribers.values()) send({ type: 'poll', data })
}

