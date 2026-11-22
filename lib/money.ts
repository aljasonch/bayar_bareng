const fmt = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 })

export function formatRp(n: number): string {
  const s = `Rp ${fmt.format(Math.abs(Math.round(n)))}`
  return n < 0 ? `-${s}` : s
}
