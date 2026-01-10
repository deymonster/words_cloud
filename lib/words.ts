import type { Response } from '@prisma/client'

const RU_STOP = new Set(['и','в','на','с','к','по','за','как','что','это','не','да','но','о','от','до','для','из','у','я','мы','они','вы','он','она','оно','так','же','ли','бы','при','над','без','про','или'])
const EN_STOP = new Set(['the','a','an','and','or','of','to','in','on','for','is','are','was','were','be','been','it','by','with','as','not'])

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[.,!?;:\-()"'\[\]]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !RU_STOP.has(w) && !EN_STOP.has(w))
}

export function aggregateCloudForPoll(responses: Response[]) {
  const freq = new Map<string, number>()
  for (const r of responses) {
    for (const w of tokenize(r.text)) freq.set(w, (freq.get(w) ?? 0) + 1)
  }
  return Array.from(freq.entries())
    .sort((a,b) => b[1]-a[1])
    .slice(0, 200)
    .map(([text, value]) => ({ text, value }))
}

