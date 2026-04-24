'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import { ChevronDown, Package, CreditCard, BarChart2, Tag, Key, ShieldCheck, Mail, HelpCircle, Upload, Settings } from 'lucide-react'
import { ThemeApplier } from '@/components/providers/theme-applier'

const sections = [
  {
    id: 'getting-started',
    icon: <Package className="w-5 h-5" />,
    title: 'Getting Started',
    content: `LayerBuzz lets you sell digital products — files, software, music, templates, and more — with no upfront cost. Create an account, set up your profile, and publish your first product in minutes. LayerBuzz takes a 3% platform fee on paid sales. Free products have no fees.`,
    faqs: [
      {
        q: 'How do I create a seller account?',
        a: 'Click "Start selling free" on the homepage and sign up with your email. Once signed in, go to Settings to set up your username, display name, and connect Stripe to receive payments.',
      },
      {
        q: 'Do I need to connect Stripe before publishing?',
        a: 'You need a connected Stripe account to sell paid products. Free products can be published without Stripe. Go to Dashboard → Settings → scroll to "Payouts" to connect your Stripe account.',
      },
      {
        q: 'What is LayerBuzz\'s fee?',
        a: 'LayerBuzz charges a 3% platform fee on paid sales. Stripe also charges their standard processing fee (typically 1.4% + 20p for UK cards). Free products have no fees at all.',
      },
      {
        q: 'What types of digital products can I sell?',
        a: 'You can sell any digital file — ZIP archives, PDFs, audio files, video files, software, templates, ebooks, presets, and more. You can also sell software licence keys directly through LayerBuzz.',
      },
    ],
  },
  {
    id: 'products',
    icon: <Upload className="w-5 h-5" />,
    title: 'Creating & Managing Products',
    content: `Go to Dashboard → Products → New Product to create a listing. Add a title, description, cover image (optional), set a price, upload your files, and publish. Products are live instantly once published.`,
    faqs: [
      {
        q: 'What\'s the maximum file size I can upload?',
        a: 'Each file can be up to 500MB. If your product contains multiple files, each individual file must be under 500MB.',
      },
      {
        q: 'Can I sell multiple files in one product?',
        a: 'Yes. You can upload multiple files to a single product listing. Buyers will be able to download all files from the same download page.',
      },
      {
        q: 'What is a licence key product?',
        a: 'A licence key product is for software sellers. Instead of a file download, the buyer receives a unique licence key by email after purchase. You can set the maximum number of activations per key and customise the email template.',
      },
      {
        q: 'Can I offer a product for free?',
        a: 'Yes. Set the price to £0 or toggle the "Free product" option. Buyers will still need to enter their email to receive the download link.',
      },
      {
        q: 'How do I edit or unpublish a product?',
        a: 'Go to Dashboard → Products, find your product and click Edit. You can update any details and save. To unpublish, toggle the "Published" switch on the product — it will be hidden from your store immediately.',
      },
      {
        q: 'Can I customise the buy button text?',
        a: 'Yes. In the product editor scroll down to "Customise" and enter your custom button text in the "Custom buy button text" field.',
      },
      {
        q: 'Can I add a thank you message?',
        a: 'Yes. In the product editor scroll down to "Customise" and enter your thank you message. It will be shown on the download page after purchase.',
      },
    ],
  },
  {
    id: 'payments',
    icon: <CreditCard className="w-5 h-5" />,
    title: 'Payments & Payouts',
    content: `LayerBuzz uses Stripe Connect to handle payments. When a buyer purchases your product, Stripe processes the payment, deducts the LayerBuzz platform fee (3%) and Stripe's processing fee, and the remainder is transferred to your connected Stripe account.`,
    faqs: [
      {
        q: 'How do I get paid?',
        a: 'Connect your Stripe account in Dashboard → Settings. Once connected, Stripe automatically transfers your earnings to your bank account on their standard payout schedule (typically 2-7 business days after a sale).',
      },
      {
        q: 'When do I receive my money?',
        a: 'Stripe typically pays out 2-7 business days after a sale, depending on your country and account settings. You can check your payout schedule in your Stripe dashboard.',
      },
      {
        q: 'What currencies are supported?',
        a: 'Currently LayerBuzz displays prices in GBP (£). Stripe handles currency conversion for international buyers.',
      },
      {
        q: 'What happens if a buyer requests a refund?',
        a: 'If a buyer emails support@ayteelabs.com requesting a refund, we review it and if approved, process it via Stripe. The 3% LayerBuzz platform fee is non-refundable. Your Stripe processing fee is also non-refundable per Stripe\'s policy.',
      },
      {
        q: 'What happens if a buyer raises a chargeback?',
        a: 'Chargebacks are handled through Stripe\'s dispute process. LayerBuzz will provide evidence on your behalf where available. Make sure your product descriptions are accurate to minimise dispute risk.',
      },
    ],
  },
  {
    id: 'discounts',
    icon: <Tag className="w-5 h-5" />,
    title: 'Discount Codes',
    content: `Create discount codes to offer buyers a percentage or fixed amount off your products. Go to Dashboard → Discounts → New Discount Code. You can set an expiry date, usage limit, and choose between percent or fixed amount discounts.`,
    faqs: [
      {
        q: 'How do I create a discount code?',
        a: 'Go to Dashboard → Discounts and click "New discount code". Enter a code name (e.g. SAVE20), choose percent or fixed discount, set the value, and optionally add an expiry date and usage limit.',
      },
      {
        q: 'Can I limit a discount code to a specific product?',
        a: 'Discount codes currently apply across all your products. Per-product discount codes are coming in a future update.',
      },
      {
        q: 'How does a buyer apply a discount code?',
        a: 'On the product page, after clicking the buy button, buyers will see an optional "Discount code" field before checkout. They enter the code and click Apply.',
      },
    ],
  },
  {
    id: 'licences',
    icon: <Key className="w-5 h-5" />,
    title: 'Licence Keys',
    content: `If you sell software, LayerBuzz can automatically generate and email unique licence keys to buyers after purchase. Go to Dashboard → Licences to view all issued keys and revoke access if needed.`,
    faqs: [
      {
        q: 'How do I set up licence key delivery?',
        a: 'When creating or editing a product, set the Product Type to "Licence key". Set a key prefix (e.g. MYAPP), maximum activations per key, and optionally customise the email subject and body using placeholders like {{licence_key}} and {{buyer_name}}.',
      },
      {
        q: 'What placeholders can I use in the licence email?',
        a: 'You can use: {{buyer_name}}, {{licence_key}}, {{max_activations}}, {{seller_name}}, {{product_title}}.',
      },
      {
        q: 'How do I revoke a licence key?',
        a: 'Go to Dashboard → Licences, find the key and click the Revoke button. The buyer will no longer be able to activate or use the key. You can also reinstate a key if needed.',
      },
      {
        q: 'Can buyers activate on multiple machines?',
        a: 'Yes, up to the maximum activations you set per key. The default is 1. You can increase this when creating the product.',
      },
    ],
  },
  {
    id: 'analytics',
    icon: <BarChart2 className="w-5 h-5" />,
    title: 'Analytics',
    content: `Go to Dashboard → Analytics to see your revenue over time, top performing products, total sales, and views. Analytics are updated in real time as buyers interact with your products.`,
    faqs: [
      {
        q: 'What metrics can I track?',
        a: 'You can track total revenue, number of sales, product views, and downloads. The analytics dashboard shows a revenue chart over time and a breakdown of your top products by revenue.',
      },
      {
        q: 'How are views counted?',
        a: 'A view is counted each time someone visits your product page. Repeated visits from the same session may count as multiple views.',
      },
    ],
  },
  {
    id: 'settings',
    icon: <Settings className="w-5 h-5" />,
    title: 'Account & Settings',
    content: `Go to Dashboard → Settings to update your profile, username, bio, avatar, website, and social links. Your username determines your public store URL: layerbuzz.ayteelabs.com/store/[username].`,
    faqs: [
      {
        q: 'Can I change my username?',
        a: 'Yes. Go to Dashboard → Settings and update your username. Note that changing your username will change your store URL and all existing product links will update automatically.',
      },
      {
        q: 'How do I upload a profile picture?',
        a: 'Go to Dashboard → Settings and click on the avatar area to upload an image. Supported formats: JPG, PNG, WebP.',
      },
      {
        q: 'How do I delete my account?',
        a: 'Email support@ayteelabs.com and we will process your account deletion within 5 business days.',
      },
    ],
  },
  {
    id: 'security',
    icon: <ShieldCheck className="w-5 h-5" />,
    title: 'Security',
    content: `LayerBuzz uses secure download tokens and download limits to protect your files from unauthorised sharing. Licence keys are tied to specific machines and can be revoked at any time.`,
    faqs: [
      {
        q: 'How are my files protected?',
        a: 'Files are stored in a private Supabase storage bucket. Buyers access files via unique, expiring download tokens. Download attempts are limited to 5 per purchase by default.',
      },
      {
        q: 'Can I revoke a buyer\'s download access?',
        a: 'Yes. Go to Dashboard → Orders, find the order and click the Revoke button. This sets the download limit to 0, preventing any further downloads from that link.',
      },
      {
        q: 'What happens to my files if I delete a product?',
        a: 'Deleting a product unpublishes it and removes it from your store. Files remain in storage and existing download tokens for buyers who already purchased remain valid.',
      },
    ],
  },
  {
    id: 'support',
    icon: <HelpCircle className="w-5 h-5" />,
    title: 'Still Need Help?',
    content: `If you can't find the answer you're looking for, email us at support@ayteelabs.com. We aim to respond within 2 business days.`,
    faqs: [
      {
        q: 'How do I contact support?',
        a: 'Email support@ayteelabs.com with your account email, a description of your issue, and any relevant screenshots. We\'ll get back to you as soon as possible.',
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

export default function SellersDocsPage() {

  useEffect(() => { document.title = 'Seller Guide | LayerBuzz' }, [])

  const [activeSection, setActiveSection] = useState('getting-started')

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 pt-28 pb-20">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-violet-400 font-medium">Seller docs</span>
            <span className="text-muted-foreground/40">·</span>
            <Link href="/docs/buyers" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Buyer docs</Link>
          </div>
          <h1 className="text-4xl font-display font-semibold mb-3">Seller Guide</h1>
          <p className="text-muted-foreground max-w-xl">Everything you need to know about selling on LayerBuzz — from creating your first product to getting paid.</p>
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
              <HelpCircle className="w-8 h-8 text-violet-400 mx-auto mb-3" />
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
