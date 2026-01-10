"use client"

import dynamic from 'next/dynamic'
import React from 'react'
import type { Word } from '@/app/lib/words'

const Cloud = dynamic(() => import('@/components/Cloud'), { ssr: false })

interface CloudWrapperProps {
  words: Word[]
  width?: number
  height?: number
}

export default function CloudWrapper({ words, width, height }: CloudWrapperProps) {
  return <Cloud words={words} width={width} height={height} />
}
