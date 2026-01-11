"use client"
import { useEffect, useMemo, useRef, useState } from 'react'
import cloud from 'd3-cloud'

type Word = { text: string; value: number }

export default function Cloud({ words, width = 800, height = 400, theme = 'dark' }: { words: Word[]; width?: number; height?: number; theme?: 'dark' | 'light' }) {
  const [layout, setLayout] = useState<{ x: number; y: number; rotate: number; text: string; size: number }[]>([])
  const containerRef = useRef<HTMLDivElement | null>(null)
  
  // Use a fixed internal aspect ratio for the cloud generation to ensure consistent oval shape
  // 1:1 aspect ratio forces a more circular/rounded shape (which then fills the container)
  const internalWidth = 900
  const internalHeight = 900

  const sized = useMemo(() => {
    if (words.length === 0) return []
    const max = Math.max(1, ...words.map(w => w.value))
    const min = Math.min(...words.map(w => w.value))
    
    // Scale font sizes based on the internal canvas size
    // Slightly reduced max size to ensure better packing within the oval height
    const minSize = 15
    const maxSize = 90

    if (max === min) {
       return words.map(w => ({ ...w, size: (minSize + maxSize) / 2 }))
    }

    return words.map(w => ({ 
      ...w, 
      size: minSize + ((w.value - min) / (max - min)) * (maxSize - minSize)
    }))
  }, [JSON.stringify(words)])

  // Palettes
  const darkThemeColors = ["#E53935", "#D81B60", "#8E24AA", "#5E35B1", "#3949AB", "#1E88E5", "#039BE5", "#00ACC1", "#00897B", "#43A047", "#7CB342", "#C0CA33", "#FDD835", "#FFB300", "#FB8C00", "#F4511E"]
  // Darker shades for better contrast on light background
  const lightThemeColors = ["#C62828", "#AD1457", "#6A1B9A", "#4527A0", "#283593", "#1565C0", "#0277BD", "#00838F", "#00695C", "#2E7D32", "#558B2F", "#9E9D24", "#F9A825", "#FF8F00", "#EF6C00", "#D84315"]
  
  const colors = theme === 'dark' ? darkThemeColors : lightThemeColors

  useEffect(() => {
    const c = cloud()
      .size([internalWidth, internalHeight])
      .words(sized.map(w => ({ text: w.text, size: w.size })))
      .padding(5) 
      .spiral('archimedean') // Archimedean spiral naturally forms a circle/oval given the bounds
      .rotate(() => 0) 
      .font('Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif')
      .fontSize((d: any) => d.size)
      .on('end', (out: any[]) => {
        setLayout(out.map(d => ({ x: d.x, y: d.y, rotate: d.rotate, text: d.text, size: d.size })))
      })
    c.start()
    return () => { c.stop() }
  }, [sized])

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center">
      <svg 
        viewBox={`0 0 ${internalWidth} ${internalHeight}`} 
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full max-w-full max-h-full"
        style={{ overflow: 'visible' }} // Allow slight overflows if any, but viewBox should handle it
      >
        <g transform={`translate(${internalWidth / 2},${internalHeight / 2})`}>
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

