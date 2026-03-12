'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BillResult } from '@/types'
import { getHistory, deleteFromHistory } from '@/lib/history'
import { getWhatsAppUrl } from '@/lib/whatsapp'
import HistoryCard from '@/components/HistoryCard'
import ResultCard from '@/components/ResultCard'
import {
  HiOutlineArrowLeft,
  HiOutlinePlus,
  HiOutlineInbox,
  HiOutlineClipboardDocumentList,
  HiOutlineXMark,
  HiOutlineReceiptPercent,
} from 'react-icons/hi2'
import { IoLogoWhatsapp } from 'react-icons/io5'

export default function HistoryPage() {
  const [history, setHistory] = useState<BillResult[]>([])
  const [selectedResult, setSelectedResult] = useState<BillResult | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setHistory(getHistory())
  }, [])

  const handleDelete = (id: string) => {
    deleteFromHistory(id)
    setHistory(getHistory())
    if (selectedResult?.id === id) setSelectedResult(null)
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-500 animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="w-full max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100 transition-colors p-1.5 rounded-lg hover:bg-white/5"
            >
              <HiOutlineArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-zinc-100 leading-tight">History</h1>
              <p className="text-[10px] sm:text-xs text-zinc-500 leading-tight">{history.length} saved {history.length === 1 ? 'bill' : 'bills'}</p>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-brand transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
          >
            <HiOutlinePlus className="w-4 h-4" />
            <span className="hidden sm:inline">New Bill</span>
          </Link>
        </div>
      </header>

      <main className="w-full max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {history.length === 0 ? (
          <div className="text-center py-16 sm:py-24 animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-zinc-800 flex items-center justify-center">
              <HiOutlineInbox className="w-8 h-8 text-zinc-500" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-300 mb-2">No history yet</h2>
            <p className="text-sm text-zinc-500 mb-6">Your saved split bills will appear here</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand text-white font-semibold text-sm hover:bg-orange-600 transition-all duration-200 shadow-lg shadow-brand/25"
            >
              <HiOutlineReceiptPercent className="w-4 h-4" />
              Start Splitting
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* History List */}
            <div className="space-y-3">
              {history.map((h) => (
                <HistoryCard
                  key={h.id}
                  result={h}
                  onDelete={handleDelete}
                  onView={setSelectedResult}
                />
              ))}
            </div>

            {/* Detail panel (desktop) */}
            <div className="hidden lg:block">
              {selectedResult ? (
                <div className="sticky top-20 space-y-4 animate-fade-in">
                  <div className="flex items-center gap-2 mb-2">
                    <HiOutlineClipboardDocumentList className="w-5 h-5 text-brand" />
                    <h3 className="text-base font-bold text-zinc-100">Breakdown Detail</h3>
                    <span className="text-xs text-zinc-500 font-mono ml-auto">
                      {new Date(selectedResult.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {selectedResult.results.map((r, i) => (
                      <ResultCard key={r.person.id} result={r} index={i} />
                    ))}
                  </div>
                  <div className="rounded-xl border border-brand/20 bg-brand/5 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-zinc-400">Total</p>
                        <p className="text-xl font-extrabold font-mono text-brand">
                          Rp{selectedResult.totalFinal.toLocaleString('id-ID')}
                        </p>
                      </div>
                      {selectedResult.totalSaved > 0 && (
                        <div className="text-right">
                          <p className="text-xs text-zinc-400">Saved</p>
                          <p className="text-base font-bold font-mono text-teal-400">
                            Rp{selectedResult.totalSaved.toLocaleString('id-ID')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Share via WhatsApp */}
                  <a
                    href={getWhatsAppUrl(selectedResult)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-emerald-600/20"
                  >
                    <IoLogoWhatsapp className="w-5 h-5" />
                    Share via WhatsApp
                  </a>
                </div>
              ) : (
                <div className="sticky top-20 pt-2">
                  <p className="text-sm text-zinc-500 flex items-center gap-2">
                    <HiOutlineClipboardDocumentList className="w-4 h-4 text-zinc-600" />
                    Select a bill to see the breakdown
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile detail modal */}
        {selectedResult && (
          <div className="lg:hidden fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-md overflow-y-auto">
            <div className="w-full max-w-screen-sm mx-auto px-4 py-6 pb-28">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-zinc-100">Full Breakdown</h3>
                  <p className="text-xs text-zinc-500 font-mono">
                    {new Date(selectedResult.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedResult(null)}
                  className="text-zinc-400 hover:text-zinc-100 p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <HiOutlineXMark className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {selectedResult.results.map((r, i) => (
                  <ResultCard key={r.person.id} result={r} index={i} />
                ))}
              </div>

              <div className="mt-6 rounded-xl border border-brand/20 bg-brand/5 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-zinc-400">Total</p>
                    <p className="text-xl font-extrabold font-mono text-brand">
                      Rp{selectedResult.totalFinal.toLocaleString('id-ID')}
                    </p>
                  </div>
                  {selectedResult.totalSaved > 0 && (
                    <div className="text-right">
                      <p className="text-xs text-zinc-400">Saved</p>
                      <p className="text-base font-bold font-mono text-teal-400">
                        Rp{selectedResult.totalSaved.toLocaleString('id-ID')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile: Share + Close */}
              <a
                href={getWhatsAppUrl(selectedResult)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all duration-200"
              >
                <IoLogoWhatsapp className="w-5 h-5" />
                Share via WhatsApp
              </a>

              <button
                onClick={() => setSelectedResult(null)}
                className="w-full mt-3 px-6 py-3 rounded-xl bg-zinc-800 text-zinc-300 font-semibold text-sm border border-zinc-700 hover:bg-zinc-700 transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="w-full max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-white/5 text-center">
        <p className="text-zinc-500 text-sm">
          &copy; {new Date().getFullYear()} Bayar Bareng. All rights reserved.
        </p>
        <p className="text-zinc-600 text-xs mt-1 font-medium">
          @aljasonch
        </p>
      </footer>
    </div>
  )
}
