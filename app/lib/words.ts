import type { Response } from '@prisma/client'

const RU_STOP = new Set(['и','в','на','с','к','по','за','как','что','это','не','да','но','о','от','до','для','из','у','я','мы','они','вы','он','она','оно','так','же','ли','бы','при','над','без','про','или'])
const EN_STOP = new Set(['the','a','an','and','or','of','to','in','on','for','is','are','was','were','be','been','it','by','with','as','not'])

export function tokenize(text: string) {
  // Split by comma or newline to preserve phrases
  // If no commas/newlines, treat the whole text as one phrase if it's short (< 50 chars)
  // Otherwise split by space
  
  const rawTokens = text.split(/[\n,]+/)
  const tokens: string[] = []

  for (const t of rawTokens) {
    const trimmed = t.trim()
    if (!trimmed) continue
    
    // If user explicitly used commas, trust the split
    // Also clean up common punctuation at edges but keep internal
    const clean = trimmed.replace(/^[^a-zA-Zа-яА-Я0-9]+|[^a-zA-Zа-яА-Я0-9]+$/g, '')
    
    if (clean.length > 1) {
       // Check if it's just a stop word (optional, maybe keep everything now?)
       // User complained "не знаю" became "знаю". So we should keep "не знаю".
       // We only filter if the ENTIRE token is a stop word (e.g. just "and")
       const lower = clean.toLowerCase()
       if (!RU_STOP.has(lower) && !EN_STOP.has(lower)) {
         tokens.push(clean) // Keep original case for display? Or capitalize?
         // Let's capitalize first letter for consistency
         // Actually, let's keep original casing but standardise in aggregation
       }
    }
  }
  return tokens
}

export interface Word {
  text: string
  value: number
}

export function aggregateCloudForPoll(responses: Response[]) {
  const freq = new Map<string, number>()
  for (const r of responses) {
    const tokens = tokenize(r.text)
    for (const w of tokens) {
      // Normalize for counting: lowercase
      // But we want to display with nice casing.
      // Let's store a display version map
      const key = w.toLowerCase()
      freq.set(key, (freq.get(key) ?? 0) + 1)
    }
  }
  
  // Convert back to array, finding the best display version for each key? 
  // For simplicity, let's just Capitalize the key.
  
  return Array.from(freq.entries())
    .sort((a,b) => b[1]-a[1])
    .slice(0, 500)
    .map(([key, value]) => ({ 
      text: key.charAt(0).toUpperCase() + key.slice(1), 
      value 
    }))
}

