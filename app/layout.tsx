import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { NavigationProgress } from '@/components/ui/navigation-progress'
import { ThemeApplier } from '@/components/providers/theme-applier'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: {
    default: 'LayerBuzz',
    template: '%s | LayerBuzz',
  },
  description: 'The creator marketplace built different. Sell digital products, files, software, and more. Fair fees, beautiful storefronts, real analytics.',
  keywords: ['sell digital products', 'creator marketplace', 'sell files online', 'gumroad alternative'],
  openGraph: {
    title: 'LayerBuzz — Sell anything. Layer everything.',
    description: 'The creator marketplace built different.',
    url: 'https://layerbuzz.ayteelabs.com',
    siteName: 'LayerBuzz',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LayerBuzz',
    description: 'The creator marketplace built different.',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Fetch theme server-side to avoid FOUC
  let theme = 'midnight'
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('theme')
        .eq('id', user.id)
        .single()
      if (profile?.theme) theme = profile.theme
    }
  } catch {}

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,600;12..96,700&family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
        {/* Inline script sets theme before first paint — prevents FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.setAttribute('data-theme', '${theme}')`,
          }}
        />
      </head>
      <body className="antialiased">
        <NavigationProgress />
        <ThemeApplier initialTheme={theme} />
        {children}
        <Toaster />
      </body>
    </html>
  )
}
