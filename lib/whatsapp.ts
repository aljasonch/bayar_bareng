import { BillResult, PersonResult } from '@/types'

function formatRp(amount: number): string {
  return 'Rp' + amount.toLocaleString('id-ID')
}

export function generateWhatsAppText(result: BillResult): string {
  const lines: string[] = []
  lines.push('*Bayar Bareng - Split Bill*')
  lines.push(`${new Date(result.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`)
  lines.push('')

  result.results.forEach((r: PersonResult) => {
    lines.push(`*${r.person.name || 'Tanpa Nama'}*`)
    r.person.items.forEach((item) => {
      lines.push(`  - ${item.name || 'Item'}: ${formatRp(item.price)}`)
    })
    lines.push(`  Subtotal: ${formatRp(r.subtotal)}`)
    if (r.discountSaved > 0) lines.push(`  Diskon: -${formatRp(r.discountSaved)}`)
    if (r.deliveryShare > 0) lines.push(`  Ongkir: +${formatRp(r.deliveryShare)}`)
    if (r.additionalFeesShare > 0) lines.push(`  Biaya lain: +${formatRp(r.additionalFeesShare)}`)
    if (r.cashbackSaved > 0) lines.push(`  Cashback: -${formatRp(r.cashbackSaved)}`)
    lines.push(`  *Bayar: ${formatRp(r.final)}*`)
    lines.push('')
  })

  if (result.feeConfig.additionalFees.length > 0) {
    lines.push('*Biaya Tambahan:*')
    result.feeConfig.additionalFees.forEach((f) => {
      lines.push(`  - ${f.name}: ${formatRp(f.amount)}`)
    })
    lines.push('')
  }

  lines.push(`*Total: ${formatRp(result.totalFinal)}*`)
  if (result.totalSaved > 0) {
    lines.push(`Total hemat: ${formatRp(result.totalSaved)}`)
  }
  lines.push('')
  lines.push('_Dihitung pakai Bayar Bareng_')

  return lines.join('\n')
}

export function getWhatsAppUrl(result: BillResult): string {
  const text = generateWhatsAppText(result)
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}
