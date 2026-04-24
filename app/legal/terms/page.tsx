import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import { ThemeApplier } from '@/components/providers/theme-applier'

export const metadata = { title: 'Terms of Service' }


export default function TermsPage() {
  return (
    <main>
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-20">
        <h1 className="text-4xl font-display mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-12">Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

        <div className="prose prose-sm max-w-none space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance</h2>
            <p>By using LayerBuzz, you agree to these terms. LayerBuzz is a platform operated by AytéeLabs that allows creators to sell digital products. We charge a 3% fee on each sale — no monthly fees, ever.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Seller responsibilities</h2>
            <p>As a seller on LayerBuzz, you are responsible for the products you list. You must own or have the rights to sell anything you list. You must not sell:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Illegal content of any kind</li>
              <li>Content that infringes on others&apos; intellectual property</li>
              <li>Misleading or fraudulent products</li>
              <li>Adult-only content unless explicitly approved</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Fees and payments</h2>
            <p>LayerBuzz charges a platform fee of 3% on every sale. Payments are processed via Stripe. Sellers must connect a Stripe account to receive payouts. LayerBuzz is not responsible for Stripe fees, which are separate and charged by Stripe directly.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Account suspension</h2>
            <p>Unlike some platforms, we do not suspend accounts without notice. If we believe a seller has violated these terms, we will send a warning with a clear reason before taking action. Sellers have the right to appeal any suspension by contacting us.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Buyer rights</h2>
            <p>Buyers receive a secure download link after purchase. Downloads are limited to prevent abuse. Buyers are entitled to the files as described in the product listing. Disputes should be raised with the seller in the first instance.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Limitation of liability</h2>
            <p>LayerBuzz is provided &quot;as is&quot;. We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform. Our total liability is limited to the fees we have collected from you in the past 12 months.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Contact</h2>
            <p>For any questions about these terms, please contact us via AytéeLabs at <a href="https://ayteelabs.com" className="text-violet-600 hover:underline">ayteelabs.com</a>.</p>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  )
}
