'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import { ChevronDown, Download, Mail, Key, RefreshCw, ShieldCheck, AlertCircle, HelpCircle } from 'lucide-react'
import { ThemeApplier } from '@/components/providers/theme-applier'

const sections = [
  {
    id: 'getting-started',
    icon: <Download className="w-5 h-5" />,
    title: 'Getting Started',
    content: `LayerBuzz is a marketplace where independent creators sell digital products — files, software, music, templates, and more. You don't need an account to buy. Simply find a product you like, enter your name and email, and complete the purchase. Your download or licence key will be delivered instantly.`,
    faqs: [
      {
        q: 'Do I need to create an account to buy?',
        a: 'No. You just need your email address. We use it to deliver your download link or licence key and to identify you if you need support.',
      },
      {
        q: 'What payment methods are accepted?',
        a: 'LayerBuzz uses Stripe for all payments, so we accept all major credit and debit cards including Visa, Mastercard, and American Express. Apple Pay and Google Pay may also be available depending on your device.',
      },
      {
        q: 'Is my payment secure?',
        a: 'Yes. All payments are processed by Stripe, one of the world\'s most trusted payment processors. LayerBuzz never stores your card details.',
      },
    ],
  },
  {
    id: 'downloading',
    icon: <Download className="w-5 h-5" />,
    title: 'Downloading Your Files',
    content: `After completing your purchase, you will be redirected to a download page where you can access your files immediately. A download link will also be sent to your email so you can come back later.`,
    faqs: [
      {
        q: 'How many times can I download my files?',
        a: 'Each purchase comes with 5 download attempts. This is enough for most use cases, but if you need more access please contact us at support@ayteelabs.com with your order email and we can help.',
      },
      {
        q: 'I didn\'t receive my download email — what do I do?',
        a: 'First check your spam or junk folder. If it\'s not there, go back to the product page and re-enter your email address. The system will recognise your email and send you back to your existing download page without creating a new order.',
      },
      {
        q: 'My download link isn\'t working.',
        a: 'Download links expire after a set number of uses. If you\'ve used all your download attempts, email us at support@ayteelabs.com with your order email address and we\'ll restore your access.',
      },
      {
        q: 'Can I download on multiple devices?',
        a: 'Yes — each time you click the download button counts as one attempt, regardless of which device you use. Just use the same download link from your email on each device.',
      },
    ],
  },
  {
    id: 'licence-keys',
    icon: <Key className="w-5 h-5" />,
    title: 'Licence Keys',
    content: `Some products on LayerBuzz are software tools that use licence keys instead of file downloads. After purchasing, your licence key will be emailed to you. You activate it once inside the software using a command like \`activate <your-key>\`.`,
    faqs: [
      {
        q: 'Where is my licence key?',
        a: 'Your licence key is sent to the email you provided at checkout. Check your inbox and spam folder. If you can\'t find it, email support@ayteelabs.com with the email you used to purchase.',
      },
      {
        q: 'I activated my key but it says "invalid licence key".',
        a: 'Make sure you\'re copying the key exactly as shown in the email, including any dashes. Keys are case-sensitive. If you\'re still having issues, contact support@ayteelabs.com.',
      },
      {
        q: 'Can I use my licence key on multiple machines?',
        a: 'Each licence key has a maximum number of activations set by the seller. This is shown in your purchase email. If you need to transfer your licence to a new machine, contact support@ayteelabs.com.',
      },
      {
        q: 'My licence key has been revoked — what does that mean?',
        a: 'A licence key can be revoked by the seller, typically in the case of a refund or a terms of service violation. If you believe this was done in error, contact support@ayteelabs.com.',
      },
    ],
  },
  {
    id: 'refunds',
    icon: <RefreshCw className="w-5 h-5" />,
    title: 'Refunds',
    content: `Because digital products are delivered instantly, refunds are handled on a case-by-case basis. If you are unhappy with a purchase or the product is materially different from its description, you can request a refund within 14 days.`,
    faqs: [
      {
        q: 'How do I request a refund?',
        a: 'Email support@ayteelabs.com within 14 days of your purchase. Include your order email address, the product name, and the reason for your request. We aim to respond within 2 business days.',
      },
      {
        q: 'What happens to my download access after a refund?',
        a: 'Once a refund is approved, your download link will be revoked and any licence keys issued will be deactivated. Refunds are returned to your original payment method.',
      },
      {
        q: 'I raised a chargeback — what happens next?',
        a: 'Chargebacks are handled through Stripe\'s dispute process. Please contact us before raising a chargeback as we\'re usually able to resolve issues quickly and directly.',
      },
    ],
  },
  {
    id: 'security',
    icon: <ShieldCheck className="w-5 h-5" />,
    title: 'Security & Privacy',
    content: `LayerBuzz takes your privacy seriously. We only collect the information needed to deliver your purchase — your name, email address, and payment details (handled entirely by Stripe). We never sell your data.`,
    faqs: [
      {
        q: 'Will the seller see my personal details?',
        a: 'Sellers can see your name and email address for the purpose of fulfilling your order and providing support. They cannot see your payment details.',
      },
      {
        q: 'Will I receive marketing emails?',
        a: 'No. We only send transactional emails — your download link, licence key, and order confirmation. You won\'t be added to any mailing lists.',
      },
    ],
  },
  {
    id: 'support',
    icon: <HelpCircle className="w-5 h-5" />,
    title: 'Still Need Help?',
    content: `If you can't find the answer you're looking for, our support team is here to help. Email us at support@ayteelabs.com and we'll get back to you within 2 business days.`,
    faqs: [
      {
        q: 'How do I contact support?',
        a: 'Email support@ayteelabs.com. Please include your order email address, the product name, and a description of your issue so we can help you as quickly as possible.',
      },
    ],
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/30 transition-colors"
      >
        <span className="text-sm font-medium pr-4">{q}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">
          {a}
        </div>
      )}
    </div>
  )
}

export default function BuyersDocsPage() {

  useEffect(() => { document.title = 'Buyer Guide | LayerBuzz' }, [])

  const [activeSection, setActiveSection] = useState('getting-started')

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 pt-28 pb-20">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/docs/sellers" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Seller docs</Link>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-xs text-violet-400 font-medium">Buyer docs</span>
          </div>
          <h1 className="text-4xl font-display font-semibold mb-3">Buyer Guide</h1>
          <p className="text-muted-foreground max-w-xl">Everything you need to know about purchasing, downloading, and getting support on LayerBuzz.</p>
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
              <div className="pt-4 border-t border-border mt-4">
                <a href="mailto:support@ayteelabs.com" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors">
                  <Mail className="w-5 h-5" />
                  Email support
                </a>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-16">
            {sections.map(s => (
              <section key={s.id} id={s.id} className="scroll-mt-28">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                    {s.icon}
                  </div>
                  <h2 className="text-xl font-semibold">{s.title}</h2>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">{s.content}</p>
                {s.faqs.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Frequently asked</p>
                    {s.faqs.map((faq, i) => (
                      <FAQItem key={i} q={faq.q} a={faq.a} />
                    ))}
                  </div>
                )}
              </section>
            ))}

            {/* CTA */}
            <div className="bg-violet-500/5 border border-violet-500/20 rounded-2xl p-8 text-center">
              <AlertCircle className="w-8 h-8 text-violet-400 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Can't find what you're looking for?</h3>
              <p className="text-sm text-muted-foreground mb-4">Our support team usually responds within 2 business days.</p>
              <a href="mailto:support@ayteelabs.com" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
                <Mail className="w-4 h-4" />
                Contact support
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
