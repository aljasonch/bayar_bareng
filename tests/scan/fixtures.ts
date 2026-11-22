import type { ScannedReceipt } from '@/lib/types'

export const receipt1: ScannedReceipt = {
  outlet: 'Pertamina Sangiang Jaya',
  orderType: 'pickup',
  date: '2026-11-15',
  items: [
    { qty: 1, name: 'Kopi Kenangan Mantan Ice...', note: 'Normal Ice', lineTotal: 19000 },
    { qty: 1, name: 'Kopi Kenangan Mantan Ice...', note: 'Normal Ice', lineTotal: 25000 },
    { qty: 1, name: 'Kopi Kenangan Mantan Ice...', note: 'No Ice', lineTotal: 25000 },
  ],
  subtotal: 69000,
  promo: 0,
  deliveryFee: 0,
  otherFees: [],
  total: 69000,
  cashbackPct: 30,
  cashbackMax: 30000,
}

export const receipt2: ScannedReceipt = {
  outlet: 'Ruko Jatiuwung Tangerang (FCK)',
  orderType: 'delivery',
  date: '2026-10-24',
  items: [
    { qty: 1, name: 'Kopi Kenangan Mantan Ice...', note: 'Normal Ice', lineTotal: 25000 },
    { qty: 1, name: 'Kopi Kenangan Mantan Ice...', note: 'Normal Ice', lineTotal: 28000 },
    { qty: 1, name: 'Cappuccino Ice Large Juw...', note: 'Normal Ice', lineTotal: 32000 },
  ],
  subtotal: 86500,
  promo: 34000,
  deliveryFee: 11500,
  otherFees: [{ name: 'Take Away 2', amount: 1500 }],
  total: 64000,
}
