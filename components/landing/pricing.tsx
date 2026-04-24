'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, X } from 'lucide-react'

const competitors = [
  {
    name: 'Gumroad',
    color: 'text-pink-400',
    data: {
      'Monthly fee': { value: 'Free', bad: false },
      'Per-sale fee': { value: '10%', bad: true },
      'Licence keys': false,
      'Discount codes': true,
      'Product bundles': false,
      'Real analytics': false,
      'Transparent bans': false,
      'Appeal process': false,
      'UK/GBP native': false,
      'Modern UI': false,
      'Seller support': false,
      'Free products': true,
      'Custom storefront': true,
      'Affiliate system': false,
      'VAT/tax handling': false,
    },
  },
  {
    name: 'Payhip',
    color: 'text-blue-400',
    data: {
      'Monthly fee': { value: 'Free', bad: false },
      'Per-sale fee': { value: '5%', bad: true },
      'Licence keys': true,
      'Discount codes': true,
      'Product bundles': true,
      'Real analytics': false,
      'Transparent bans': false,
      'Appeal process': false,
      'UK/GBP native': true,
      'Modern UI': false,
      'Seller support': true,
      'Free products': true,
      'Custom storefront': true,
      'Affiliate system': true,
      'VAT/tax handling': true,
    },
  },
  {
    name: 'Lemon Squeezy',
    color: 'text-yellow-400',
    data: {
      'Monthly fee': { value: 'Free', bad: false },
      'Per-sale fee': { value: '5%+', bad: true },
      'Licence keys': true,
      'Discount codes': true,
      'Product bundles': true,
      'Real analytics': true,
      'Transparent bans': false,
      'Appeal process': false,
      'UK/GBP native': true,
      'Modern UI': true,
      'Seller support': true,
      'Free products': false,
      'Custom storefront': true,
      'Affiliate system': true,
      'VAT/tax handling': true,
    },
  },
  {
    name: 'Sellfy',
    color: 'text-orange-400',
    data: {
      'Monthly fee': { value: '$29/mo', bad: true },
      'Per-sale fee': { value: '0%', bad: false },
      'Licence keys': false,
      'Discount codes': true,
      'Product bundles': false,
      'Real analytics': true,
      'Transparent bans': false,
      'Appeal process': false,
      'UK/GBP native': false,
      'Modern UI': true,
      'Seller support': true,
      'Free products': false,
      'Custom storefront': true,
      'Affiliate system': false,
      'VAT/tax handling': false,
    },
  },
  {
    name: 'Podia',
    color: 'text-green-400',
    data: {
      'Monthly fee': { value: '$39/mo', bad: true },
      'Per-sale fee': { value: '0%', bad: false },
      'Licence keys': false,
      'Discount codes': true,
      'Product bundles': true,
      'Real analytics': true,
      'Transparent bans': false,
      'Appeal process': false,
      'UK/GBP native': false,
      'Modern UI': true,
      'Seller support': true,
      'Free products': true,
      'Custom storefront': true,
      'Affiliate system': true,
      'VAT/tax handling': false,
    },
  },
  {
    name: 'SendOwl',
    color: 'text-cyan-400',
    data: {
      'Monthly fee': { value: '$18/mo', bad: true },
      'Per-sale fee': { value: '0%', bad: false },
      'Licence keys': true,
      'Discount codes': true,
      'Product bundles': true,
      'Real analytics': false,
      'Transparent bans': false,
      'Appeal process': false,
      'UK/GBP native': false,
      'Modern UI': false,
      'Seller support': true,
      'Free products': false,
      'Custom storefront': false,
      'Affiliate system': true,
      'VAT/tax handling': true,
    },
  },
  {
    name: 'Paddle',
    color: 'text-emerald-400',
    data: {
      'Monthly fee': { value: 'Free', bad: false },
      'Per-sale fee': { value: '5%+', bad: true },
      'Licence keys': true,
      'Discount codes': true,
      'Product bundles': false,
      'Real analytics': true,
      'Transparent bans': false,
      'Appeal process': false,
      'UK/GBP native': true,
      'Modern UI': true,
      'Seller support': true,
      'Free products': false,
      'Custom storefront': false,
      'Affiliate system': false,
      'VAT/tax handling': true,
    },
  },
]

const features = [
  'Monthly fee',
  'Per-sale fee',
  'Licence keys',
  'Discount codes',
  'Product bundles',
  'Real analytics',
  'Transparent bans',
  'Appeal process',
  'UK/GBP native',
  'Modern UI',
  'Seller support',
  'Free products',
  'Custom storefront',
  'Affiliate system',
  'VAT/tax handling',
]

const layerbuzzData: Record<string, any> = {
  'Monthly fee': { value: 'Free', bad: false },
  'Per-sale fee': { value: '3%', bad: false },
  'Licence keys': true,
  'Discount codes': true,
  'Product bundles': true,
  'Real analytics': true,
  'Transparent bans': true,
  'Appeal process': true,
  'UK/GBP native': true,
  'Modern UI': true,
  'Seller support': true,
  'Free products': true,
  'Custom storefront': true,
  'Affiliate system': false,
  'VAT/tax handling': false,
}

