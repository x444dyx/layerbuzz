'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Zap, Shield, Star } from 'lucide-react'

function useCounter(target: number, duration: number = 2000, start: boolean = false) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime: number
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, start])
  return value
}

function Particle({ delay, x, size }: { delay: number; x: number; size: number }) {
  return (
    <div
      className="absolute bottom-0 rounded-full bg-violet-500/20 pointer-events-none"
      style={{
        left: `${x}%`,
        width: size,
        height: size,
        animation: `heroFloatUp ${6 + delay}s ${delay}s ease-in infinite`,
      }}
    />
  )
}

export function Hero() {
  const [started, setStarted] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })
  const heroRef = useRef<HTMLElement>(null)

  const revenue = useCounter(4231, 2200, started)
  const sales = useCounter(183, 1800, started)
  const products = useCounter(12, 1400, started)

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), 600)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      if (!heroRef.current) return
      const rect = heroRef.current.getBoundingClientRect()
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      })
    }
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [])

  const particles = Array.from({ length: 12 }, (_, i) => ({
    delay: i * 0.8,
    x: 5 + i * 8,
    size: 4 + (i % 3) * 4,
  }))

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <style>{`
        @keyframes heroFloatUp {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.1; }
          100% { transform: translateY(-100vh) scale(0.2); opacity: 0; }
        }
        @keyframes heroOrbPulse {
          0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.5; }
          33% { transform: scale(1.08) translate(2%, -2%); opacity: 0.7; }
          66% { transform: scale(0.95) translate(-1%, 2%); opacity: 0.4; }
        }
        @keyframes heroRevealUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroScaleIn {
          from { opacity: 0; transform: scale(0.92) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes heroSlideLeft {
          from { opacity: 0; transform: translateX(-24px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes heroSlideRight {
          from { opacity: 0; transform: translateX(24px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes heroGlowPulse {
          0%, 100% { box-shadow: 0 0 30px rgba(139,92,246,0.25), 0 0 60px rgba(139,92,246,0.1); }
          50% { box-shadow: 0 0 50px rgba(139,92,246,0.45), 0 0 100px rgba(139,92,246,0.2); }
        }
        @keyframes heroUnderline {
          from { stroke-dashoffset: 500; opacity: 0; }
          to { stroke-dashoffset: 0; opacity: 1; }
        }
        @keyframes heroBarGrow {
          from { width: 0%; }
        }
        .h-badge { animation: heroRevealUp 0.6s 0.1s ease-out both; }
        .h-title { animation: heroRevealUp 0.7s 0.25s ease-out both; }
        .h-sub { animation: heroRevealUp 0.7s 0.4s ease-out both; }
        .h-cta { animation: heroRevealUp 0.7s 0.55s ease-out both; }
        .h-trust { animation: heroRevealUp 0.6s 0.7s ease-out both; }
        .h-mockup { animation: heroScaleIn 1s 0.75s ease-out both; }
        .h-stat-0 { animation: heroSlideLeft 0.6s 0.85s ease-out both; }
        .h-stat-1 { animation: heroRevealUp 0.6s 0.95s ease-out both; }
        .h-stat-2 { animation: heroSlideRight 0.6s 1.05s ease-out both; }
        .h-row-0 { animation: heroSlideLeft 0.5s 1.1s ease-out both; }
        .h-row-1 { animation: heroRevealUp 0.5s 1.25s ease-out both; }
        .h-row-2 { animation: heroSlideRight 0.5s 1.4s ease-out both; }
        .h-orb { animation: heroOrbPulse 9s ease-in-out infinite; }
        .h-glow { animation: heroGlowPulse 3s ease-in-out 1.8s infinite; }
        .h-underline {
          stroke-dasharray: 500;
          stroke-dashoffset: 500;
          animation: heroUnderline 1s 0.9s cubic-bezier(0.4,0,0.2,1) forwards;
        }
        .h-bar { animation: heroBarGrow 1.4s 1.2s cubic-bezier(0.4,0,0.2,1) both; }
      `}</style>

      {/* Mouse-tracked radial glow */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none transition-all duration-700 ease-out"
        style={{
          background: `radial-gradient(700px circle at ${mousePos.x}% ${mousePos.y}%, rgba(139,92,246,0.07) 0%, transparent 65%)`,
        }}
      />

      {/* Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="h-orb absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-b from-violet-900/50 via-indigo-900/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-gradient-to-tr from-violet-900/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-gradient-to-tl from-indigo-900/30 to-transparent rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `linear-gradient(hsl(262 83% 65%) 1px, transparent 1px), linear-gradient(90deg, hsl(262 83% 65%) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        {particles.map((p, i) => <Particle key={i} {...p} />)}
      </div>

      <div className="max-w-7xl mx-auto px-6 text-center">

        {/* Badge */}
        <div className="h-badge inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-400 mb-8 hover:bg-violet-500/15 hover:border-violet-500/50 transition-all duration-300 cursor-default">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
          </span>
          Just 3% per sale. No monthly fees. Ever.
        </div>

        {/* Headline */}
        <h1 className="h-title text-5xl md:text-7xl lg:text-8xl font-display leading-[1.05] tracking-tight mb-6 max-w-5xl mx-auto">
          Sell anything.
          <br />
          <em className="not-italic relative inline-block">
            <span className="gradient-text">Layer everything.</span>
            <svg
              className="absolute -bottom-3 left-0 w-full overflow-visible"
              viewBox="0 0 500 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                className="h-underline"
                d="M 4 9 Q 125 3 250 9 Q 375 15 496 9"
                stroke="url(#heroGrad)"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
              <defs>
                <linearGradient id="heroGrad" x1="0" y1="0" x2="500" y2="0" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#7c3aed" />
                  <stop offset="1" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </svg>
          </em>
        </h1>

        {/* Sub */}
        <p className="h-sub text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          The creator marketplace that actually has your back. Upload your files, set your price,
          get paid — with a storefront that looks genuinely great.
        </p>

        {/* CTAs */}
        <div className="h-cta flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          <Button size="xl" variant="gradient" asChild className="group w-full sm:w-auto h-glow">
            <Link href="/auth/signup">
              Start selling free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button size="xl" variant="outline" asChild className="w-full sm:w-auto group hover:border-violet-500/50 transition-colors">
            <Link href="/store">
              Browse products
              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
            </Link>
          </Button>
        </div>

        {/* Trust */}
        <div className="h-trust flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground mb-20">
          {[
            { icon: Zap, label: 'Instant setup' },
            { icon: Shield, label: 'No surprise bans' },
            { icon: Star, label: 'Real seller support' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-default group">
              <Icon className="w-4 h-4 text-violet-500 group-hover:scale-110 transition-transform" />
              {label}
            </div>
          ))}
        </div>

        {/* Mockup */}
        <div className="h-mockup relative max-w-5xl mx-auto">
          <div className="absolute -inset-6 bg-gradient-to-r from-violet-600/15 via-indigo-600/10 to-violet-600/15 rounded-3xl blur-3xl" />
          <div className="relative glass rounded-2xl p-[3px] shadow-2xl shadow-violet-900/40 hover:shadow-violet-800/50 transition-all duration-700 group">
            {/* Animated border gradient */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-600/40 via-indigo-500/20 to-violet-600/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
            <div className="relative bg-card rounded-[14px] overflow-hidden">

              {/* Browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/20">
                <div className="flex gap-1.5">
                  {['bg-red-500/60', 'bg-yellow-500/60', 'bg-green-500/60'].map((c, i) => (
                    <div key={i} className={`w-3 h-3 rounded-full ${c} transition-opacity hover:opacity-100`} />
                  ))}
                </div>
                <div className="flex-1 bg-background/40 rounded-md h-6 flex items-center px-3 mx-2">
                  <div className="w-2 h-2 rounded-full bg-green-500/80 mr-2 flex-shrink-0 animate-pulse" />
                  <span className="text-xs text-muted-foreground">layerbuzz.com/dashboard</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
                {[
                  { label: 'Total Revenue', value: `£${revenue.toLocaleString()}`, change: '+12% this month', color: 'text-emerald-400', cls: 'h-stat-0' },
                  { label: 'Products Sold', value: String(sales), change: '+8% this month', color: 'text-blue-400', cls: 'h-stat-1' },
                  { label: 'Active Products', value: String(products), change: '+2 this month', color: 'text-violet-400', cls: 'h-stat-2' },
                ].map((stat) => (
                  <div key={stat.label} className={`${stat.cls} p-6 text-left hover:bg-white/[0.02] transition-colors`}>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{stat.label}</p>
                    <p className="text-2xl font-semibold tabular-nums">{stat.value}</p>
                    <p className={`text-xs mt-1 font-medium ${stat.color}`}>{stat.change}</p>
                  </div>
                ))}
              </div>

              {/* Product rows */}
              <div className="p-4 space-y-2 border-t border-border/40">
                {[
                  { name: 'UI Kit Pro', price: '£29', sales: 47, pct: 78, accent: 'bg-violet-500', bg: 'bg-violet-500/10', cls: 'h-row-0' },
                  { name: 'Notion Templates Pack', price: '£12', sales: 89, pct: 95, accent: 'bg-blue-500', bg: 'bg-blue-500/10', cls: 'h-row-1' },
                  { name: 'Icon Library 2024', price: '£19', sales: 34, pct: 55, accent: 'bg-indigo-500', bg: 'bg-indigo-500/10', cls: 'h-row-2' },
                ].map((p) => (
                  <div key={p.name} className={`${p.cls} flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors cursor-default`}>
                    <div className={`w-9 h-9 rounded-lg ${p.bg} flex items-center justify-center flex-shrink-0`}>
                      <div className={`w-3 h-3 rounded-sm ${p.accent} opacity-80`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-1 bg-border/60 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${p.accent} opacity-70 h-bar`} style={{ width: `${p.pct}%` }} />
                        </div>
                        <p className="text-xs text-muted-foreground whitespace-nowrap">{p.sales} sales</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold">{p.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
