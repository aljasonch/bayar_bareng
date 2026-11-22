# Bilbil

Split bill calculator for ordering with friends, focused on Kopi Kenangan. Built with Next.js, Tailwind CSS, Firebase and Gemini.

## Features

- **Kopi Kenangan mode** (red theme):
  - **Scan struk**: upload a screenshot of a Kopi Kenangan app receipt. Gemini reads the items, promo, delivery fee and take away fee. You check the result, then tap each item to choose who ordered it.
  - **Susun dari menu**: build each person's order from the catalog (size, ice, sugar, modifiers, Normal/Mall outlet) before you order.
  - **Promo combos**: Pickup, Delivery A/B and Order di outlet, editable in the admin.
- **Nota umum** (warm theme): type items and prices by hand for any restaurant or shop.
- **Two promo layers**, applied in this order:
  1. The app promo (discount, fixed cut, or cashback points) is based on the item total.
  2. The payment promo (e.g. blu) is based on the total payment after the app promo, delivery and other fees.
  3. If a minimum spend isn't reached, the app shows "kurang Rp X lagi".
- **Fair split**:
  - Discounts and cashback are proportional to what each person ordered.
  - Delivery and other fees are split equally.
  - Shared items are split equally between the people who chose them.
  - Rounding always adds up exactly to the total.
- **Result**: digital receipt, WhatsApp message, and a history of the last 20 bills (stored in the browser).
- **Admin panel** (`/admin`): menu, categories, modifiers, outlet config and promo combos.

## Setup

### 1. Install

```bash
pnpm install
```

### 2. Firebase

1. Create a Firebase project. Add a **Web app** and copy its config into `.env.local` (see `.env.local.example`).
2. Enable **Firestore** and **Authentication → Email/Password**.
3. Deploy the security rules:
   ```bash
   pnpm exec firebase deploy --only firestore:rules --project <your-project-id>
   ```
   Everyone can read the catalog. Only admins can write.
4. Create your admin user in Authentication. Then create a Firestore document `admins/<that user's UID>`; any field works, e.g. `{ "email": "you@example.com" }`.

To run the rules tests (requires **Java 21+**):

```bash
pnpm test:rules
```

### 3. Move the menu from Supabase (one time)

The script reads the old Supabase tables and writes them to Firestore. It also seeds the four default promo combos if none exist.

```bash
node --env-file=.env scripts/migrate-supabase-to-firestore.mjs --dry-run
GOOGLE_APPLICATION_CREDENTIALS=service-account.json node --env-file=.env scripts/migrate-supabase-to-firestore.mjs
```

Download `service-account.json` from Firebase → Project settings → Service accounts. Keep it out of git. The script can be re-run safely.

### 4. Gemini (receipt scan)

Get an API key from Google AI Studio and set `GEMINI_API_KEY` (server only). `GEMINI_MODEL` defaults to `gemini-3.5-flash-lite`.

On the free tier, Google may use request content to improve its products. Kopi Kenangan receipts include the customer's name.

### 5. Run

```bash
pnpm dev     # http://localhost:3000
pnpm test    # unit tests
```

On Vercel, set the same environment variables as in `.env.local`.

## Notes

- History from v1 (the Supabase version) isn't shown, because the format changed. Saved people (the roster) carry over.
- The `/api/scan` rate limit (10 per minute per IP) is kept in memory on each server instance.

## Copyright

&copy; Bilbil. All rights reserved.
