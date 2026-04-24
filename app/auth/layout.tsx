import Link from 'next/link'
import { Layers } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left — form side */}
      <div className="flex flex-col p-8 lg:p-12">
        <Link href="/" className="flex items-center gap-2 mb-auto w-fit">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-lg">Layer<span className="text-violet-600">buzz</span></span>
        </Link>

        <div className="flex-1 flex items-center justify-center py-12">
          <div className="w-full max-w-sm">
            {children}
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-auto">
          By continuing you agree to our{' '}
          <Link href="/legal/terms" className="underline hover:text-foreground">Terms</Link>
          {' '}and{' '}
          <Link href="/legal/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
        </p>
      </div>

      {/* Right — visual side */}
      <div className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-violet-600 via-indigo-600 to-violet-800">
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Glow blobs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-white/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white text-center">
          <div className="text-6xl mb-6">✦</div>
          <h2 className="text-3xl font-display mb-4">
            Sell anything.<br />Keep almost everything.
          </h2>
          <p className="text-white/70 max-w-sm">
            LayerBuzz charges just 3% per sale. No monthly fee. No hidden costs. Real support. Real analytics.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-6 w-full max-w-sm">
            {[
              { value: '3%', label: 'Per sale' },
              { value: '£0', label: 'Monthly fee' },
              { value: '97%', label: 'Yours to keep' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 rounded-2xl p-4">
                <div className="text-2xl font-display font-semibold">{stat.value}</div>
                <div className="text-xs text-white/60 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
