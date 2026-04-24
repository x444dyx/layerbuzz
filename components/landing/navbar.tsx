'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Layers, Menu, X, LayoutDashboard, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
    router.refresh()
  }

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'glass shadow-sm py-3' : 'bg-transparent py-5'
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between relative">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-md group-hover:shadow-violet-500/30 transition-shadow">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-lg tracking-tight">
            Layer<span className="text-violet-600">buzz</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          <Link href="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
          <Link href="/#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
          <Link href="/#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How it works</Link>
          <Link href="/docs/sellers" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Docs</Link>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          {!loading && (
            user ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4" />
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/login">Sign in</Link>
                </Button>
                <Button size="sm" variant="gradient" asChild>
                  <Link href="/auth/signup">Start selling free</Link>
                </Button>
              </>
            )
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden glass border-t border-border/50 px-6 py-4 flex flex-col gap-4">
          <Link href="/#features" className="text-sm py-2" onClick={() => setMobileOpen(false)}>Features</Link>
          <Link href="/#pricing" className="text-sm py-2" onClick={() => setMobileOpen(false)}>Pricing</Link>
          <Link href="/#how-it-works" className="text-sm py-2" onClick={() => setMobileOpen(false)}>How it works</Link>
          <Link href="/docs/sellers" className="text-sm py-2" onClick={() => setMobileOpen(false)}>Docs</Link>
          <div className="flex flex-col gap-2 pt-2 border-t border-border">
            {user ? (
              <>
                <Button variant="outline" asChild><Link href="/dashboard"><LayoutDashboard className="w-4 h-4" /> Dashboard</Link></Button>
                <Button variant="ghost" onClick={handleSignOut}><LogOut className="w-4 h-4" /> Sign out</Button>
              </>
            ) : (
              <>
                <Button variant="outline" asChild><Link href="/auth/login">Sign in</Link></Button>
                <Button variant="gradient" asChild><Link href="/auth/signup">Start selling free</Link></Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
