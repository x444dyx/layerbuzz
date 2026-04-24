'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Eye, EyeOff, Clock } from 'lucide-react'

export default function LoginPage() {

  useEffect(() => { document.title = 'Sign In | LayerBuzz' }, [])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const inactivity = searchParams.get('reason') === 'inactivity'
  const supabase = createClient()

  // Pre-fill email and remember me state from localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem('ls_saved_email')
    const savedRemember = localStorage.getItem('ls_remember_me') === 'true'
    if (savedEmail) setEmail(savedEmail)
    if (savedRemember) setRememberMe(true)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      if (rememberMe) {
        localStorage.setItem('ls_remember_me', 'true')
        localStorage.setItem('ls_saved_email', email)
        localStorage.setItem('ls_last_activity', Date.now().toString())
      } else {
        localStorage.removeItem('ls_remember_me')
        localStorage.removeItem('ls_saved_email')
        localStorage.setItem('ls_last_activity', Date.now().toString())
      }
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-1">Welcome back</h1>
        <p className="text-muted-foreground text-sm">Sign in to your LayerBuzz account</p>
      </div>

      {inactivity && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-sm text-amber-400 flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 flex-shrink-0" />
          You were signed out due to 30 minutes of inactivity.
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/auth/forgot-password" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember me */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div
              onClick={() => setRememberMe(!rememberMe)}
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                rememberMe ? 'bg-violet-600 border-violet-600' : 'border-border group-hover:border-violet-500/50'
              }`}
            >
              {rememberMe && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              Remember me on this device
            </span>
          </label>
          <p className="text-xs text-muted-foreground pl-8">
            {rememberMe
              ? "You'll stay signed in for 30 days with no inactivity timeout."
              : "You'll be signed out after 30 minutes of inactivity."}
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" size="lg" variant="gradient" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign in'}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/auth/signup" className="text-violet-400 font-medium hover:underline">
          Start selling free
        </Link>
      </p>
    </div>
  )
}
