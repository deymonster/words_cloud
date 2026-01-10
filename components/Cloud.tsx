"use client"
import { useEffect, useMemo, useRef, useState } from 'react'
import cloud from 'd3-cloud'

type Word = { text: string; value: number }

export default function Cloud({ words, width = 800, height = 400 }: { words: Word[]; width?: number; height?: number }) {
  const [layout, setLayout] = useState<{ x: number; y: number; rotate: number; text: string; size: number }[]>([])
  const containerRef = useRef<HTMLDivElement | null>(null)

  const sized = useMemo(() => {
    if (words.length === 0) return []
    const max = Math.max(1, ...words.map(w => w.value))
    const min = Math.min(...words.map(w => w.value))
    
    // If all words have the same frequency (e.g. 1), pick a medium size
    if (max === min) {
       return words.map(w => ({ ...w, size: 60 }))
    }

    // Otherwise scale between 30 and 100
    return words.map(w => ({ 
      ...w, 
      size: Math.max(30, Math.min(100, 30 + ((w.value - min) / (max - min)) * 70)) 
    }))
  }, [words])

  // Vibrant palette
  const colors = ["#E53935", "#D81B60", "#8E24AA", "#5E35B1", "#3949AB", "#1E88E5", "#039BE5", "#00ACC1", "#00897B", "#43A047", "#7CB342", "#C0CA33", "#FDD835", "#FFB300", "#FB8C00", "#F4511E"]

  useEffect(() => {
    const c = cloud()
      .size([width, height])
      .words(sized.map(w => ({ text: w.text, size: w.size })))
      .padding(10) // Increase padding slightly to prevent overlap issues
      .spiral('archimedean')
      .rotate(() => 0) // No rotation (horizontal only)
      .font('Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif')
      .fontSize((d: any) => d.size)
      .on('end', (out: any[]) => {
        setLayout(out.map(d => ({ x: d.x, y: d.y, rotate: d.rotate, text: d.text, size: d.size })))
      })
    c.start()
    return () => { c.stop() }
  }, [sized, width, height])

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="max-w-full h-auto">
        <g transform={`translate(${width / 2},${height / 2})`}>
          {layout.map((w, i) => (
            <text 
              key={`${w.text}-${i}`} 
              transform={`translate(${w.x},${w.y}) rotate(${w.rotate})`} 
              fontSize={w.size} 
              textAnchor="middle" 
              style={{ fontFamily: 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif' }}
              fill={colors[i % colors.length]}
            >
              {w.text}
            </text>
          ))}
        </g>
      </svg>
    </div>
  )
}

