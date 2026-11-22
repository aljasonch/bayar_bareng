import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, beforeEach, test } from 'vitest'
import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { doc, getDoc, setDoc } from 'firebase/firestore'

let env: RulesTestEnvironment

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-bilbil',
    firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 },
  })
})
beforeEach(async () => {
  await env.clearFirestore()
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), 'admins/admin-uid'), { email: 'admin@test' })
    await setDoc(doc(ctx.firestore(), 'menuItems/m1'), { name: 'Mantan' })
  })
})
afterAll(async () => env?.cleanup())

test('anyone can read the menu', async () => {
  await assertSucceeds(getDoc(doc(env.unauthenticatedContext().firestore(), 'menuItems/m1')))
})

test('unauthenticated write fails', async () => {
  await assertFails(setDoc(doc(env.unauthenticatedContext().firestore(), 'menuItems/m2'), { name: 'x' }))
})

test('signed-in non-admin cannot write', async () => {
  await assertFails(setDoc(doc(env.authenticatedContext('someone').firestore(), 'menuItems/m2'), { name: 'x' }))
})

test('admin can write', async () => {
  await assertSucceeds(setDoc(doc(env.authenticatedContext('admin-uid').firestore(), 'promoCombos/c1'), { name: 'Pickup' }))
})

test('non-admin cannot make themselves admin', async () => {
  await assertFails(setDoc(doc(env.authenticatedContext('someone').firestore(), 'admins/someone'), { email: 'x' }))
})

test('admins list is not public', async () => {
  await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(), 'admins/admin-uid')))
})
