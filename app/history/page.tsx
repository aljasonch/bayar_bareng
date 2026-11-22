'use client'

import { useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronDown, Trash2 } from 'lucide-react'
import ResultView from '@/components/flow/ResultView'
import { deleteFromHistory, getHistory, type HistoryEntry } from '@/lib/storage/history'
import { formatBillDate } from '@/lib/bill/whatsapp'
import { formatRp } from '@/lib/money'

const noop = () => () => {}

export default function HistoryPage() {
  const mounted = useSyncExternalStore(noop, () => true, () => false)
  const [entries, setEntries] = useState<HistoryEntry[] | null>(null)
  const [open, setOpen] = useState<string | null>(null)
  const list = entries ?? (mounted ? getHistory() : [])

  return (
    <div className="px-5 pb-12 pt-5">
      <div className="mx-auto max-w-lg">
        <div className="flex items-center gap-2">
          <Link href="/" className="-ml-2 rounded-full p-2 text-muted hover:text-ink" aria-label="Kembali ke beranda">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-lg font-semibold">Riwayat</h1>
        </div>

        {mounted && list.length === 0 && (
          <div className="mt-16 text-center">
            <p className="font-medium">Belum ada tagihan tersimpan</p>
            <p className="mt-1 text-sm text-muted">Tekan &quot;Simpan ke riwayat&quot; di halaman tagihan untuk menyimpannya di sini.</p>
            <Link href="/" className="btn-primary mt-5">Buat tagihan</Link>
          </div>
        )}

        <ul className="mt-5 space-y-3">
          {list.map(({ bill, totals }) => {
            const isOpen = open === bill.id
            const sum = totals.perPerson.reduce((s, p) => s + p.final, 0)
            return (
              <li key={bill.id} data-theme={bill.mode === 'kopken' ? 'kopken' : undefined}>
                <div className="card">
                  <button type="button" className="flex w-full items-center gap-3 p-4 text-left" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : bill.id)}>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{bill.mode === 'kopken' ? 'Kopi Kenangan' : 'Nota umum'}</span>
                      <span className="block text-sm text-muted">
                        {formatBillDate(bill.date)} · {bill.people.length} orang
                      </span>
                    </span>
                    <span className="num font-semibold">{formatRp(sum)}</span>
                    <ChevronDown size={18} className={`text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="border-t border-line p-4">
                      <ResultView bill={bill} totals={totals} />
                      <button
                        type="button"
                        className="btn-ghost mt-3 w-full text-danger"
                        onClick={() => {
                          deleteFromHistory(bill.id)
                          setEntries(getHistory())
                        }}
                      >
                        <Trash2 size={16} /> Hapus dari riwayat
                      </button>
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
