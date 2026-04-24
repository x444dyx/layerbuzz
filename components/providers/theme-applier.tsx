'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Theme } from '@/components/providers/theme-provider'

export function ThemeApplier({
  forcedTheme,
  sellerTheme,
  initialTheme,
}: {
  forcedTheme?: string
  sellerTheme?: string
  initialTheme?: string
}) {
  useEffect(() => {
    // Forced theme (landing, product, download pages) — always Midnight
    if (forcedTheme) {
      document.documentElement.setAttribute('data-theme', forcedTheme)
      return
    }

    // Seller theme (store page) — show seller's theme to visitors
    if (sellerTheme) {
      document.documentElement.setAttribute('data-theme', sellerTheme)
      return
    }

    // Initial theme already applied via inline script in <head>
    // Just keep it in sync on client navigation
    if (initialTheme) {
      document.documentElement.setAttribute('data-theme', initialTheme)
      return
    }

    // Fallback — fetch from Supabase
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        document.documentElement.setAttribute('data-theme', 'midnight')
        return
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('theme')
        .eq('id', user.id)
        .single()
      document.documentElement.setAttribute('data-theme', (profile?.theme as Theme) || 'midnight')
    })
  }, [forcedTheme, sellerTheme, initialTheme])

  return null
}
