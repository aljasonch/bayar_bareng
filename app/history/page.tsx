'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BillResult } from '@/types'
import { formatBillDate } from '@/lib/date'
import { deleteFromHistory, getHistory } from '@/lib/history'
import { getWhatsAppUrl } from '@/lib/whatsapp'
import { formatOutletName } from '@/lib/kopi-kenangan'
import { formatRp } from '@/lib/item-display'
import HistoryCard from '@/components/HistoryCard'
import ResultCard from '@/components/ResultCard'
import SplitDistributionBar from '@/components/SplitDistributionBar'
import { IoAddOutline, IoArrowBack, IoClose, IoLogoWhatsapp } from 'react-icons/io5'

function HistoryDetail({ result }: { result: BillResult }) {
  return (
    <div className="space-y-4 animate-fade-in">
      <section className="rounded-[1.75rem] bg-ink p-5 text-white shadow-pop">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">Saved bill</p>
            <p className="mt-2 font-mono text-3xl font-semibold tracking-tight">{formatRp(result.totalFinal)}</p>
          </div>
          <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-white/60">
            {formatBillDate(result, { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-white/50">People</p>
            <p className="mt-1 font-mono text-lg font-semibold">{result.people.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-white/50">Saved</p>
            <p className="mt-1 font-mono text-lg font-semibold">{formatRp(result.totalSaved)}</p>
          </div>
        </div>

        {result.payerName && (
          <p className="mt-4 text-xs text-white/65">
            Fronted by <span className="font-semibold text-white">{result.payerName}</span>
            {result.payerAccountNumber ? `, ${result.payerAccountNumber}` : ''}
          </p>
        )}
        {result.billMode === 'kopiKenangan' && (
          <p className="mt-2 text-xs text-white/65">
            Kopi Kenangan, {formatOutletName(result.kopiKenanganOutlet)} outlet
          </p>
        )}
      </section>

      <SplitDistributionBar results={result.results} total={result.totalFinal} />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {result.results.map((item, index) => (
          <ResultCard key={item.person.id} result={item} index={index} grandTotal={result.totalFinal} />
        ))}
      </div>

      <a
        href={getWhatsAppUrl(result)}
        target="_blank"
        rel="noopener noreferrer"
        className="button-primary w-full bg-whatsapp hover:bg-whatsappDark"
      >
        <IoLogoWhatsapp className="h-5 w-5" />
        Share via WhatsApp
      </a>
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
        <div className="card px-5 py-4 text-sm text-muted">Loading saved bills...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1440px]">
        <header className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex h-11 w-11 items-center justify-center rounded-2xl border border-line2 bg-white text-ink transition-colors hover:border-ink/25">
              <IoArrowBack className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-ink">History</h1>
              <p className="text-sm text-muted">Review saved settlements and share them again.</p>
            </div>
          </div>
          <Link href="/" className="button-primary">
            <IoAddOutline className="h-4 w-4" />
            New bill
          </Link>
        </header>

        <section className="mt-6 sheet p-4 sm:p-5 lg:p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_18rem] md:items-end">
            <div>
              <p className="label">Saved workspace</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-ink sm:text-4xl">
                Bills you have already settled.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted sm:text-base">
                History is stored in this browser, matching the profile roster and current local-only workflow.
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-white/75 px-4 py-3">
              <p className="label">Total saved</p>
              <p className="mt-1 font-mono text-3xl font-semibold text-ink">{history.length}</p>
              <p className="mt-1 text-xs text-muted">{history.length === 1 ? 'bill' : 'bills'} in history</p>
            </div>
          </div>
        </section>

        <main className="py-5">
          {history.length === 0 ? (
            <div className="card p-10 text-center animate-fade-in">
              <h2 className="text-lg font-semibold text-ink">No saved bills yet</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted">
                Save a result after calculating a split, then it will appear here.
              </p>
              <Link href="/" className="button-primary mt-6">
                Start a bill
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
                    <div className="card p-10 text-center text-sm text-muted">Select a bill to inspect it.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {selectedResult && history.length > 0 && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-paper/95 px-4 py-5 backdrop-blur-md xl:hidden">
          <div className="mx-auto max-w-screen-md pb-12">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="label">Full breakdown</p>
                <h2 className="mt-1 text-lg font-semibold text-ink">
                  {formatBillDate(selectedResult, { day: 'numeric', month: 'long', year: 'numeric' })}
                </h2>
              </div>
              <button type="button" onClick={() => setSelectedResult(null)} className="icon-button bg-white">
                <IoClose className="h-5 w-5" />
              </button>
            </div>
            <HistoryDetail result={selectedResult} />
            <button type="button" onClick={() => setSelectedResult(null)} className="button-secondary mt-4 w-full">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
