# BLACK SEVEN — Online Store

🇪🇸 [Leer en español](README.md)

An e-commerce site for clothing (T-shirts, hoodies, jackets and sets) with a catalog, cart, checkout, order tracking and an admin panel designed to be used from a phone.

<!-- Add a screenshot here: ![Home](docs/screenshots/home.png) -->

**Demo:** _(add link if deployed)_

## Features

### Storefront
- Catalog with search, collection page and product detail page with sizes and a size guide.
- Slide-out cart and favorites list (global state with the Context API).
- Checkout with **bank transfer** payment and proof of payment sent via WhatsApp. Online card payment (Naranja X) is implemented and enabled with a configuration flag.
- Order tracking by order number and email (`/seguimiento`).
- Transactional order emails through Resend.
- SEO: `sitemap.xml`, `robots.txt`, dynamic Open Graph image and legal pages (terms, privacy, shipping and returns).

### Admin panel (`/admin`)
- Password login with a signed (HMAC), `httpOnly` session cookie that expires after 12 hours.
- **Orders:** status changes (awaiting transfer → paid → preparing → shipped → delivered / cancelled), tracking code and customer notification by email.
- **Products:** create, edit and delete, with image upload and stock control.
- **Hero and announcements:** management of the home hero (with reordering) and the announcement bar.
- Usage guide for the store owner (in Spanish): [docs/GUIA-PANEL.md](docs/GUIA-PANEL.md).

### Security and robustness
- Per-IP rate limiting stored in the database, so it holds across multiple server instances.
- Constant-time credential comparison (`timingSafeEqual`).
- Prices and stock are computed on the server; client input is not trusted.
- Payment webhook verified with a secret.

## Tech stack

| Area | Tools |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Animations and icons | Framer Motion, Lucide |
| Database | Supabase (PostgreSQL) |
| Email | Resend |
| Payments | Bank transfer + Naranja X (optional) |
| Deployment | Vercel |

## Project structure

```
app/            Pages and API routes (store, checkout, admin, webhooks)
components/     Store and admin panel components (components/admin)
context/        Cart, favorites and products
lib/            Business logic: orders, pricing, stock, auth, payments, emails
supabase/       SQL scripts (schema, products, hero, announcements, stock and limits)
docs/           Documentation for the store owner
public/         Images and static assets
```

## Local setup

Requirements: Node.js 20 or higher and a Supabase project.

```bash
git clone https://github.com/Joacuwu/black-seven-web.git
cd black-seven-web
npm install
```

1. In the Supabase **SQL Editor**, run the scripts in the `supabase/` folder. Start with `schema.sql`, then `products.sql`, `hero.sql`, `announcements.sql` and `stock-y-limites.sql`.
2. Create a `.env.local` file in the project root with the variables from the table below.
3. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Purpose | Required |
|---|---|---|
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Service key (server only, never exposed to the client) | Yes |
| `ADMIN_PASSWORD` | Password for the `/admin` panel | Yes |
| `NEXT_PUBLIC_SITE_URL` | Public site URL (emails, sitemap, metadata) | Recommended |
| `RESEND_API_KEY` | Order email delivery | To send emails |
| `ADMIN_EMAIL` | Administrator email | Optional |
| `NEXT_PUBLIC_BANK_CBU`, `NEXT_PUBLIC_BANK_ALIAS` | Account that receives transfers | Yes, to take payments |
| `NEXT_PUBLIC_BANK_HOLDER` | Account holder name (hidden if unset) | Optional |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp number for payment proof, no `+` (e.g. `5491112345678`) | Yes |
| `NARANJAX_API_URL`, `NARANJAX_CLIENT_ID`, `NARANJAX_CLIENT_SECRET`, `NARANJAX_WEBHOOK_SECRET` | Online payment with Naranja X | Only if online payment is enabled |

## Store configuration

Payment details (bank account, alias, WhatsApp) are loaded from environment variables so they are not published in the repository: copy [`.env.example`](.env.example) to `.env.local` and fill it in. The online-payment switch lives in [`lib/payment-config.ts`](lib/payment-config.ts).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serves the production build |
| `npm run lint` | Lints the code with ESLint |

## Author

**Joaquín** — [@Joacuwu](https://github.com/Joacuwu)
