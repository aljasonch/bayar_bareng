'use client'

import { useState } from 'react'
import MoneyInput from '@/components/ui/MoneyInput'
import PersonChip from '@/components/ui/PersonChip'
import Stepper from '@/components/ui/Stepper'
import { newId } from '@/lib/bill/reducer'
import type { FlowCtx } from '@/components/flow/SplitFlow'

/** Add an item by hand. Qty N adds N separate units so each can go to a different person. */
export default function ManualItemForm({ bill, dispatch }: Pick<FlowCtx, 'bill' | 'dispatch'>) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState(0)
  const [qty, setQty] = useState(1)
  const [assignees, setAssignees] = useState<string[]>([])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || price <= 0) return
    const valid = assignees.filter((a) => bill.people.some((p) => p.id === a))
    const items = Array.from({ length: qty }, () => ({ id: newId(), name: name.trim(), price, assignees: valid }))
    dispatch({ type: 'addItems', items })
    setName('')
    setPrice(0)
    setQty(1)
  }

  return (
    <form onSubmit={submit} className="card space-y-3 p-4">
      <div className="grid grid-cols-[1fr_8.5rem] gap-2">
        <input className="field" placeholder="Nama item" aria-label="Nama item" value={name} onChange={(e) => setName(e.target.value)} />
        <MoneyInput value={price} onChange={setPrice} placeholder="Harga satuan" aria-label="Harga satuan" />
      </div>
      {bill.people.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs text-muted">Untuk</span>
          {bill.people.map((p, i) => (
            <PersonChip
              key={p.id}
              name={p.name}
              index={i}
              showName
              selected={assignees.includes(p.id)}
              onClick={() => setAssignees(assignees.includes(p.id) ? assignees.filter((a) => a !== p.id) : [...assignees, p.id])}
            />
          ))}
        </div>
      )}
      <div className="flex items-center gap-2">
        <Stepper value={qty} onChange={setQty} label="Jumlah" />
        <button className="btn-primary flex-1" disabled={!name.trim() || price <= 0}>
          Tambah item
        </button>
      </div>
    </form>
  )
}
