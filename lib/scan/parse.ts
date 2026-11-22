import type { ScannedReceipt } from '@/lib/types'

export class ScanParseError extends Error {}

/** Gemini response schema (OpenAPI subset) for a Kopi Kenangan receipt. */
export const RECEIPT_SCHEMA = {
  type: 'object',
  properties: {
    outlet: { type: 'string' },
    orderType: { type: 'string', enum: ['pickup', 'delivery'] },
    date: { type: 'string', description: 'yyyy-mm-dd' },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          qty: { type: 'integer' },
          name: { type: 'string' },
          note: { type: 'string' },
          lineTotal: { type: 'integer' },
        },
        required: ['qty', 'name', 'lineTotal'],
      },
    },
    subtotal: { type: 'integer' },
    promo: { type: 'integer' },
    deliveryFee: { type: 'integer' },
    otherFees: {
      type: 'array',
      items: { type: 'object', properties: { name: { type: 'string' }, amount: { type: 'integer' } }, required: ['name', 'amount'] },
    },
    total: { type: 'integer' },
    cashbackPct: { type: 'integer' },
    cashbackMax: { type: 'integer' },
  },
  required: ['outlet', 'orderType', 'items', 'subtotal', 'total'],
} as const

const fail = (msg: string): never => {
  throw new ScanParseError(msg)
}

/** Accepts 25000, "25000", "25.000", "Rp 25.000"; rejects anything without digits. */
function int(value: unknown, field: string, fallback?: number): number {
  if (value === undefined || value === null || value === '') {
    return fallback ?? fail(`Struk tidak terbaca: ${field} tidak ditemukan.`)
  }
  if (typeof value === 'number' && Number.isFinite(value)) return Math.round(value)
  if (typeof value === 'string' && /\d/.test(value)) return Number(value.replace(/\D/g, ''))
  return fail(`Struk tidak terbaca: ${field} bukan angka.`)
}

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

export function parseScannedReceipt(raw: unknown): ScannedReceipt {
  if (!raw || typeof raw !== 'object') fail('Struk tidak terbaca. Coba foto yang lebih jelas.')
  const r = raw as Record<string, unknown>
  if (!Array.isArray(r.items) || r.items.length === 0) fail('Tidak ada item yang terbaca dari struk.')

  const items = (r.items as unknown[]).map((entry, i) => {
    const it = (entry ?? {}) as Record<string, unknown>
    const qty = int(it.qty, `jumlah item ${i + 1}`, 1)
    if (qty < 1) fail(`Jumlah item ${i + 1} tidak valid.`)
    const note = text(it.note)
    return { qty, name: text(it.name) || `Item ${i + 1}`, ...(note && { note }), lineTotal: int(it.lineTotal, `harga item ${i + 1}`) }
  })

  const otherFees = Array.isArray(r.otherFees)
    ? (r.otherFees as unknown[]).map((entry, i) => {
        const f = (entry ?? {}) as Record<string, unknown>
        return { name: text(f.name) || 'Biaya lain', amount: int(f.amount, `biaya lain ${i + 1}`) }
      })
    : []

  const date = text(r.date)
  const receipt: ScannedReceipt = {
    outlet: text(r.outlet),
    orderType: r.orderType === 'delivery' ? 'delivery' : 'pickup',
    ...(/^\d{4}-\d{2}-\d{2}$/.test(date) && { date }),
    items,
    subtotal: int(r.subtotal, 'subtotal'),
    promo: int(r.promo, 'promo', 0),
    deliveryFee: int(r.deliveryFee, 'ongkir', 0),
    otherFees,
    total: int(r.total, 'total'),
  }
  if (r.cashbackPct != null) receipt.cashbackPct = int(r.cashbackPct, 'cashback')
  if (r.cashbackMax != null) receipt.cashbackMax = int(r.cashbackMax, 'maks cashback')
  return receipt
}
