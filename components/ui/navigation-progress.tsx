'use client'

import { Suspense } from 'react'
import { ProgressBar } from '@/components/ui/progress-bar'

export function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <ProgressBar />
    </Suspense>
  )
}
