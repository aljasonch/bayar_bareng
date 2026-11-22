import { expect, test } from 'vitest'
import { formatRp } from '@/lib/money'

test('formats rupiah with id-ID grouping and no decimals', () => {
  expect(formatRp(51500)).toBe('Rp 51.500')
  expect(formatRp(0)).toBe('Rp 0')
  expect(formatRp(-25000)).toBe('-Rp 25.000')
})