function useScrollReveal(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [threshold])
  return { ref, visible }
}

export function Pricing() {
  const { ref: headerRef, visible: headerVisible } = useScrollReveal(0.3)
  const { ref: cardRef, visible: cardVisible } = useScrollReveal(0.15)
  const { ref: tableRef, visible: tableVisible } = useScrollReveal(0.1)
  const [activeCompetitor, setActiveCompetitor] = useState(0)

  const competitor = competitors[activeCompetitor]

  return (
    <section id="pricing" className="py-32 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div
          ref={headerRef}
          className="text-center mb-20"
          style={{
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}
        >
          <p className="text-sm font-medium text-violet-400 uppercase tracking-widest mb-4">Pricing</p>
          <h2 className="text-4xl md:text-5xl font-display mb-6">Simple. Honest. Fair.</h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            One plan. No tiers. No gotchas. Start free, stay free — we only earn when you do.
          </p>
        </div>

        {/* Pricing card */}
        <div
          ref={cardRef}
          className="relative mb-20"
          style={{
            opacity: cardVisible ? 1 : 0,
            transform: cardVisible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.97)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}
        >
          <div className="absolute -inset-px bg-gradient-to-r from-violet-500 to-indigo-500 rounded-3xl opacity-30" />
          <div className="absolute -inset-4 bg-gradient-to-r from-violet-600/10 to-indigo-600/10 rounded-3xl blur-2xl" />
          <div className="relative glass rounded-3xl p-8 md:p-12 text-center">
            <div className="inline-flex items-baseline gap-1 mb-2">
              <span className="text-7xl font-display font-semibold gradient-text">3%</span>
              <span className="text-2xl text-muted-foreground">per sale</span>
            </div>
            <p className="text-muted-foreground mb-8">Everything else is free. Always.</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10 text-sm text-left">
              {[
                '✓ Unlimited products',
                '✓ Unlimited storage',
                '✓ Custom storefront',
                '✓ Full analytics',
                '✓ Discount codes',
                '✓ Bundles',
                '✓ Verified reviews',
                '✓ Stripe payouts',
              ].map((item) => (
                <div key={item} className="text-muted-foreground hover:text-foreground transition-colors cursor-default">{item}</div>
              ))}
            </div>

            <Button size="xl" variant="gradient" asChild className="group">
              <Link href="/auth/signup">
                Start selling free
                <Check className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground mt-4">No credit card required</p>
          </div>
        </div>

        {/* Comparison */}
        <div
          ref={tableRef}
          style={{
            opacity: tableVisible ? 1 : 0,
            transform: tableVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}
        >
          <h3 className="text-2xl font-display text-center mb-6">How we compare</h3>

          {/* Competitor tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {competitors.map((c, i) => (
              <button
                key={c.name}
                onClick={() => setActiveCompetitor(i)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeCompetitor === i
                    ? 'bg-violet-500/20 border border-violet-500/40 text-violet-300'
                    : 'bg-muted/30 border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-border overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-3 bg-muted/30 px-6 py-4 text-sm font-semibold">
              <div>Feature</div>
              <div className="text-center text-violet-400">LayerBuzz</div>
              <div className={`text-center ${competitor.color}`}>{competitor.name}</div>
            </div>

            {/* Table rows */}
            {features.map((feature, i) => {
              const ls = layerbuzzData[feature]
              const comp = competitor.data[feature]
              return (
                <div
                  key={feature}
                  className="grid grid-cols-3 px-6 py-4 text-sm border-t border-border hover:bg-white/[0.02] transition-colors"
                  style={{
                    opacity: tableVisible ? 1 : 0,
                    transform: tableVisible ? 'translateX(0)' : 'translateX(-16px)',
                    transition: `opacity 0.5s ease ${0.05 + i * 0.03}s, transform 0.5s ease ${0.05 + i * 0.03}s`,
                  }}
                >
                  <div className="text-muted-foreground">{feature}</div>
                  <div className="text-center">
                    {typeof ls === 'boolean'
                      ? ls
                        ? <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                        : <X className="w-4 h-4 text-red-500/60 mx-auto" />
                      : <span className={`font-semibold ${ls.bad ? 'text-red-400' : 'text-violet-400'}`}>{ls.value}</span>
                    }
                  </div>
                  <div className="text-center">
                    {typeof comp === 'boolean'
                      ? comp
                        ? <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                        : <X className="w-4 h-4 text-red-500/60 mx-auto" />
                      : <span className={`font-semibold ${comp.bad ? 'text-red-400' : 'text-muted-foreground'}`}>{comp.value}</span>
                    }
                  </div>
                </div>
              )
            })}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">Data based on publicly available information. Accurate as of 2026.</p>
        </div>
      </div>
    </section>
  )
}
