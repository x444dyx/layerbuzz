import Link from 'next/link'
import { Layers } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-lg">Layer<span className="text-violet-600">buzz</span></span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The creator marketplace built different. Fair fees, real support, beautiful storefronts.
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              Part of{' '}
              <a href="https://ayteelabs.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                AyTee Labs
              </a>
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="#features" className="hover:text-foreground transition-colors">Features</Link></li>
              <li><Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link href="#how-it-works" className="hover:text-foreground transition-colors">How it works</Link></li>
              <li><Link href="/store" className="hover:text-foreground transition-colors">Browse store</Link></li>
            </ul>
          </div>

          {/* Sellers */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Sellers</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/auth/signup" className="hover:text-foreground transition-colors">Start selling</Link></li>
              <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
              <li><Link href="/auth/login" className="hover:text-foreground transition-colors">Sign in</Link></li>
            </ul>
          </div>

          {/* Docs */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Docs & Support</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/docs/sellers" className="hover:text-foreground transition-colors">Seller guide</Link></li>
              <li><Link href="/docs/buyers" className="hover:text-foreground transition-colors">Buyer guide</Link></li>
              <li><Link href="/docs/api" className="hover:text-foreground transition-colors">API reference</Link></li>
              <li><a href="mailto:support@ayteelabs.com" className="hover:text-foreground transition-colors">support@ayteelabs.com</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/legal/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link href="/legal/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/legal/refunds" className="hover:text-foreground transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} LayerBuzz. Built with care by <a href="https://ayteelabs.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">AyTee Labs</a>.</p>
          <p>3% per sale. No monthly fees. Always.</p>
        </div>
      </div>
    </footer>
  )
}
