'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BillResult } from '@/types'
import { formatBillDate } from '@/lib/date'
import { getHistory, deleteFromHistory } from '@/lib/history'
import { getWhatsAppUrl } from '@/lib/whatsapp'
import { formatOutletName } from '@/lib/kopi-kenangan'
import HistoryCard from '@/components/HistoryCard'
import ResultCard from '@/components/ResultCard'
import SplitDistributionBar from '@/components/SplitDistributionBar'
import { IoLogoWhatsapp, IoArrowBack, IoAddOutline, IoClose } from 'react-icons/io5'

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
    setHistory(getHistory())
    if (selectedResult?.id === id) setSelectedResult(null)
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#8B83B8] animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen lg:flex">
      {/* Desktop rail */}
      <aside className="hidden lg:flex flex-col w-72 shrink-0 bg-sidebar text-white sticky top-0 h-screen px-5 py-6">
        <div className="flex items-center gap-3 px-1">
          <div className="h-10 w-10 rounded-xl bg-white text-sidebar flex items-center justify-center font-mono font-black text-lg">
            B
          </div>
          <div>
            <h1 className="text-base font-extrabold leading-tight">Bayar Bareng</h1>
            <p className="text-[11px] text-white/50 leading-tight">Split bill workspace</p>
          </div>
        </div>

        <div className="mt-9">
          <p className="px-1 mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
            History
          </p>
          <div className="rounded-2xl bg-sidebarHi/70 border border-white/10 p-4">
            <p className="font-mono text-3xl font-extrabold">{history.length}</p>
            <p className="text-xs text-white/50 mt-0.5">saved {history.length === 1 ? 'bill' : 'bills'}</p>
          </div>
        </div>

        <Link
          href="/"
          className="mt-auto flex items-center justify-center gap-2 rounded-xl px-4 py-3 bg-white text-sidebar text-sm font-bold transition-all hover:bg-white/90"
        >
          <IoAddOutline className="w-4 h-4" />
          New bill
        </Link>
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden border-b border-[#E6E2F7] bg-paper/90 backdrop-blur-md sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              className="h-8 w-8 rounded-lg border border-[#E0DCF2] bg-white flex items-center justify-center text-accent"
            >
              <IoArrowBack className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-sm font-extrabold text-ink leading-tight">History</h1>
              <p className="text-[10px] text-[#8B83B8] leading-tight">
                {history.length} saved {history.length === 1 ? 'bill' : 'bills'}
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-medium text-white px-3 py-2 rounded-lg bg-accent"
          >
            <IoAddOutline className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Work area */}
      <div className="flex-1 min-w-0">
        <main className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
          <div className="hidden lg:block mb-6">
            <h2 className="text-2xl font-extrabold text-ink tracking-tight">Saved bills</h2>
            <p className="text-sm text-[#8B83B8] mt-0.5">Tap a bill to see the full breakdown</p>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-16 sm:py-24 animate-fade-in">
              <h2 className="text-lg sm:text-xl font-bold text-ink mb-2">No history yet</h2>
              <p className="text-sm text-[#8B83B8] mb-6">Your saved split bills will appear here</p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accentDark transition-all"
              >
                Start splitting
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(22rem,0.8fr)_minmax(0,1.2fr)] gap-5">
              {/* History list */}
              <div className="space-y-3">
                {history.map((h) => (
                  <HistoryCard
                    key={h.id}
                    result={h}
                    onDelete={handleDelete}
                    onView={setSelectedResult}
                    active={selectedResult?.id === h.id}
                  />
                ))}
              </div>

              {/* Detail panel (desktop) */}
              <div className="hidden xl:block">
                {selectedResult ? (
                  <div className="sticky top-8 space-y-4 animate-fade-in">
                    <div className="rounded-2xl bg-sidebar text-white p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs text-white/50 uppercase tracking-wider font-semibold">Total</p>
                          <p className="text-3xl font-extrabold font-mono mt-1">
                            Rp{selectedResult.totalFinal.toLocaleString('id-ID')}
                          </p>
                        </div>
                        <span className="text-xs text-white/50 font-mono">
                          {formatBillDate(selectedResult, { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      {selectedResult.totalSaved > 0 && (
                        <p className="text-sm text-white/70 mt-3">
                          Saved{' '}
                          <span className="font-mono font-bold text-white">
                            Rp{selectedResult.totalSaved.toLocaleString('id-ID')}
                          </span>
                        </p>
                      )}
                      {selectedResult.payerName && (
                        <p className="text-xs text-white/60 mt-3">
                          Ditalangi oleh <span className="font-semibold text-white">{selectedResult.payerName}</span>
                          {selectedResult.payerAccountNumber && (
                            <span className="block mt-0.5">No. Rek: {selectedResult.payerAccountNumber}</span>
                          )}
                        </p>
                      )}
                      {selectedResult.billMode === 'kopiKenangan' && (
                        <p className="text-xs text-white/60 mt-2">
                          Store: <span className="font-semibold text-white">Kopi Kenangan</span>
                          {selectedResult.kopiKenanganOutlet && (
                            <span> - {formatOutletName(selectedResult.kopiKenanganOutlet)}</span>
                          )}
                        </p>
                      )}
                    </div>

                    <SplitDistributionBar results={selectedResult.results} total={selectedResult.totalFinal} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedResult.results.map((r, i) => (
                        <ResultCard key={r.person.id} result={r} index={i} grandTotal={selectedResult.totalFinal} />
                      ))}
                    </div>

                    <a
                      href={getWhatsAppUrl(selectedResult)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition-all"
                    >
                      <IoLogoWhatsapp className="w-5 h-5" />
                      Share via WhatsApp
                    </a>
                  </div>
                ) : (
                  <div className="sticky top-8 card p-10 text-center">
                    <p className="text-sm text-[#8B83B8]">Select a bill to see the breakdown</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile detail modal */}
      {selectedResult && (
        <div className="xl:hidden fixed inset-0 z-50 bg-paper/95 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-screen-sm mx-auto px-4 py-6 pb-28">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-ink">Full breakdown</h3>
                <p className="text-xs text-[#8B83B8] font-mono">
                  {formatBillDate(selectedResult, { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <button
                onClick={() => setSelectedResult(null)}
                className="text-muted hover:text-ink p-2 rounded-lg hover:bg-accentSoft transition-colors"
              >
                <IoClose className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl bg-sidebar text-white p-5 mb-4">
              <p className="text-xs text-white/50 uppercase tracking-wider font-semibold">Total</p>
              <p className="text-3xl font-extrabold font-mono mt-1">
                Rp{selectedResult.totalFinal.toLocaleString('id-ID')}
              </p>
              {selectedResult.totalSaved > 0 && (
                <p className="text-sm text-white/70 mt-2">
                  Saved{' '}
                  <span className="font-mono font-bold text-white">
                    Rp{selectedResult.totalSaved.toLocaleString('id-ID')}
                  </span>
                </p>
              )}
            </div>

            <div className="mb-4">
              <SplitDistributionBar results={selectedResult.results} total={selectedResult.totalFinal} />
            </div>

            <div className="space-y-3">
              {selectedResult.results.map((r, i) => (
                <ResultCard key={r.person.id} result={r} index={i} grandTotal={selectedResult.totalFinal} />
              ))}
            </div>

            <a
              href={getWhatsAppUrl(selectedResult)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition-all"
            >
              <IoLogoWhatsapp className="w-5 h-5" />
              Share via WhatsApp
            </a>

            <button
              onClick={() => setSelectedResult(null)}
              className="w-full mt-3 px-6 py-3 rounded-xl bg-white text-ink3 font-semibold text-sm border border-[#E0DCF2] hover:bg-accentSoft transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
