// One-off: copy the Kopi Kenangan catalog from Supabase to Firestore and seed default promo combos.
// Usage:
//   node --env-file=.env scripts/migrate-supabase-to-firestore.mjs --dry-run
//   GOOGLE_APPLICATION_CREDENTIALS=service-account.json node --env-file=.env scripts/migrate-supabase-to-firestore.mjs
// Re-runnable: documents keep their Supabase ids, so a second run overwrites instead of duplicating.

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const dryRun = process.argv.includes('--dry-run')
if (!url || !key) throw new Error('Set SUPABASE_URL and SUPABASE_ANON_KEY (or the NEXT_PUBLIC_ variants).')

async function table(name) {
  const res = await fetch(`${url}/rest/v1/${name}?select=*`, { headers: { apikey: key, Authorization: `Bearer ${key}` } })
  if (!res.ok) throw new Error(`Supabase ${name}: ${res.status} ${await res.text()}`)
  return res.json()
}

const BLU = { kind: 'discountPct', pct: 40, max: 25000, minSpend: 50000 }
const DEFAULT_COMBOS = [
  { id: 'pickup', name: 'Pickup', orderType: 'pickup', sortOrder: 0, appPromo: { kind: 'cashbackPct', pct: 30, max: 30000 }, paymentPromo: BLU },
  { id: 'delivery-a', name: 'Delivery A', orderType: 'delivery', sortOrder: 1, appPromo: { kind: 'discountPct', pct: 25, max: 30000, minSpend: 85000 }, paymentPromo: BLU },
  { id: 'delivery-b', name: 'Delivery B', orderType: 'delivery', sortOrder: 2, appPromo: { kind: 'discountPct', pct: 35, max: 45000, minSpend: 100000 }, paymentPromo: BLU },
  { id: 'outlet', name: 'Order di outlet', orderType: 'outlet', sortOrder: 3, appPromo: { kind: 'discountPct', pct: 15, max: 10000, minSpend: 0 }, paymentPromo: BLU },
]

const [categories, menuItems, groups, modifiers, outletRows] = await Promise.all(
  ['categories', 'menu_items', 'modifier_groups', 'modifiers', 'outlet_config'].map(table),
)

const docs = {
  categories: categories.map((c) => ({ id: c.id, data: { name: c.name, sortOrder: c.sort_order ?? 0 } })),
  menuItems: menuItems.map((m) => {
    const prices = {}
    if (m.price_r != null) prices.R = m.price_r
    if (m.price_l != null) prices.L = m.price_l
    if (m.price_j != null) prices.J = m.price_j
    return {
      id: m.id,
      data: {
        name: m.name, categoryId: m.category_id, prices, sortOrder: m.sort_order ?? 0,
        hasOneLiter: !!m.has_one_liter, isBaristaChoice: !!m.is_barista_choice, isNew: !!m.is_new, isLimitedTime: !!m.is_limited_time,
      },
    }
  }),
  modifierGroups: groups.map((g) => ({
    id: g.id,
    data: {
      name: g.name,
      sortOrder: g.sort_order ?? 0,
      modifiers: modifiers
        .filter((mod) => mod.group_id === g.id)
        .map((mod) => ({ id: mod.id, name: mod.name, type: mod.type, price: mod.price, sortOrder: mod.sort_order ?? 0 })),
    },
  })),
}

const outlet = { mallAdjustment: 2000, availableSizes: ['R', 'L', 'J'] }
for (const row of outletRows) {
  if (row.key === 'mall_adjustment') outlet.mallAdjustment = Number(row.value) || 0
  if (row.key === 'available_sizes' && Array.isArray(row.value)) outlet.availableSizes = row.value
}

for (const [name, list] of Object.entries(docs)) console.log(`${name}: ${list.length}`)
console.log(`config/outlet: ${JSON.stringify(outlet)}`)
const orphans = modifiers.filter((mod) => !groups.some((g) => g.id === mod.group_id)).length
if (orphans) console.warn(`warning: ${orphans} modifiers have no group and were skipped`)

if (dryRun) console.log('dry run: nothing written')
else await write()

async function write() {
const { initializeApp, applicationDefault } = await import('firebase-admin/app')
const { getFirestore } = await import('firebase-admin/firestore')
initializeApp({ credential: applicationDefault() })
const db = getFirestore()

let batch = db.batch()
let pending = 0
async function put(path, data) {
  batch.set(db.doc(path), data)
  if (++pending === 450) {
    await batch.commit()
    batch = db.batch()
    pending = 0
  }
}

for (const [name, list] of Object.entries(docs)) for (const d of list) await put(`${name}/${d.id}`, d.data)
await put('config/outlet', outlet)

const existingCombos = await db.collection('promoCombos').limit(1).get()
if (existingCombos.empty) for (const { id, ...combo } of DEFAULT_COMBOS) await put(`promoCombos/${id}`, combo)
else console.log('promoCombos already present: not seeding defaults')

await batch.commit()
console.log('done')
}
