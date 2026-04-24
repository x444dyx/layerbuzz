'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function ProgressBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [state, setState] = useState<'idle' | 'loading' | 'complete'>('idle')
  const prevPathname = useRef(pathname)
  const completeTimer = useRef<NodeJS.Timeout | null>(null)

  // When pathname changes — page has loaded, complete the bar
  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname
      if (state === 'loading') {
        setState('complete')
        completeTimer.current = setTimeout(() => setState('idle'), 500)
      }
    }
  }, [pathname, searchParams])

  // Listen for link clicks to start loading state
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a')
      if (!target) return
      const href = target.getAttribute('href')
      if (!href || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('#')) return
      const hrefPathname = href.split('?')[0]
      if (hrefPathname === window.location.pathname) return
      if (completeTimer.current) clearTimeout(completeTimer.current)
      setState('loading')
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  if (state === 'idle') return null

  return (
    <>
      <style>{`
        @keyframes indeterminate {
          0% { left: -40%; width: 40%; }
          50% { left: 30%; width: 50%; }
          100% { left: 100%; width: 40%; }
        }
        @keyframes completeBar {
          0% { width: 0%; opacity: 1; }
          100% { width: 100%; opacity: 1; }
        }
      `}</style>

      <div className="fixed top-0 left-0 right-0 z-[9999] h-[2px] pointer-events-none overflow-hidden">
        {state === 'loading' ? (
          /* Indeterminate — bounces back and forth */
          <div
            style={{
              position: 'absolute',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, #7c3aed, #a78bfa, #7c3aed, transparent)',
              animation: 'indeterminate 1.2s ease-in-out infinite',
              boxShadow: '0 0 8px #7c3aed88',
            }}
          />
        ) : (
          /* Complete — shoots to 100% */
          <div
            style={{
              position: 'absolute',
              height: '100%',
              left: 0,
              background: 'linear-gradient(90deg, #7c3aed, #8b5cf6, #a78bfa)',
              animation: 'completeBar 0.3s ease-out forwards',
              boxShadow: '0 0 8px #7c3aed88',
            }}
          />
        )}
      </div>
    </>
  )
}
