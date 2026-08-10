# Bilbil

Bilbil is a modern, responsive, and user-friendly split bill calculator built with Next.js and Tailwind CSS v3. It's designed to make splitting bills among friends incredibly easy, handling complex calculations like proportional discounts, delivery fees, additional charges, and proportional cashback logic.

## Features

- **Dynamic Items:** Add multiple people and list exactly what each person ordered.
- **Kopi Kenangan Mode:** Built-in menu catalog with sizes, modifiers (upgrades, syrups, add-ons), sweetness & ice level options — fetched live from Supabase.
- **Smart Calculations:**
  - **Discounts:** Applied proportionally based on each person's subtotal (with optional max cap).
  - **Cashback:** Option to calculate proportionally based on total items or total payment (with optional max cap).
  - **Delivery & Extra Fees:** Shared equally among all participants.
- **Live Preview:** See real-time calculations on the desktop sidebar as you type.
- **Share via WhatsApp:** Quickly share a beautifully formatted breakdown directly via WhatsApp.
- **History Logs:** Saves your recent bills (up to 20 entries) locally so you can revisit or re-share them later.
- **Admin Panel (`/admin`):** Manage menu items, categories, modifiers, and outlet config via a protected dashboard.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v3
- **Backend:** [Supabase](https://supabase.com/) (Database + Auth)
- **Icons:** React Icons, Lucide React
- **Storage:** LocalStorage API (history), Supabase PostgreSQL (menu data)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Setup Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the schema in SQL Editor:
   ```
   docs/supabase/schema.sql
   ```
3. Run the seed data:
   ```
   docs/supabase/seed.sql
   ```
4. Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```
5. Create an admin user in Supabase Dashboard → Authentication → Users → Add User

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the main app, or [http://localhost:3000/admin](http://localhost:3000/admin) for the admin panel.

## Copyright

&copy; Bilbil. All rights reserved.
@aljasonch
