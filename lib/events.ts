type SendFn = (payload: unknown) => void

let subscribers = new Map<number, SendFn>()
let nextId = 1

export function addSubscriber(send: SendFn) {
  const id = nextId++
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

