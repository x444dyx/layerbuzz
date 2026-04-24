# LayerBuzz

> The creator marketplace built different. Sell anything. Keep 97%.

Built by AytéeLabs — a full Gumroad alternative with fair fees (3%), transparent moderation, modern UI, and real analytics.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), Tailwind CSS, Framer Motion |
| Backend | Next.js API Routes |
| Database | Supabase (PostgreSQL + RLS) |
| File Storage | Supabase Storage |
| Auth | Supabase Auth |
| Payments | Stripe (Connect for marketplace payouts) |
| Deployment | Vercel (frontend) |

---

## Getting Started

### 1. Clone and install

```bash
cd layerbuzz
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project (free tier)
2. Go to **SQL Editor** and run the full contents of `supabase/schema.sql`
3. This creates all tables, RLS policies, triggers, and storage buckets
4. Copy your project URL and anon key from **Settings > API**

### 3. Set up Stripe

1. Go to [stripe.com](https://stripe.com) and create an account
2. Enable **Connect** in your Stripe dashboard (for marketplace payouts)
3. Copy your publishable key and secret key from the Stripe dashboard
4. Set up a webhook endpoint pointing to `https://yourdomain.com/api/stripe/webhook`
5. Add these webhook events:
   - `checkout.session.completed`
   - `charge.refunded`
   - `charge.dispute.created`
6. Copy the webhook signing secret

### 4. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in all values:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxx
STRIPE_SECRET_KEY=sk_live_xxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxx

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Install geist font package

```bash
npm install geist
```

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Key Features

- **Seller dashboard** — products, orders, analytics, discount codes, settings
- **Beautiful storefronts** — every seller gets `/store/username`
- **Product pages** — cover image, files list, reviews, buy button
- **Secure checkout** — Stripe hosted checkout with 3% platform fee
- **Instant delivery** — secure download links via Supabase Storage signed URLs
- **Free products** — email-gated free download flow
- **Discount codes** — percent or fixed, per-product or global, with expiry
- **Real analytics** — revenue chart, top products, conversion rate
- **Reviews** — verified buyer reviews only
- **Stripe Connect** — sellers connect Stripe to receive payouts directly

---

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import to Vercel
3. Add all environment variables in Vercel project settings
4. Set `NEXT_PUBLIC_APP_URL` to your production domain
5. Update Stripe webhook URL to your production domain

### Custom domain

To use `layerbuzz.ayteelabs.com`:
1. Add the domain in Vercel project settings
2. Add the CNAME record in your DNS provider

---

## Project Structure

```
layerbuzz/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── auth/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── callback/route.ts
│   ├── dashboard/
│   │   ├── page.tsx                # Overview
│   │   ├── products/               # Products CRUD
│   │   ├── orders/                 # Order management
│   │   ├── analytics/              # Analytics
│   │   ├── discounts/              # Discount codes
│   │   └── settings/               # Profile + Stripe
│   ├── store/
│   │   ├── page.tsx                # Browse all
│   │   └── [username]/page.tsx     # Seller store
│   ├── p/[slug]/page.tsx           # Product detail
│   ├── success/page.tsx            # Post-purchase
│   ├── download/[token]/page.tsx   # Download page
│   ├── legal/                      # Terms, Privacy, Refunds
│   └── api/
│       ├── checkout/session/       # Stripe checkout
│       ├── checkout/free/          # Free product flow
│       ├── stripe/webhook/         # Stripe webhook
│       ├── stripe/connect/         # Stripe Connect
│       ├── download/[token]/       # Secure file delivery
│       └── discount/validate/      # Discount validation
├── components/
│   ├── ui/                         # Base UI components
│   ├── landing/                    # Landing page sections
│   ├── dashboard/                  # Dashboard components
│   └── store/                      # Store/product components
├── lib/
│   ├── supabase/                   # Client, server, middleware
│   ├── stripe.ts                   # Stripe client
│   └── utils.ts                    # Helpers
├── types/index.ts                  # TypeScript types
└── supabase/schema.sql             # Full DB schema
```

---

## Platform Fee

LayerBuzz takes **3% per sale**. This is handled via Stripe Connect's `application_fee_amount`. The seller receives the rest directly to their connected Stripe account.

---

## Built by

[AytéeLabs](https://ayteelabs.com) — adil's portfolio of indie products.
