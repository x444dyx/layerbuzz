'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

const steps = [
  { number: '01', title: 'Create your account', description: 'Sign up free in seconds. No credit card, no monthly fee, no nonsense. Just create your account and you\'re in.' },
  { number: '02', title: 'Upload your product', description: 'Add your files, write a description, set a price (or make it free), choose a cover image. Takes about 2 minutes.' },
  { number: '03', title: 'Share your store', description: 'You get a beautiful storefront at layerbuzz.com/yourname. Share it anywhere — Twitter, email, your portfolio.' },
  { number: '04', title: 'Get paid, keep 97%', description: 'Stripe handles payments globally. We take just 3%. The rest hits your bank account directly.' },
]

const tickerItems = [
  '3% per sale', 'Instant payouts', 'UK & EU ready', 'No surprise bans', 'Verified reviews',
  'Discount codes', 'Product bundles', 'Real analytics', 'Free products', 'Secure downloads',
  '3% per sale', 'Instant payouts', 'UK & EU ready', 'No surprise bans', 'Verified reviews',
  'Discount codes', 'Product bundles', 'Real analytics', 'Free products', 'Secure downloads',
]

function StepCard({ step, index }: { step: typeof steps[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.2 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className="relative group"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(40px)',
        transition: `opacity 0.6s ease ${index * 0.12}s, transform 0.6s ease ${index * 0.12}s`,
      }}
    >
      <div className="relative z-10 p-6 rounded-2xl border border-border/40 bg-card/30 group-hover:bg-card/60 group-hover:border-violet-500/20 transition-all duration-400">
        <div className="text-6xl font-display text-violet-500/15 mb-4 leading-none select-none group-hover:text-violet-500/25 transition-colors duration-300">
          {step.number}
        </div>
        <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
      </div>
    </div>
  )
}

export function HowItWorks() {
  const headerRef = useRef<HTMLDivElement>(null)
  const [headerVisible, setHeaderVisible] = useState(false)
  const ctaRef = useRef<HTMLDivElement>(null)
  const [ctaVisible, setCtaVisible] = useState(false)

  useEffect(() => {
    const obs1 = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setHeaderVisible(true); obs1.disconnect() } }, { threshold: 0.3 })
    const obs2 = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setCtaVisible(true); obs2.disconnect() } }, { threshold: 0.5 })
    if (headerRef.current) obs1.observe(headerRef.current)
    if (ctaRef.current) obs2.observe(ctaRef.current)
    return () => { obs1.disconnect(); obs2.disconnect() }
  }, [])

  return (
    <>
      {/* Marquee ticker */}
      <div className="overflow-hidden border-y border-border/40 bg-card/20 py-3 select-none">
        <div className="flex animate-marquee whitespace-nowrap">
          {tickerItems.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-3 mx-6 text-sm text-muted-foreground">
              <span className="w-1 h-1 rounded-full bg-violet-500 flex-shrink-0" />
              {item}
            </span>
          ))}
        </div>
      </div>

      <section id="how-it-works" className="py-32 px-6 bg-white/[0.015] border-b border-border/40">
        <div className="max-w-7xl mx-auto">
          <div
            ref={headerRef}
            className="text-center mb-20"
            style={{
              opacity: headerVisible ? 1 : 0,
              transform: headerVisible ? 'translateY(0)' : 'translateY(24px)',
              transition: 'opacity 0.7s ease, transform 0.7s ease',
            }}
          >
            <p className="text-sm font-medium text-violet-400 uppercase tracking-widest mb-4">How it works</p>
            <h2 className="text-4xl md:text-5xl font-display mb-6">
              Up and selling in minutes
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              No complicated setup. No waiting for approval. Just create, upload, and sell.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {steps.map((step, i) => (
              <StepCard key={step.number} step={step} index={i} />
            ))}
          </div>

          <div
            ref={ctaRef}
            className="text-center"
            style={{
              opacity: ctaVisible ? 1 : 0,
              transform: ctaVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 0.6s ease 0.3s, transform 0.6s ease 0.3s',
            }}
          >
            <Button size="lg" variant="gradient" asChild className="group">
              <Link href="/auth/signup">
                Start for free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
