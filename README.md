# Bayar Bareng

Bayar Bareng is a modern, responsive, and user-friendly split bill calculator built with Next.js 14+ and Tailwind CSS v3. It's designed to make splitting bills among friends incredibly easy, handling complex calculations like proportional discounts, delivery fees, additional charges, and proportional cashback logic.

## Features

- **Dynamic Items:** Add multiple people and list exactly what each person ordered.
- **Smart Calculations:**
  - **Discounts:** Applied proportionally based on each person's subtotal (with optional max cap).
  - **Cashback:** Option to calculate proportionally based on total items or total payment (with optional max cap).
  - **Delivery & Extra Fees:** Shared equally among all participants.
- **Live Preview:** See real-time calculations on the desktop sidebar as you type.
- **Share via WhatsApp:** Quickly share a beautifully formatted breakdown directly via WhatsApp.
- **History Logs:** Saves your recent bills (up to 20 entries) locally so you can revisit or re-share them later.
- **Beautiful UI:** Polished Dark Mode interface optimized for both desktop and mobile screens.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v3
- **Icons:** React Icons
- **Storage:** LocalStorage API

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Copyright

&copy; Bayar Bareng. All rights reserved.
@aljasonch
