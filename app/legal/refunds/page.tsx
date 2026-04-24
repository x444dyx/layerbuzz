import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import { ThemeApplier } from '@/components/providers/theme-applier'

export const metadata = { title: 'Refund Policy' }


export default function RefundsPage() {
  return (
    <main>
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-20">
        <h1 className="text-4xl font-display mb-2">Refund Policy</h1>
        <p className="text-muted-foreground mb-12">Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

        <div className="prose prose-sm max-w-none space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">For buyers</h2>
            <p>Because digital products are delivered instantly, refunds are handled on a case-by-case basis. If you are unhappy with your purchase, or if the product is materially different from its description, you can request a refund by emailing us at <a href="mailto:support@ayteelabs.com" className="text-violet-400 hover:underline">support@ayteelabs.com</a> within 14 days of purchase.</p>
            <p className="mt-3">Please include the following in your email:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Your order email address</li>
              <li>The product name</li>
              <li>The reason for your refund request</li>
            </ul>
            <p className="mt-3">We aim to respond to all refund requests within 2 business days. Approved refunds will be returned to your original payment method and any associated download links or licence keys will be revoked.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">For sellers</h2>
            <p>LayerBuzz&apos;s 3% platform fee is non-refundable in the event of a buyer refund, as the service was already provided. Stripe&apos;s payment processing fees are also non-refundable per their policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Disputes</h2>
            <p>If a dispute is raised via your card provider (chargeback), Stripe handles the dispute process. LayerBuzz will provide evidence on behalf of sellers where available. Sellers are responsible for maintaining accurate product descriptions to avoid disputes.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Contact</h2>
            <p>For any refund or purchase issues, email us directly at <a href="mailto:support@ayteelabs.com" className="text-violet-400 hover:underline">support@ayteelabs.com</a> and we will get back to you as soon as possible.</p>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  )
}
