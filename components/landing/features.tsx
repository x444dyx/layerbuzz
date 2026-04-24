'use client'

import { useEffect, useRef, useState } from 'react'
import { Shield, BarChart3, Zap, CreditCard, Package, Globe, Star, Bell } from 'lucide-react'

const features = [
  { icon: Shield, title: 'No surprise bans', description: 'If there\'s ever an issue, you\'ll get a clear warning with a reason and a chance to appeal. Transparency is non-negotiable here.', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'hover:border-emerald-500/30' },
  { icon: CreditCard, title: 'Just 3% per sale', description: 'No monthly fees, no setup costs. We only make money when you do. That\'s it. The rest is yours.', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'hover:border-violet-500/30' },
  { icon: BarChart3, title: 'Real analytics', description: 'Know where your buyers come from, what\'s converting, your best products and projected revenue — actual data to grow with.', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'hover:border-blue-500/30' },
  { icon: Zap, title: 'Instant delivery', description: 'Buyers get their files the second payment clears. Automatic, secure download links with expiry and download limits.', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'hover:border-yellow-500/30' },
  { icon: Package, title: 'Bundles & discounts', description: 'Create product bundles, run discount codes, and set up upsells to increase your average order value effortlessly.', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'hover:border-orange-500/30' },
  { icon: Globe, title: 'UK & EU ready', description: 'Built with British sellers in mind. GBP by default, VAT-friendly, GDPR compliant out of the box.', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'hover:border-indigo-500/30' },
  { icon: Star, title: 'Verified reviews', description: 'Only buyers who actually purchased can leave reviews. Real social proof, no fake ratings.', color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'hover:border-pink-500/30' },
  { icon: Bell, title: 'Instant sale alerts', description: 'Get notified the moment a sale lands. Email notifications for every purchase, refund, or message.', color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'hover:border-teal-500/30' },
]

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.15 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`group p-6 rounded-2xl border border-border bg-card/50 ${feature.border} hover:bg-card transition-all duration-500 cursor-default`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.6s ease ${index * 0.07}s, transform 0.6s ease ${index * 0.07}s, background 0.3s, border-color 0.3s, box-shadow 0.3s`,
        ...(visible ? {} : {}),
      }}
    >
      <div className={`w-11 h-11 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <feature.icon className={`w-5 h-5 ${feature.color}`} />
      </div>
      <h3 className="font-semibold text-base mb-2 group-hover:text-foreground transition-colors">{feature.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
    </div>
  )
}

export function Features() {
  const headerRef = useRef<HTMLDivElement>(null)
  const [headerVisible, setHeaderVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setHeaderVisible(true); observer.disconnect() } },
      { threshold: 0.3 }
    )
    if (headerRef.current) observer.observe(headerRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="features" className="py-32 px-6">
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
          <p className="text-sm font-medium text-violet-400 uppercase tracking-widest mb-4">Features</p>
          <h2 className="text-4xl md:text-5xl font-display mb-6">
            Everything Gumroad should&apos;ve been
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built from scratch with the features that matter. No bloat, no hidden fees, no nasty surprises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
