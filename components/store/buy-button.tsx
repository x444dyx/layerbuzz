'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ShoppingBag, Download } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface BuyButtonProps {
  product: any
  cta?: string
}

export function BuyButton({ product, cta }: BuyButtonProps) {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [discountCode, setDiscountCode] = useState('')
  const [discountApplied, setDiscountApplied] = useState<any>(null)
  const [checkingDiscount, setCheckingDiscount] = useState(false)
  const { toast } = useToast()

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return
    setCheckingDiscount(true)
    try {
      const res = await fetch('/api/discount/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountCode, productId: product.id }),
      })
      const data = await res.json()
      if (data.valid) {
        setDiscountApplied(data.discount)
        toast({ title: 'Discount applied!', description: `${data.discount.discount_type === 'percent' ? data.discount.discount_value + '%' : '£' + data.discount.discount_value} off` })
      } else {
        toast({ title: 'Invalid code', description: data.error || 'This code is not valid', variant: 'destructive' })
        setDiscountApplied(null)
      }
    } catch {
      toast({ title: 'Error checking code', variant: 'destructive' })
    }
    setCheckingDiscount(false)
  }

  const getFinalPrice = () => {
    if (!discountApplied) return product.price
    if (discountApplied.discount_type === 'percent') {
      return Math.max(0, product.price * (1 - discountApplied.discount_value / 100))
    }
    return Math.max(0, product.price - discountApplied.discount_value)
  }

  const [licenceSent, setLicenceSent] = useState(false)

  const handleFreeDownload = async () => {
    if (!email) { setShowForm(true); return }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast({ title: 'Invalid email', description: 'Please enter a valid email address', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/checkout/free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, email, name }),
      })
      const data = await res.json()
      if (data.type === 'licence') {
        setLicenceSent(true)
      } else if (data.downloadUrl) {
        window.location.href = data.downloadUrl
      } else {
        throw new Error(data.error || 'Failed')
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    }
    setLoading(false)
  }

  const handlePaidCheckout = async () => {
    if (!email) { setShowForm(true); return }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast({ title: 'Invalid email', description: 'Please enter a valid email address', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          email,
          name,
          discountCode: discountApplied ? discountCode : undefined,
        }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else throw new Error(data.error || 'Failed to create checkout')
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    }
    setLoading(false)
  }

  const isFreeAfterDiscount = product.is_free || getFinalPrice() === 0

  if (licenceSent) {
    return (
      <div className="text-center space-y-3 animate-fade-in">
        <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
          <span className="text-2xl">🔑</span>
        </div>
        <p className="text-sm font-medium">Licence key sent!</p>
        <p className="text-xs text-muted-foreground">Check your inbox at <strong>{email}</strong></p>
      </div>
    )
  }

  if (!showForm) {
    const defaultLabel = product.is_free
      ? product.product_type === 'licence' ? '🔑 Get licence key' : <><Download className="w-4 h-4" /> Get for free</>
      : product.product_type === 'licence' ? '🔑 Buy licence key' : <><ShoppingBag className="w-4 h-4" /> Buy now</>

    return (
      <Button
        size="lg"
        variant="gradient"
        className="w-full"
        onClick={() => setShowForm(true)}
      >
        {cta ? cta : defaultLabel}
      </Button>
    )
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Your name</Label>
          <Input
            placeholder="Jane Smith"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Email address *</Label>
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <p className="text-xs text-muted-foreground">Your download link will be emailed here</p>
        </div>

        {/* Discount code */}
        {!product.is_free && (
          <div className="space-y-1.5">
            <Label className="text-xs">Discount code (optional)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="SAVE20"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                disabled={!!discountApplied}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleApplyDiscount}
                disabled={checkingDiscount || !!discountApplied}
              >
                {checkingDiscount ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Apply'}
              </Button>
            </div>
            {discountApplied && (
              <p className="text-xs text-emerald-600">
                ✓ Discount applied — Final price: {Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(getFinalPrice())}
              </p>
            )}
          </div>
        )}
      </div>

      <Button
        size="lg"
        variant="gradient"
        className="w-full"
        disabled={loading || !email}
        onClick={isFreeAfterDiscount ? handleFreeDownload : handlePaidCheckout}
      >
        {loading
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : isFreeAfterDiscount ? <Download className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />
        }
        {loading
          ? 'Processing...'
          : isFreeAfterDiscount
            ? 'Get download link'
            : `Pay ${Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(getFinalPrice())}`
        }
      </Button>

      <button className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors" onClick={() => setShowForm(false)}>
        ← Back
      </button>
    </div>
  )
}
