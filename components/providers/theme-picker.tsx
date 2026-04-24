'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Check } from 'lucide-react'
import { themes, type Theme } from '@/components/providers/theme-provider'

export function ThemePicker() {
  const [current, setCurrent] = useState<Theme>('midnight')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  // Load current theme from Supabase on mount
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data: profile } = await supabase
        .from('profiles')
        .select('theme')
        .eq('id', user.id)
        .single()
      if (profile?.theme) setCurrent(profile.theme as Theme)
    })
  }, [])

  const handleSelect = async (theme: Theme) => {
    setSaving(true)
    setCurrent(theme)
    // Apply immediately to the page
    document.documentElement.setAttribute('data-theme', theme)
    // Save to Supabase
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({ theme }).eq('id', user.id)
    }
    setSaving(false)
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => handleSelect(t.id as Theme)}
            disabled={saving}
            className={`relative group rounded-2xl border-2 overflow-hidden transition-all duration-200 text-left ${
              current === t.id
                ? 'border-violet-500 shadow-lg shadow-violet-500/20'
                : 'border-border hover:border-violet-500/40'
            }`}
          >
            <div className="h-20 w-full relative" style={{ background: t.preview.bg }}>
              <div
                className="absolute top-3 left-3 right-3 h-8 rounded-lg"
                style={{ background: t.preview.card, border: `1px solid ${t.preview.accent}22` }}
              />
              <div
                className="absolute bottom-3 left-3 w-4 h-4 rounded-full"
                style={{ background: t.preview.accent }}
              />
              {current === t.id && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div className="px-3 py-2.5 bg-card">
              <p className="text-xs font-semibold">{t.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{t.description}</p>
            </div>
          </button>
        ))}
      </div>
      {saving && <p className="text-xs text-muted-foreground">Saving...</p>}
    </div>
  )
}
