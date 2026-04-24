'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import { ChevronDown, Copy, Check, Terminal, Key, Download, Tag, ShieldCheck, AlertCircle } from 'lucide-react'
import { ThemeApplier } from '@/components/providers/theme-applier'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function CodeBlock({ code, language = 'json' }: { code: string; language?: string }) {
  return (
    <div className="rounded-xl bg-black border border-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/20">
        <span className="text-xs text-muted-foreground font-mono">{language}</span>
        <CopyButton text={code} />
      </div>
      <pre className="p-4 text-sm font-mono text-slate-300 overflow-x-auto leading-relaxed">{code}</pre>
    </div>
  )
}

function Badge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    POST: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    DELETE: 'bg-red-500/10 text-red-400 border-red-500/20',
  }
  return (
    <span className={`inline-flex text-xs font-mono font-bold px-2 py-0.5 rounded border ${colors[method] || 'bg-muted text-muted-foreground'}`}>
      {method}
    </span>
  )
}

function EndpointCard({ method, path, description, request, response, notes }: {
  method: string
  path: string
  description: string
  request?: string
  response: string
  notes?: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-muted/20 transition-colors"
      >
        <Badge method={method} />
        <code className="text-sm font-mono text-foreground flex-1">{path}</code>
        <span className="text-xs text-muted-foreground hidden md:block pr-4">{description}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="border-t border-border p-5 space-y-5 bg-muted/10">
          <p className="text-sm text-muted-foreground">{description}</p>
          {notes && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3 text-xs text-amber-400">
              {notes}
            </div>
          )}
          {request && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Request body</p>
              <CodeBlock code={request} language="json" />
            </div>
          )}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Response</p>
            <CodeBlock code={response} language="json" />
          </div>
        </div>
      )}
    </div>
  )
}

const sections = [
  {
    id: 'overview',
    icon: <Terminal className="w-5 h-5" />,
    title: 'Overview',
  },
  {
    id: 'authentication',
    icon: <ShieldCheck className="w-5 h-5" />,
    title: 'Authentication',
  },
  {
    id: 'licences',
    icon: <Key className="w-5 h-5" />,
    title: 'Licence Keys',
  },
  {
    id: 'checkout',
    icon: <Download className="w-5 h-5" />,
    title: 'Checkout',
  },
  {
    id: 'discounts',
    icon: <Tag className="w-5 h-5" />,
    title: 'Discounts',
  },
  {
    id: 'errors',
    icon: <AlertCircle className="w-5 h-5" />,
    title: 'Errors',
  },
]

export default function APIDocsPage() {

  useEffect(() => { document.title = 'API Reference | LayerBuzz' }, [])

  const [activeSection, setActiveSection] = useState('overview')
  const baseUrl = 'https://layerbuzz.ayteelabs.com'

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 pt-28 pb-20">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/docs/sellers" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Seller docs</Link>
            <span className="text-muted-foreground/40">·</span>
            <Link href="/docs/buyers" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Buyer docs</Link>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-xs text-violet-400 font-medium">API reference</span>
          </div>
          <h1 className="text-4xl font-display font-semibold mb-3">API Reference</h1>
          <p className="text-muted-foreground max-w-xl">Integrate LayerBuzz into your own tools and workflows. Use the API to validate licence keys, trigger checkouts, and more.</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-10">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-1">
              {sections.map(s => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  onClick={() => setActiveSection(s.id)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeSection === s.id
                      ? 'bg-violet-500/10 text-violet-400'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                  }`}
                >
                  <span className={activeSection === s.id ? 'text-violet-400' : 'text-muted-foreground'}>{s.icon}</span>
                  {s.title}
                </a>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-16">

            {/* Overview */}
            <section id="overview" className="scroll-mt-28">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                  <Terminal className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-semibold">Overview</h2>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                The LayerBuzz API is a REST API. All requests should be made over HTTPS. Responses are returned as JSON.
              </p>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Base URL</p>
                  <CodeBlock code={baseUrl} language="url" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Example request</p>
                  <CodeBlock language="bash" code={`curl -X GET "${baseUrl}/api/licences/validate?key=MYAPP-XXXX-XXXX-XXXX-XXXX"`} />
                </div>
              </div>
            </section>

            {/* Authentication */}
            <section id="authentication" className="scroll-mt-28">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-semibold">Authentication</h2>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Public endpoints (licence validation, free checkout, discount validation) do not require authentication. They are designed to be called from your application or CLI tools on behalf of your users.
              </p>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-5 py-4 text-sm text-amber-400">
                ⚠️ Do not expose your Supabase service role key or any internal secrets in client-side code. The public API endpoints are designed to be used without authentication.
              </div>
            </section>

            {/* Licence Keys */}
            <section id="licences" className="scroll-mt-28">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                  <Key className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-semibold">Licence Keys</h2>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Use these endpoints to validate and activate licence keys in your software. This is the core integration point for CLI tools and desktop apps sold through LayerBuzz.
              </p>
              <div className="space-y-3">
                <EndpointCard
                  method="GET"
                  path="/api/licences/validate"
                  description="Check whether a licence key is valid. Use this for passive validation — no activation count is incremented."
                  request={undefined}
                  response={JSON.stringify({
                    valid: true,
                    licence: {
                      key: "MYAPP-XXXX-XXXX-XXXX-XXXX",
                      product: "My App Pro",
                      buyer_email: "buyer@example.com",
                      status: "active",
                      activations_used: 1,
                      max_activations: 1
                    }
                  }, null, 2)}
                  notes="Query parameter: ?key=YOUR_LICENCE_KEY"
                />
                <EndpointCard
                  method="POST"
                  path="/api/licences/validate"
                  description="Validate a licence key and optionally increment the activation count. Use this when the user activates the software for the first time on a new machine."
                  request={JSON.stringify({
                    key: "MYAPP-XXXX-XXXX-XXXX-XXXX",
                    increment_activation: true
                  }, null, 2)}
                  response={JSON.stringify({
                    valid: true,
                    licence: {
                      key: "MYAPP-XXXX-XXXX-XXXX-XXXX",
                      product: "My App Pro",
                      buyer_email: "buyer@example.com",
                      status: "active",
                      activations_used: 1,
                      max_activations: 1
                    }
                  }, null, 2)}
                  notes="Set increment_activation: true only when the user is activating on a new machine. Do not call this on every app launch."
                />
              </div>
              <div className="mt-6">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Example — CLI activation</p>
                <CodeBlock language="typescript" code={`// Activate a licence key (call once, on first use)
const res = await fetch('${baseUrl}/api/licences/validate', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    key: userEnteredKey,
    increment_activation: true,
  }),
})

