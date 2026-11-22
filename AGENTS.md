# AGENTS.md

Bilbil is a split-bill app, built mainly for splitting Kopi Kenangan orders between friends. These are the owner's rules. Follow them unless the owner says otherwise.

## Product

- The UI is in Indonesian. Write every UI string in Indonesian, in sentence case and a casual tone.
- The main flow:
  1. A friend sends a screenshot of the receipt.
  2. Scan it, or compose each person's order from the menu.
  3. Split the items between people.
  4. Calculate everyone's total automatically.
  5. Send it over WhatsApp.
- Keep "Susun dari menu" (the catalog picker). The owner always composes orders before ordering, so it is required, not an extra.
- There are two modes:
  - `/kopken`: Kopi Kenangan, with its menu, promos and combos.
  - `/umum`: general bills with manual items.
  The Kopi Kenangan-specific behaviour stays inside `/kopken`.

## Promo rules (Kopi Kenangan)

There are two promo layers, always computed in this order:

1. **App promo**, computed on the **item total**. Its minimum spend is checked against the item total. It is one of:
   - a % discount with a max and a min spend
   - a fixed amount, capped at the item total
   - cashback %, with a max
2. **Payment promo** (blu), computed on the **total payment**:
   - Total payment = item total − app discount + delivery fee + other fees.
   - Minimum is 50rb of total payment.
   - It stacks with every combo.

Cashback is points. It is **not** deducted from what is paid, but it is shared out per person.

Default combos (stored in Firestore `promoCombos`, editable in admin):

| Combo | App promo | Payment promo |
|---|---|---|
| Pickup | Cashback 30% maks 30rb | blu 40% maks 25rb, min 50rb |
| Delivery A | Diskon 25% maks 30rb, min 85rb | blu 40% maks 25rb, min 50rb |
| Delivery B | Diskon 35% maks 45rb, min 100rb | blu 40% maks 25rb, min 50rb |
| Order di outlet | Diskon 15% maks 10rb | blu 40% maks 25rb, min 50rb |

How each part is split between people:

- App discount and cashback: in proportion to each person's item total.
- Delivery and other fees: split equally.
- Payment discount: in proportion to each person's share of the payment.

Round with the largest-remainder method so the per-person amounts add up exactly to `round(paid − cashback)`. A known-good check: Delivery B on a 100rb item with 11.5rb delivery = **Rp 51.500**.

On Kopi Kenangan receipts, **Take Away is already inside Subtotal**. Mall outlets add a per-item price adjustment, 2rb by default.

## Design

- Fonts: **Google Sans** and **Google Sans Code**, through `next/font/google`.
- Themes:
  - **Kenangan Hangat** (warm) is the base theme everywhere.
  - **Merah Kenangan** (red) applies only in Kopi Kenangan mode.
  - Never apply Kopken branding to the whole app.
- It should feel tasteful, user-friendly and alive, never static. Animate meaningful moments, not everything, and respect `prefers-reduced-motion`.
- The owner rejected "too basic" designs and designs that don't fit a split-bill app.
- Mobile first: inputs are at least 16px on mobile, so iOS doesn't zoom.

## Stack

- Next.js App Router, React, TypeScript, and Tailwind with CSS-variable themes (`data-theme`). Use **pnpm**.
- **Firebase**, not Supabase:
  - Firestore holds the catalog, promo combos and outlet config.
  - Firebase Auth handles admin login.
  - An admin is a user with a doc at `admins/{uid}`. `firestore.rules` allows public reads of the catalog, and only admins can write.
- **AI receipt scan uses Gemini (free tier), not Claude or other paid APIs.**
  - It runs only server-side, in `app/api/scan/route.ts`.
  - The key is `GEMINI_API_KEY`. The model is `GEMINI_MODEL`, default `gemini-3.5-flash-lite`, falling back to `gemini-2.5-flash-lite` on 503/429.
- Hosting: **Vercel**.

## Working rules

- **Never read, print or log secret values** from `.env`, `.env.local` or `service-account*.json`. Only check whether a variable is set.
- Test-first for logic: bill math, the reducer, scan parsing and matching. Run before you claim anything is done:
  - `pnpm test`
  - `pnpm exec tsc --noEmit`
  - `pnpm lint`
- `pnpm test:rules` needs Java 21 because of the Firestore emulator.
- Verify UI changes in the browser on a mobile viewport, not only through tests.
- Ask before you merge, push to `master`, deploy, or write to production Firestore.
