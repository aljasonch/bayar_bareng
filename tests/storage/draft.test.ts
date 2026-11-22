// @vitest-environment jsdom
import { beforeEach, expect, test } from 'vitest'
import { clearDraft, loadDraft, saveDraft } from '@/lib/storage/draft'
import { initialBill } from '@/lib/bill/reducer'

beforeEach(() => sessionStorage.clear())

test('round-trips the bill and step per mode', () => {
  const bill = { ...initialBill('kopken'), people: [{ id: 'A', name: 'Jason' }] }
  saveDraft({ bill, step: 'promo' })
  expect(loadDraft('kopken')).toEqual({ bill, step: 'promo' })
  expect(loadDraft('umum')).toBeNull()
})

test('malformed or wrong-mode drafts are ignored', () => {
  sessionStorage.setItem('bilbil-draft-kopken', '{oops')
  expect(loadDraft('kopken')).toBeNull()
  sessionStorage.setItem('bilbil-draft-kopken', JSON.stringify({ bill: { ...initialBill('umum') }, step: 'items' }))
  expect(loadDraft('kopken')).toBeNull()
})

test('clearDraft removes it', () => {
  saveDraft({ bill: initialBill('umum'), step: 'items' })
  clearDraft('umum')
  expect(loadDraft('umum')).toBeNull()
})
