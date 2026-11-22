// @vitest-environment jsdom
import { beforeEach, expect, test } from 'vitest'
import { getProfiles, saveProfiles } from '@/lib/storage/profiles'

beforeEach(() => localStorage.clear())

test('round-trips profiles under the v1 key', () => {
  saveProfiles([{ id: 'a', name: 'Jason' }])
  expect(JSON.parse(localStorage.getItem('bilbil-people-profiles')!)).toEqual([{ id: 'a', name: 'Jason' }])
  expect(getProfiles()).toEqual([{ id: 'a', name: 'Jason' }])
})

test('malformed JSON gives an empty roster', () => {
  localStorage.setItem('bilbil-people-profiles', '{nope')
  expect(getProfiles()).toEqual([])
})

test('drops nameless entries and trims names', () => {
  localStorage.setItem('bilbil-people-profiles', JSON.stringify([{ id: 'a', name: '  Rina   Ayu ' }, { id: 'b', name: '' }, null, { name: 'Tono' }]))
  const got = getProfiles()
  expect(got.map((p) => p.name)).toEqual(['Rina Ayu', 'Tono'])
  expect(typeof got[1].id).toBe('string')
})
