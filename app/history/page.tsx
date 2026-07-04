'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BillResult } from '@/types'
import { formatBillDate } from '@/lib/date'
import { deleteFromHistory, getHistory } from '@/lib/history'
import { formatOutletName } from '@/lib/kopi-kenangan'
import { formatRp } from '@/lib/item-display'
import HistoryCard from '@/components/HistoryCard'
import ResultCard from '@/components/ResultCard'
import SplitDistributionBar from '@/components/SplitDistributionBar'
import WhatsAppActions from '@/components/WhatsAppActions'
import { IoClose } from 'react-icons/io5'

function HistoryDetail({ result }: { result: BillResult }) {
  return (
    <div className="animate-fade-in space-y-4">
      {/* The saved receipt, reprinted. */}
      <div className="receipt-frame">
        <section className="receipt px-5 pt-5">
          <div className="text-center">
            <p className="font-mono text-sm font-bold uppercase tracking-[0.2em] text-ink">Bayar Bareng</p>
            <p className="mt-1 font-mono text-xs text-muted">nota tersimpan</p>
          </div>

          <div className="perforation mt-4 space-y-1 pt-3 font-mono text-xs text-muted">
            <div className="flex justify-between gap-2">
              <span>TANGGAL</span>
              <span className="text-ink2">
                {formatBillDate(result, { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            {result.billMode === 'kopiKenangan' && (
              <div className="flex justify-between gap-2">
                <span>STORE</span>
                <span className="text-ink2">
                  Kopi Kenangan · {formatOutletName(result.kopiKenanganOutlet)}
                </span>
              </div>
            )}
            {result.payerName && (
              <div className="flex justify-between gap-2">
                <span>DITALANGI</span>
                <span className="text-ink2">
                  {result.payerName}
                  {result.payerAccountNumber ? ` · ${result.payerAccountNumber}` : ''}
                </span>
              </div>
            )}
          </div>

          <div className="perforation mt-3 space-y-2 pt-3">
            {result.results.map((item, index) => (
              <div key={item.person.id} className="flex items-baseline font-mono text-sm">
                <span className="truncate text-ink2">{item.person.name || `Orang ${index + 1}`}</span>
                <span className="dots" aria-hidden />
                <span className="shrink-0 font-semibold text-ink">{formatRp(item.final)}</span>
              </div>
            ))}
          </div>

          <div className="rule-total mt-4 pt-3">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-ink">Total</span>
              <span className="font-mono text-3xl font-bold tracking-tight text-ink">
                {formatRp(result.totalFinal)}
              </span>
            </div>
            {result.totalSaved > 0 && (
              <div className="mt-1 flex items-baseline justify-between gap-3 font-mono text-xs">
                <span className="text-muted">hemat</span>
                <span className="font-semibold text-stamp">-{formatRp(result.totalSaved)}</span>
              </div>
            )}
          </div>

          <p className="pb-4 pt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
            {result.people.length} orang · dihitung otomatis
          </p>
        </section>
      </div>

      <WhatsAppActions result={result} />

      <SplitDistributionBar results={result.results} total={result.totalFinal} />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {result.results.map((item, index) => (
          <ResultCard key={item.person.id} result={item} index={index} grandTotal={result.totalFinal} />
        ))}
      </div>
    </div>
  )
}

export default function HistoryPage() {
  const [history, setHistory] = useState<BillResult[]>([])
  const [selectedResult, setSelectedResult] = useState<BillResult | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setMounted(true)
      setHistory(getHistory())
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [])

  const handleDelete = (id: string) => {
    deleteFromHistory(id)
    const entries = getHistory()
    setHistory(entries)
    if (selectedResult?.id === id) setSelectedResult(entries[0] ?? null)
  }

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="card px-5 py-4 font-mono text-sm text-muted">Memuat riwayat…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1440px]">
        <header className="flex items-baseline justify-between gap-4 border-b border-rule pb-4">
          <div>
            <h1 className="font-mono text-lg font-bold uppercase tracking-[0.14em] text-ink">Riwayat</h1>
            <p className="mt-0.5 text-sm text-muted">
              {history.length > 0
                ? `${history.length} nota tersimpan di browser ini.`
                : 'Nota yang kamu simpan muncul di sini.'}
            </p>
          </div>
          <Link href="/" className="button-primary shrink-0">
            + Nota baru
          </Link>
        </header>

        <main className="py-5">
          {history.length === 0 ? (
            <div className="animate-fade-in rounded-sm border border-dashed border-rule2 bg-paper/60 p-10 text-center">
              <h2 className="text-lg font-semibold text-ink">Belum ada nota tersimpan</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted">
                Hitung satu patungan dulu, lalu tekan “Simpan ke riwayat” di halaman hasil.
              </p>
              <Link href="/" className="button-primary mt-6">
                Mulai nota baru
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(22rem,0.75fr)_minmax(0,1.25fr)]">
              <div className="space-y-3">
                {history.map((item) => (
                  <HistoryCard
                    key={item.id}
                    result={item}
                    onDelete={handleDelete}
                    onView={setSelectedResult}
                    active={selectedResult?.id === item.id}
                  />
                ))}
              </div>

              <div className="hidden xl:block">
                <div className="sticky top-5">
                  {selectedResult ? (
                    <HistoryDetail result={selectedResult} />
                  ) : (
                    <div className="rounded-sm border border-dashed border-rule2 bg-paper/60 p-10 text-center text-sm text-muted">
                      Pilih nota di kiri untuk melihat rinciannya.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {selectedResult && history.length > 0 && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-counter/95 px-4 py-5 backdrop-blur-sm xl:hidden">
          <div className="mx-auto max-w-screen-md pb-12">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="label">Rincian nota</p>
                <h2 className="mt-1 text-lg font-semibold text-ink">
                  {formatBillDate(selectedResult, { day: 'numeric', month: 'long', year: 'numeric' })}
                </h2>
              </div>
              <button type="button" onClick={() => setSelectedResult(null)} className="icon-button bg-paper">
                <IoClose className="h-5 w-5" />
              </button>
            </div>
            <HistoryDetail result={selectedResult} />
            <button type="button" onClick={() => setSelectedResult(null)} className="button-secondary mt-4 w-full">
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
