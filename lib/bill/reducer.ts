import type { AppPromo, Bill, BillItem, BillMode, Fees, Outlet, PaymentPromo, Person, PromoCombo } from '@/lib/types'

export type BillAction =
  | { type: 'addPerson'; person: Person }
  | { type: 'removePerson'; id: string }
  | { type: 'renamePerson'; id: string; name: string }
  | { type: 'addItems'; items: BillItem[] }
  | { type: 'updateItem'; item: BillItem }
  | { type: 'removeItem'; id: string }
  | { type: 'toggleAssignee'; itemId: string; personId: string }
  | { type: 'assignAll'; itemId: string }
  | { type: 'setFees'; fees: Fees }
  | { type: 'applyCombo'; combo: PromoCombo }
  | { type: 'setAppPromo'; promo: AppPromo }
  | { type: 'setPaymentPromo'; promo: PaymentPromo }
  | { type: 'setMeta'; date?: string; payerName?: string; payerAccount?: string; outlet?: Outlet }
  | { type: 'loadReceipt'; items: BillItem[]; fees: Fees; appPromo: AppPromo }
  | { type: 'reset' }

export function todayInputValue(now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

export function newId(): string {
  return crypto.randomUUID()
}

export function initialBill(mode: BillMode): Bill {
  return {
    id: newId(),
    createdAt: new Date().toISOString(),
    mode,
    outlet: 'normal',
    date: todayInputValue(),
    people: [],
    items: [],
    fees: { delivery: 0, others: [] },
    appPromo: { kind: 'none' },
    paymentPromo: { kind: 'none' },
  }
}

const mapItem = (bill: Bill, id: string, fn: (item: BillItem) => BillItem): Bill => ({
  ...bill,
  items: bill.items.map((item) => (item.id === id ? fn(item) : item)),
})

export function billReducer(bill: Bill, action: BillAction): Bill {
  switch (action.type) {
    case 'addPerson':
      return { ...bill, people: [...bill.people, action.person] }
    case 'removePerson':
      return {
        ...bill,
        people: bill.people.filter((p) => p.id !== action.id),
        items: bill.items.map((item) => ({ ...item, assignees: item.assignees.filter((a) => a !== action.id) })),
      }
    case 'renamePerson':
      return { ...bill, people: bill.people.map((p) => (p.id === action.id ? { ...p, name: action.name } : p)) }
    case 'addItems':
      return { ...bill, items: [...bill.items, ...action.items] }
    case 'updateItem':
      return mapItem(bill, action.item.id, () => action.item)
    case 'removeItem':
      return { ...bill, items: bill.items.filter((item) => item.id !== action.id) }
    case 'toggleAssignee':
      return mapItem(bill, action.itemId, (item) => ({
        ...item,
        assignees: item.assignees.includes(action.personId)
          ? item.assignees.filter((a) => a !== action.personId)
          : [...item.assignees, action.personId],
      }))
    case 'assignAll':
      return mapItem(bill, action.itemId, (item) => ({ ...item, assignees: bill.people.map((p) => p.id) }))
    case 'setFees':
      return { ...bill, fees: action.fees }
    case 'applyCombo':
      return { ...bill, appPromo: action.combo.appPromo, paymentPromo: action.combo.paymentPromo, comboId: action.combo.id }
    case 'setAppPromo':
      return { ...bill, appPromo: action.promo, comboId: undefined }
    case 'setPaymentPromo':
      return { ...bill, paymentPromo: action.promo, comboId: undefined }
    case 'setMeta': {
      const { date = bill.date, payerName = bill.payerName, payerAccount = bill.payerAccount, outlet = bill.outlet } = action
      return { ...bill, date, payerName, payerAccount, outlet }
    }
    case 'loadReceipt':
      return { ...bill, items: action.items, fees: action.fees, appPromo: action.appPromo, comboId: undefined }
    case 'reset':
      return initialBill(bill.mode)
  }
}
