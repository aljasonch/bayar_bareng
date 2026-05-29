'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Person, FeeConfig, BillResult, BillMode, KopiKenanganOutlet } from '@/types'
import { calculateBill } from '@/lib/calculate'
import { formatBillDate, getTodayDateInputValue } from '@/lib/date'
import { saveToHistory } from '@/lib/history'
import { getWhatsAppUrl } from '@/lib/whatsapp'
import { formatOutletName } from '@/lib/kopi-kenangan'
import PersonCard from '@/components/PersonCard'
import FeeSettings from '@/components/FeeSettings'
import AdditionalFees from '@/components/AdditionalFees'
import ResultCard from '@/components/ResultCard'
import LivePreview from '@/components/LivePreview'
import KopiKenanganOrder from '@/components/KopiKenanganOrder'
import { IoCafeOutline, IoLogoWhatsapp, IoReceiptOutline } from 'react-icons/io5'

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

const STEPS = [
  { num: 1, label: 'People & Items' },
  { num: 2, label: 'Fees & Discounts' },
  { num: 3, label: 'Results' },
]

export default function Home() {
  const [step, setStep] = useState(1)
  const [people, setPeople] = useState<Person[]>([
    { id: generateId(), name: '', items: [{ id: generateId(), name: '', price: 0 }] },
    { id: generateId(), name: '', items: [{ id: generateId(), name: '', price: 0 }] },
  ])
  const [feeConfig, setFeeConfig] = useState<FeeConfig>({
    discountPct: 0,
    discountMax: 0,
    deliveryFee: 0,
    additionalFees: [],
    cashbackPct: 0,
    cashbackMax: 0,
    cashbackBase: 'totalPayment',
  })
  const [splitDate, setSplitDate] = useState<string>(() => getTodayDateInputValue())
  const [billMode, setBillMode] = useState<BillMode>('general')
  const [kopiKenanganOutlet, setKopiKenanganOutlet] = useState<KopiKenanganOutlet>('normal')
  const [payerName, setPayerName] = useState('')
  const [payerAccountNumber, setPayerAccountNumber] = useState('')
  const [result, setResult] = useState<BillResult | null>(null)
  const [saved, setSaved] = useState(false)

  const addPerson = () => {
    setPeople([
      ...people,
      { id: generateId(), name: '', items: [{ id: generateId(), name: '', price: 0 }] },
    ])
  }

  const updatePerson = useCallback((index: number, person: Person) => {
    setPeople((prev) => prev.map((p, i) => (i === index ? person : p)))
  }, [])

  const removePerson = useCallback((index: number) => {
    setPeople((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleCalculate = () => {
    const billResult = calculateBill(
      people,
      feeConfig,
      splitDate,
      payerName,
      payerAccountNumber,
      billMode,
      billMode === 'kopiKenangan' ? kopiKenanganOutlet : undefined
    )
    setResult(billResult)
    setStep(3)
    setSaved(false)
  }

  const handleSave = () => {
    if (result) {
      saveToHistory(result)
      setSaved(true)
    }
  }

  const handleReset = () => {
    setPeople([
      { id: generateId(), name: '', items: [{ id: generateId(), name: '', price: 0 }] },
      { id: generateId(), name: '', items: [{ id: generateId(), name: '', price: 0 }] },
    ])
    setFeeConfig({
      discountPct: 0,
      discountMax: 0,
      deliveryFee: 0,
      additionalFees: [],
      cashbackPct: 0,
      cashbackMax: 0,
      cashbackBase: 'totalPayment',
    })
    setBillMode('general')
    setKopiKenanganOutlet('normal')
    setSplitDate(getTodayDateInputValue())
    setPayerName('')
    setPayerAccountNumber('')
    setResult(null)
    setStep(1)
    setSaved(false)
  }

  const canProceedStep1 = people.some((p) => p.items.some((i) => i.price > 0))
  const hasPayerName = payerName.trim().length > 0
  const pageMaxWidth = billMode === 'kopiKenangan' || step === 3 ? 'max-w-screen-2xl' : 'max-w-screen-xl'

  return (
    <div className="min-h-screen bg-[#08090b] text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800/80 bg-[#08090b]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className={`w-full ${pageMaxWidth} mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-brand text-white flex items-center justify-center font-mono font-black shadow-lg shadow-brand/20">
              B
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-zinc-100 leading-tight">Bayar Bareng</h1>
              <p className="text-xs text-zinc-500 leading-tight">Split bill workspace</p>
            </div>
          </div>
          <Link
            href="/history"
            className="flex items-center gap-1.5 text-sm text-zinc-300 hover:text-white transition-colors px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-brand/50"
          >
            <span className="hidden sm:inline">History</span>
          </Link>
        </div>
      </header>

      <main className={`w-full ${pageMaxWidth} mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 pb-28 lg:pb-10`}>
        {/* Step Navigation */}
        <div className="mb-5 sm:mb-6 rounded-lg border border-zinc-800 bg-zinc-950/70 p-1.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-1 overflow-x-auto">
          {STEPS.map((s, i) => {
            return (
              <div key={s.num} className="flex items-center">
                <button
                  onClick={() => {
                    if (s.num < step || (s.num === 3 && result)) setStep(s.num)
                  }}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                    step === s.num
                      ? 'bg-brand text-white shadow-lg shadow-brand/20'
                      : step > s.num
                      ? 'bg-brand/10 text-brand'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <span className="font-mono">{s.num}</span>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`hidden sm:block w-5 h-px mx-1 ${step > s.num ? 'bg-brand/50' : 'bg-zinc-800'}`} />
                )}
              </div>
            )
          })}
          </div>
          <div className="hidden lg:flex items-center gap-2 text-xs text-zinc-500 pr-2">
            <span className="font-mono text-zinc-300">{people.length}</span>
            <span>people</span>
            <span className="h-1 w-1 rounded-full bg-zinc-700" />
            <span className="font-mono text-zinc-300">
              Rp{people.reduce((sum, person) => sum + person.items.reduce((itemSum, item) => itemSum + item.price, 0), 0).toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        <div className={step === 3 ? 'block' : 'grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_22rem] gap-5'}>
          {/* Main Content */}
          <div>
            {/* Step 1: People & Items */}
            {step === 1 && (
              <div className="animate-fade-in">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-100">Order Builder</h2>
                    <p className="text-sm text-zinc-500 mt-0.5">
                      {billMode === 'kopiKenangan' ? 'Kopi Kenangan catalog split' : 'Manual split bill'}
                    </p>
                  </div>
                  {billMode === 'general' && (
                    <button
                      onClick={addPerson}
                      className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-brand text-white text-xs sm:text-sm font-semibold hover:bg-orange-600 transition-all duration-200 shadow-lg shadow-brand/20"
                    >
                      + Add Person
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-3 sm:p-4">
                    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-3">
                      <div>
                        <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-2">
                          Split Mode
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setBillMode('general')}
                        className={`min-h-16 rounded-lg border p-3 text-left transition-all duration-200 ${
                          billMode === 'general'
                            ? 'bg-brand text-white border-brand shadow-lg shadow-brand/20'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-100 hover:border-brand/40'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <IoReceiptOutline className="w-5 h-5 flex-shrink-0" />
                          <span className="text-sm font-extrabold">General Bill</span>
                        </div>
                        <p className="text-xs mt-1 opacity-75">Manual items</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setBillMode('kopiKenangan')}
                        className={`min-h-16 rounded-lg border p-3 text-left transition-all duration-200 ${
                          billMode === 'kopiKenangan'
                            ? 'bg-brand text-white border-brand shadow-lg shadow-brand/20'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-100 hover:border-brand/40'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <IoCafeOutline className="w-5 h-5 flex-shrink-0" />
                          <span className="text-sm font-extrabold">Store Kopi Kenangan</span>
                        </div>
                        <p className="text-xs mt-1 opacity-75">Catalog order</p>
                      </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <label htmlFor="split-date" className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
                              Split Date
                            </label>
                          </div>
                          <input
                            id="split-date"
                            type="date"
                            value={splitDate}
                            onChange={(e) => setSplitDate(e.target.value)}
                            className="w-full bg-zinc-900 rounded-lg px-3 py-2.5 text-sm font-mono text-zinc-100 outline-none border border-zinc-800 focus:border-brand/60 transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="payer-name" className="text-xs text-zinc-400 font-semibold uppercase tracking-wider block">
                            Talangan
                          </label>
                          <input
                            id="payer-name"
                            type="text"
                            value={payerName}
                            onChange={(e) => setPayerName(e.target.value)}
                            placeholder="Nama"
                            className="w-full bg-zinc-900 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none border border-zinc-800 focus:border-brand/60 transition-colors"
                          />
                          <input
                            id="payer-account-number"
                            type="text"
                            value={payerAccountNumber}
                            onChange={(e) => setPayerAccountNumber(e.target.value)}
                            placeholder="No rekening"
                            disabled={!hasPayerName}
                            className="w-full bg-zinc-900 rounded-lg px-3 py-2.5 text-sm font-mono text-zinc-100 placeholder:text-zinc-600 outline-none border border-zinc-800 focus:border-brand/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {billMode === 'general' ? (
                    people.map((person, i) => (
                      <PersonCard
                        key={person.id}
                        person={person}
                        index={i}
                        onUpdate={(p) => updatePerson(i, p)}
                        onRemove={() => removePerson(i)}
                        canRemove={people.length > 1}
                      />
                    ))
                  ) : (
                    <KopiKenanganOrder
                      people={people}
                      outlet={kopiKenanganOutlet}
                      onOutletChange={setKopiKenanganOutlet}
                      onAddPerson={addPerson}
                      onUpdatePerson={updatePerson}
                      onRemovePerson={removePerson}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Fee Settings */}
            {step === 2 && (
              <div className="animate-fade-in">
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-100">Fees & Discounts</h2>
                  <p className="text-sm text-zinc-500 mt-0.5">Discount, delivery, and cashback</p>
                </div>

                <FeeSettings feeConfig={feeConfig} onUpdate={setFeeConfig} />

                <div className="mt-6">
                  <AdditionalFees
                    fees={feeConfig.additionalFees}
                    onUpdate={(fees) => setFeeConfig({ ...feeConfig, additionalFees: fees })}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Results */}
            {step === 3 && result && (
              <div className="animate-fade-in">
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-100">Results</h2>
                  <p className="text-sm text-zinc-500 mt-0.5">Here&apos;s how much each person pays</p>
                  <p className="text-xs text-zinc-500 mt-1">Split date: {formatBillDate(result)}</p>
                  {result.billMode === 'kopiKenangan' && (
                    <p className="text-xs text-zinc-500 mt-1">
                      Store: <span className="text-zinc-200 font-semibold">Kopi Kenangan</span>
                      {result.kopiKenanganOutlet && (
                        <span className="text-zinc-500"> - {formatOutletName(result.kopiKenanganOutlet)}</span>
                      )}
                    </p>
                  )}
                  {result.payerName && (
                    <p className="text-xs text-zinc-500 mt-1">
                      Ditalangi oleh <span className="text-zinc-200 font-semibold">{result.payerName}</span>
                      {result.payerAccountNumber && (
                        <span className="block mt-0.5 text-zinc-600">No. Rek: {result.payerAccountNumber}</span>
                      )}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {result.results.map((r, i) => (
                    <ResultCard key={r.person.id} result={r} index={i} />
                  ))}
                </div>

                {/* Summary */}
                <div className="mt-6 rounded-lg border border-brand/30 bg-brand/10 p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="text-sm text-zinc-400">Total Payment</p>
                      <p className="text-2xl sm:text-3xl font-extrabold font-mono text-brand">
                        Rp{result.totalFinal.toLocaleString('id-ID')}
                      </p>
                    </div>
                    {result.totalSaved > 0 && (
                      <div className="text-right">
                        <p className="text-sm text-zinc-400">Total Saved</p>
                        <p className="text-lg sm:text-xl font-bold font-mono text-teal-400">
                          Rp{result.totalSaved.toLocaleString('id-ID')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="hidden lg:flex gap-3 mt-6">
                  <a
                    href={getWhatsAppUrl(result)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-emerald-600/20"
                  >
                    <IoLogoWhatsapp className="w-5 h-5" />
                    Share via WhatsApp
                  </a>
                  <button
                    onClick={handleSave}
                    disabled={saved}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                      saved
                        ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30 cursor-default'
                        : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-800'
                    }`}
                  >
                    {saved ? 'Saved!' : 'Save to History'}
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 font-semibold text-sm transition-all duration-200 border border-zinc-800 flex items-center gap-2"
                  >
                    New Bill
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Sidebar - Live Preview */}
          <div className="hidden xl:block">
            {step !== 3 && (
              <div className="sticky top-24 space-y-4">
                <LivePreview
                  people={people}
                  feeConfig={feeConfig}
                  billMode={billMode}
                  kopiKenanganOutlet={billMode === 'kopiKenangan' ? kopiKenanganOutlet : undefined}
                />

                {/* Desktop Step Navigation Buttons */}
                {step === 1 && (
                  <button
                    onClick={() => setStep(2)}
                    disabled={!canProceedStep1}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-brand text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-orange-600 transition-all duration-200 shadow-lg shadow-brand/20"
                  >
                    Next: Fees & Discounts
                  </button>
                )}
                {step === 2 && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(1)}
                      className="flex items-center gap-2 px-5 py-3 rounded-lg bg-zinc-900 text-zinc-300 font-semibold text-sm border border-zinc-800 hover:bg-zinc-800 transition-all duration-200"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleCalculate}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-brand text-white font-bold text-sm hover:bg-orange-600 transition-all duration-200 shadow-lg shadow-brand/20"
                    >
                      Calculate
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className={`w-full ${pageMaxWidth} mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-zinc-800/80 text-center`}>
        <p className="text-zinc-500 text-sm">
          &copy; {new Date().getFullYear()} Bayar Bareng. All rights reserved.
        </p>
        <p className="text-zinc-600 text-xs mt-1 font-medium">
          @aljasonch
        </p>
      </footer>

      {/* Sticky Bottom CTA (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#08090b]/95 backdrop-blur-md xl:hidden border-t border-zinc-800 z-40">
        {step === 1 && (
          <button
            onClick={() => setStep(2)}
            disabled={!canProceedStep1}
            className="w-full px-6 py-3.5 rounded-lg bg-brand text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-orange-600 transition-all duration-200 shadow-lg shadow-brand/20 flex items-center justify-center gap-2"
          >
            Next: Fees & Discounts
          </button>
        )}
        {step === 2 && (
          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-3.5 rounded-lg bg-zinc-900 text-zinc-300 font-semibold text-sm border border-zinc-800 hover:bg-zinc-800 transition-all duration-200"
            >
              Back
            </button>
            <button
              onClick={handleCalculate}
              className="flex-1 px-6 py-3.5 rounded-lg bg-brand text-white font-bold text-sm hover:bg-orange-600 transition-all duration-200 shadow-lg shadow-brand/20 flex items-center justify-center gap-2"
            >
              Calculate
            </button>
          </div>
        )}
        {step === 3 && result && (
          <div className="flex gap-2">
            <a
              href={getWhatsAppUrl(result)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all duration-200"
            >
              <IoLogoWhatsapp className="w-4 h-4" />
              WhatsApp
            </a>
            <button
              onClick={handleSave}
              disabled={saved}
              className={`px-4 py-3.5 rounded-lg font-bold text-sm transition-all duration-200 ${
                saved
                  ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30'
                  : 'bg-zinc-900 text-zinc-100 border border-zinc-800 hover:bg-zinc-800'
              }`}
            >
              {saved ? 'Saved' : 'Save'}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-3.5 rounded-lg bg-zinc-900 text-zinc-400 font-bold text-sm border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-100 transition-all duration-200"
            >
              New
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
