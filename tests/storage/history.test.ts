// @vitest-environment jsdom
import { beforeEach, expect, test } from 'vitest'
import { deleteFromHistory, getHistory, saveToHistory, type HistoryEntry } from '@/lib/storage/history'
import { computeBill } from '@/lib/bill/compute'
import { initialBill } from '@/lib/bill/reducer'

const entry = (id: string): HistoryEntry => {
  const bill = { ...initialBill('umum'), id }
  return { bill, totals: computeBill(bill) }
}

beforeEach(() => localStorage.clear())

test('newest first, capped at 20, stored under the v2 key', () => {
  for (let i = 0; i < 22; i++) saveToHistory(entry(`b${i}`))
  const h = getHistory()
  expect(h).toHaveLength(20)
  expect(h[0].bill.id).toBe('b21')
  expect(localStorage.getItem('bilbil-history-v2')).not.toBeNull()
})

test('saving the same bill again replaces it instead of duplicating', () => {
  saveToHistory(entry('x'))
  saveToHistory(entry('x'))
  expect(getHistory()).toHaveLength(1)
})

test('delete by bill id', () => {
  saveToHistory(entry('a'))
  saveToHistory(entry('b'))
  deleteFromHistory('a')
  expect(getHistory().map((e) => e.bill.id)).toEqual(['b'])
})

test('malformed JSON gives empty history', () => {
  localStorage.setItem('bilbil-history-v2', 'oops')
  expect(getHistory()).toEqual([])
})
