import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import { ThemeApplier } from '@/components/providers/theme-applier'

export const metadata = { title: 'Privacy Policy' }


export default function PrivacyPage() {
  return (
    <main>
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-20">
        <h1 className="text-4xl font-display mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-12">Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

        <div className="prose prose-sm max-w-none space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">What we collect</h2>
            <p>LayerBuzz collects only what is necessary to operate:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Email address and name (for account and order management)</li>
              <li>Product files you upload (stored securely in Supabase)</li>
              <li>Basic analytics (page views, purchase events — no personal tracking)</li>
              <li>Stripe handles all payment data — we never see your card details</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">How we use it</h2>
            <p>Your data is used exclusively to operate LayerBuzz — to process purchases, deliver files, and show you your analytics. We do not sell, share, or monetise your data in any way.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Cookies</h2>
            <p>We use essential session cookies only, required for authentication. We do not use tracking, advertising, or analytics cookies.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">GDPR</h2>
            <p>LayerBuzz is built with UK and EU users in mind. You have the right to access, correct, or delete your data at any time. To request data deletion, contact us via AytéeLabs.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Third parties</h2>
            <p>We use Supabase (database and file storage) and Stripe (payments). Both are industry-leading services with strong security and privacy practices. Your uploaded files are stored privately and are only accessible via secure signed download links.</p>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  )
}
