'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type Theme = 'midnight' | 'slate' | 'nord' | 'violet' | 'dawn'

export const themes: { id: Theme; label: string; description: string; preview: { bg: string; card: string; accent: string } }[] = [
  {
    id: 'midnight',
    label: 'Midnight',
    description: 'Pure black. The default.',
    preview: { bg: '#0a0a0a', card: '#111111', accent: '#7c3aed' },
  },
  {
    id: 'slate',
    label: 'Slate',
    description: 'Dark grey, easy on the eyes.',
    preview: { bg: '#111318', card: '#16191f', accent: '#7c3aed' },
  },
  {
    id: 'nord',
    label: 'Nord',
    description: 'Cool blue-grey tones.',
    preview: { bg: '#14181f', card: '#181d26', accent: '#5b8db8' },
  },
  {
    id: 'violet',
    label: 'Violet',
    description: 'Deep purple atmosphere.',
    preview: { bg: '#0d0a14', card: '#110e1a', accent: '#7c3aed' },
  },
  {
    id: 'dawn',
    label: 'Dawn',
    description: 'Clean warm light theme.',
    preview: { bg: '#f7f4f0', card: '#ffffff', accent: '#7c3aed' },
  },
]

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => Promise<void>
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'midnight',
  setTheme: async () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

export function ThemeProvider({
  children,
  initialTheme = 'midnight',
  applyTheme = true,
}: {
  children: React.ReactNode
  initialTheme?: Theme
  applyTheme?: boolean
}) {
  const [theme, setThemeState] = useState<Theme>(initialTheme)
  const supabase = createClient()

  useEffect(() => {
    if (applyTheme) {
      document.documentElement.setAttribute('data-theme', theme)
    }
  }, [theme, applyTheme])

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme)
    if (applyTheme) {
      document.documentElement.setAttribute('data-theme', newTheme)
    }
    // Save to Supabase
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({ theme: newTheme }).eq('id', user.id)
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