const data = await res.json()

if (data.valid) {
  // Save key locally and mark as activated
  saveKeyLocally(data.licence.key)
} else {
  console.error('Invalid key:', data.error)
}

// Validate on subsequent launches (no increment)
const res = await fetch(
  \`${baseUrl}/api/licences/validate?key=\${savedKey}\`
)
const data = await res.json()
// data.valid === true means key is still active`} />
              </div>
            </section>

            {/* Checkout */}
            <section id="checkout" className="scroll-mt-28">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                  <Download className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-semibold">Checkout</h2>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Use the free checkout endpoint to programmatically trigger a free product delivery — useful for giveaways, lead magnets, or automated workflows.
              </p>
              <div className="space-y-3">
                <EndpointCard
                  method="POST"
                  path="/api/checkout/free"
                  description="Deliver a free product to a buyer. Creates an order, sends a download link or licence key by email, and returns the download URL."
                  request={JSON.stringify({
                    productId: "uuid-of-product",
                    email: "buyer@example.com",
                    name: "Jane Smith"
                  }, null, 2)}
                  response={JSON.stringify({
                    downloadUrl: `${baseUrl}/download/your-token-here`
                  }, null, 2)}
                  notes="If the same email submits for the same product again, the existing order is reused and the same download URL is returned. No duplicate orders are created."
                />
                <EndpointCard
                  method="POST"
                  path="/api/checkout/session"
                  description="Create a Stripe checkout session for a paid product. Returns a Stripe checkout URL to redirect the buyer to."
                  request={JSON.stringify({
                    productId: "uuid-of-product",
                    email: "buyer@example.com",
                    name: "Jane Smith",
                    discountCode: "SAVE20"
                  }, null, 2)}
                  response={JSON.stringify({
                    url: "https://checkout.stripe.com/pay/cs_test_..."
                  }, null, 2)}
                  notes="discountCode is optional. Redirect the buyer to the returned URL to complete payment."
                />
              </div>
            </section>

            {/* Discounts */}
            <section id="discounts" className="scroll-mt-28">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                  <Tag className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-semibold">Discounts</h2>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Validate discount codes before applying them to a checkout. This endpoint is called client-side when a buyer enters a discount code on the product page.
              </p>
              <div className="space-y-3">
                <EndpointCard
                  method="POST"
                  path="/api/discount/validate"
                  description="Validate a discount code for a specific product. Returns the discount details if valid."
                  request={JSON.stringify({
                    code: "SAVE20",
                    productId: "uuid-of-product"
                  }, null, 2)}
                  response={JSON.stringify({
                    valid: true,
                    discount: {
                      code: "SAVE20",
                      discount_type: "percent",
                      discount_value: 20
                    }
                  }, null, 2)}
                  notes="discount_type is either 'percent' or 'fixed'. For fixed discounts, discount_value is in GBP."
                />
              </div>
            </section>

            {/* Errors */}
            <section id="errors" className="scroll-mt-28">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-semibold">Errors</h2>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                The API uses standard HTTP status codes. Errors return a JSON object with an <code className="text-violet-400 text-xs bg-violet-500/10 px-1.5 py-0.5 rounded">error</code> field describing what went wrong.
              </p>
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Status</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Meaning</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-mono">
                    {[
                      ['200', 'Success'],
                      ['400', 'Bad request — missing or invalid parameters'],
                      ['401', 'Unauthorised — authentication required'],
                      ['403', 'Forbidden — download limit reached or key revoked'],
                      ['404', 'Not found — product, order, or key does not exist'],
                      ['500', 'Server error — something went wrong on our end'],
                    ].map(([code, meaning]) => (
                      <tr key={code} className="hover:bg-muted/20 transition-colors">
                        <td className="px-5 py-3">
                          <span className={`text-xs font-bold ${
                            code.startsWith('2') ? 'text-emerald-400' :
                            code.startsWith('4') ? 'text-amber-400' : 'text-red-400'
                          }`}>{code}</span>
                        </td>
                        <td className="px-5 py-3 text-xs text-muted-foreground font-sans">{meaning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Error response format</p>
                <CodeBlock code={JSON.stringify({ error: "Invalid licence key" }, null, 2)} language="json" />
              </div>
              <div className="mt-5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Handling errors in code</p>
                <CodeBlock language="typescript" code={`const res = await fetch('${baseUrl}/api/licences/validate', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ key, increment_activation: true }),
})

if (!res.ok) {
  const err = await res.json()
  console.error('API error:', err.error)
  return
}

const data = await res.json()
if (!data.valid) {
  console.error('Invalid key:', data.error)
}`} />
              </div>
            </section>

          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
