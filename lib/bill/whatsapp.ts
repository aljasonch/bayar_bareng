import { formatRp } from '@/lib/money'
import type { Bill, BillTotals } from '@/lib/types'

export function formatBillDate(date: string): string {
  const d = new Date(`${date}T00:00:00`)
  return Number.isNaN(d.getTime()) ? date : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function whatsappText(bill: Bill, totals: BillTotals): string {
  const lines = ['*Bilbil - Split Bill*', `Tanggal split: ${formatBillDate(bill.date)}`]
  if (bill.mode === 'kopken') lines.push(`Store: Kopi Kenangan (${bill.outlet === 'mall' ? 'Mall Store' : 'Normal Store'})`)
  if (bill.payerName) {
    lines.push(`Ditalangi oleh: *${bill.payerName}*`)
    if (bill.payerAccount) lines.push(`No. Rek: ${bill.payerAccount}`)
  }
  lines.push('')

  bill.people.forEach((person, i) => {
    const share = totals.perPerson[i]
    lines.push(`*${person.name || 'Tanpa nama'}*`)
    for (const item of bill.items.filter((it) => it.assignees.includes(person.id))) {
      const n = item.assignees.length
      lines.push(`  - ${item.name || 'Item'}${n > 1 ? ` (1/${n})` : ''}: ${formatRp(Math.round(item.price / n))}`)
      if (item.detail) lines.push(`    ${item.detail}`)
    }
    if (share.appDiscount > 0) lines.push(`  Diskon: -${formatRp(share.appDiscount)}`)
    if (share.fees > 0) lines.push(`  Ongkir & biaya: +${formatRp(share.fees)}`)
    if (share.paymentDiscount > 0) lines.push(`  Promo bayar: -${formatRp(share.paymentDiscount)}`)
    if (share.cashback > 0) lines.push(`  Cashback: -${formatRp(share.cashback)}`)
    lines.push(`  *Bayar: ${formatRp(share.final)}*`, '')
  })

  lines.push(`*Total: ${formatRp(totals.perPerson.reduce((s, p) => s + p.final, 0))}*`)
  const saved = totals.appDiscount + totals.paymentDiscount + totals.cashback
  if (saved > 0) lines.push(`Total hemat: ${formatRp(saved)}`)
  return lines.join('\n')
}

export function whatsappUrl(bill: Bill, totals: BillTotals): string {
  return `https://wa.me/?text=${encodeURIComponent(whatsappText(bill, totals))}`
}
