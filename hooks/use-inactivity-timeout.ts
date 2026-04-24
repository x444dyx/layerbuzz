'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const INACTIVITY_TIMEOUT = 30 * 60 * 1000 // 30 minutes
const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click']

export function useInactivityTimeout() {
  const router = useRouter()
  const supabase = createClient()

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('ls_last_activity')
    localStorage.removeItem('ls_remember_me')
    localStorage.removeItem('ls_saved_email')
    router.push('/auth/login?reason=inactivity')
  }, [router, supabase])

  const updateActivity = useCallback(() => {
    localStorage.setItem('ls_last_activity', Date.now().toString())
  }, [])

  useEffect(() => {
    // If remember me is set, skip the inactivity timeout entirely
    const rememberMe = localStorage.getItem('ls_remember_me') === 'true'
    if (rememberMe) return

    // Check if enough time has passed since last activity
    const lastActivity = localStorage.getItem('ls_last_activity')
    if (lastActivity) {
      const elapsed = Date.now() - parseInt(lastActivity)
      if (elapsed > INACTIVITY_TIMEOUT) {
        signOut()
        return
      }
    }

    // Set initial activity
    updateActivity()

    // Listen for activity
    ACTIVITY_EVENTS.forEach(event => window.addEventListener(event, updateActivity, { passive: true }))

    // Check every minute
    const interval = setInterval(() => {
      const last = localStorage.getItem('ls_last_activity')
      if (last && Date.now() - parseInt(last) > INACTIVITY_TIMEOUT) {
        signOut()
      }
    }, 60 * 1000)

    return () => {
      ACTIVITY_EVENTS.forEach(event => window.removeEventListener(event, updateActivity))
      clearInterval(interval)
    }
  }, [signOut, updateActivity])
}
