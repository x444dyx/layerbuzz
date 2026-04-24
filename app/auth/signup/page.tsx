'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Check, X, Eye, EyeOff } from 'lucide-react'

const perks = [
  'Free forever — no monthly fee',
  'Just 3% per sale',
  'Instant setup, no approval needed',
  'Beautiful storefront included',
]

function getStrength(password: string): { score: number; label: string; color: string } {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 1) return { score, label: 'Too weak', color: 'bg-red-500' }
  if (score === 2) return { score, label: 'Weak', color: 'bg-orange-500' }
  if (score === 3) return { score, label: 'Fair', color: 'bg-yellow-500' }
  if (score === 4) return { score, label: 'Strong', color: 'bg-emerald-500' }
  return { score, label: 'Very strong', color: 'bg-emerald-400' }
}

const rules = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
  { label: 'One special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

export default function SignupPage() {

  useEffect(() => { document.title = 'Start Selling Free | LayerBuzz' }, [])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [touched, setTouched] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const strength = useMemo(() => getStrength(password), [password])
  const passwordsMatch = password === confirm
  const allRulesPassed = rules.every(r => r.test(password))
  const canSubmit = email && allRulesPassed && passwordsMatch && confirm.length > 0

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)

    if (!allRulesPassed) {
      setError('Please meet all password requirements.')
      return
    }
    if (!passwordsMatch) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">Check your email</h2>
        <p className="text-muted-foreground text-sm mb-6">
          We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
        </p>
        <p className="text-xs text-muted-foreground">
          Didn&apos;t receive it?{' '}
          <button onClick={() => setSuccess(false)} className="text-violet-400 hover:underline">
            Try again
          </button>
        </p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-1">Start selling free</h1>
        <p className="text-muted-foreground text-sm">Create your account in seconds</p>
      </div>

      {/* Perks */}
      <ul className="space-y-2 mb-6">
        {perks.map((perk) => (
          <li key={perk} className="flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            {perk}
          </li>
        ))}
      </ul>

      <form onSubmit={handleSignup} className="space-y-4">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
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

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setTouched(true) }}
              required
              autoComplete="new-password"
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

          {/* Strength bar */}
          {password.length > 0 && (
            <div className="space-y-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      i <= strength.score ? strength.color : 'bg-border'
                    }`}
                  />
                ))}
              </div>
              <p className={`text-xs font-medium ${
                strength.score <= 2 ? 'text-red-400' :
                strength.score === 3 ? 'text-yellow-400' : 'text-emerald-400'
              }`}>
                {strength.label}
              </p>
            </div>
          )}

          {/* Rules checklist */}
          {touched && password.length > 0 && (
            <ul className="space-y-1 mt-2">
              {rules.map((rule) => {
                const passed = rule.test(password)
                return (
                  <li key={rule.label} className="flex items-center gap-2 text-xs">
                    {passed
                      ? <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      : <X className="w-3.5 h-3.5 text-red-400/70 flex-shrink-0" />
                    }
                    <span className={passed ? 'text-emerald-400' : 'text-muted-foreground'}>
                      {rule.label}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Confirm password */}
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm password</Label>
          <div className="relative">
            <Input
              id="confirm"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Repeat your password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
              className={`pr-10 ${
                confirm.length > 0
                  ? passwordsMatch
                    ? 'border-emerald-500/50 focus-visible:ring-emerald-500/30'
                    : 'border-red-500/50 focus-visible:ring-red-500/30'
                  : ''
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {confirm.length > 0 && !passwordsMatch && (
            <p className="text-xs text-red-400">Passwords do not match</p>
          )}
          {confirm.length > 0 && passwordsMatch && (
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <Check className="w-3 h-3" /> Passwords match
            </p>
          )}
        </div>

        {error && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          size="lg"
          variant="gradient"
          disabled={loading || !canSubmit}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create free account'}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-violet-400 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}

