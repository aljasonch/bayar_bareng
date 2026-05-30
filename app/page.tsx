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
import SplitDistributionBar from '@/components/SplitDistributionBar'
import SideRail, { RailStep } from '@/components/SideRail'
import {
  IoCafeOutline,
  IoLogoWhatsapp,
  IoReceiptOutline,
  IoTimeOutline,
  IoArrowForward,
  IoArrowBack,
  IoCheckmarkCircle,
} from 'react-icons/io5'

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

const STEPS: RailStep[] = [
  { num: 1, label: 'People & Items', hint: 'Who ordered what' },
  { num: 2, label: 'Fees & Discounts', hint: 'Adjust the totals' },
  { num: 3, label: 'Results', hint: 'See the split' },
]

export default function Home() {
  const [step, setStep] = useState(1)
  const [people, setPeople] = useState<Person[]>([
    { id: generateId(), name: '', items: [] },
    { id: generateId(), name: '', items: [] },
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
      { id: generateId(), name: '', items: [] },
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
      { id: generateId(), name: '', items: [] },
      { id: generateId(), name: '', items: [] },
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
  const runningTotal = people.reduce(
    (sum, person) => sum + person.items.reduce((itemSum, item) => itemSum + item.price, 0),
    0
  )
  const canGoTo = (num: number) => num < step || (num === 3 && !!result) || num === step

  return (
    <div className="min-h-screen lg:flex">
      {/* Desktop navigation rail */}
      <SideRail
        steps={STEPS}
        step={step}
        canGoTo={canGoTo}
        onStep={setStep}
        peopleCount={people.length}
        runningTotal={runningTotal}
      />

      {/* Mobile top bar */}
      <header className="lg:hidden border-b border-line bg-paper/90 backdrop-blur-md sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-sidebar text-white flex items-center justify-center font-mono font-black text-sm">
              B
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-ink leading-tight">Bayar Bareng</h1>
              <p className="text-[10px] text-[#8B83B8] leading-tight font-mono">
                Step {step} of 3 · Rp{runningTotal.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
          <Link
            href="/history"
            className="flex items-center gap-1.5 text-sm font-medium text-accent px-3 py-2 rounded-lg border border-line2 bg-white"
          >
            <IoTimeOutline className="w-4 h-4" />
          </Link>
        </div>
        {/* Mobile progress strip */}
        <div className="flex gap-1 px-4 pb-3">
          {STEPS.map((s) => (
            <div
              key={s.num}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                step >= s.num ? 'bg-accent' : 'bg-line2'
              }`}
            />
          ))}
        </div>
      </header>

      {/* Work area */}
      <div className="flex-1 min-w-0">
        <main className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 pb-28 lg:pb-12">
          <div className={step === 3 ? 'block' : 'grid grid-cols-1 2xl:grid-cols-[minmax(0,1fr)_22rem] gap-6'}>
            {/* Main column */}
            <div>
              {/* Step 1 */}
              {step === 1 && (
                <div className="animate-fade-in">
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div>
                      <h2 className="text-2xl font-extrabold text-ink tracking-tight">Order builder</h2>
                      <p className="text-sm text-[#8B83B8] mt-0.5">
                        {billMode === 'kopiKenangan' ? 'Kopi Kenangan catalog split' : 'Manual split bill'}
                      </p>
                    </div>
                    {billMode === 'general' && (
                      <button
                        onClick={addPerson}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accentDark transition-all shadow-pop"
                      >
                        + Add person
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Setup card */}
                    <div className="card p-4 sm:p-5">
                      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-4">
                        <div>
                          <p className="label mb-2">Split mode</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setBillMode('general')}
                              className={`rounded-xl border p-3 text-left transition-all ${
                                billMode === 'general'
                                  ? 'bg-accent text-white border-accent'
                                  : 'bg-white text-muted border-line2 hover:text-ink hover:border-accent/40'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <IoReceiptOutline className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm font-bold">General bill</span>
                              </div>
                              <p className="text-xs mt-1 opacity-75">Manual items</p>
                            </button>
                            <button
                              type="button"
                              onClick={() => setBillMode('kopiKenangan')}
                              className={`rounded-xl border p-3 text-left transition-all ${
                                billMode === 'kopiKenangan'
                                  ? 'bg-accent text-white border-accent'
                                  : 'bg-white text-muted border-line2 hover:text-ink hover:border-accent/40'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <IoCafeOutline className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm font-bold">Kopi Kenangan</span>
                              </div>
                              <p className="text-xs mt-1 opacity-75">Catalog order</p>
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label htmlFor="split-date" className="label mb-2 block">
                              Split date
                            </label>
                            <input
                              id="split-date"
                              type="date"
                              value={splitDate}
                              onChange={(e) => setSplitDate(e.target.value)}
                              className="field field-mono"
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="payer-name" className="label block">
                              Talangan
                            </label>
                            <input
                              id="payer-name"
                              type="text"
                              value={payerName}
                              onChange={(e) => setPayerName(e.target.value)}
                              placeholder="Nama"
                              className="field"
                            />
                            <input
                              id="payer-account-number"
                              type="text"
                              value={payerAccountNumber}
                              onChange={(e) => setPayerAccountNumber(e.target.value)}
                              placeholder="No rekening"
                              disabled={!hasPayerName}
                              className="field field-mono disabled:opacity-50 disabled:cursor-not-allowed"
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

              {/* Step 2 */}
              {step === 2 && (
                <div className="animate-fade-in">
                  <div className="mb-5">
                    <h2 className="text-2xl font-extrabold text-ink tracking-tight">Fees &amp; discounts</h2>
                    <p className="text-sm text-[#8B83B8] mt-0.5">Discount, delivery, and cashback</p>
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

              {/* Step 3 */}
              {step === 3 && result && (
                <div className="animate-fade-in">
                  <div className="mb-5">
                    <h2 className="text-2xl font-extrabold text-ink tracking-tight">Results</h2>
                    <p className="text-sm text-[#8B83B8] mt-0.5">Here&apos;s how much each person pays</p>
                    <p className="text-xs text-[#8B83B8] mt-1">Split date: {formatBillDate(result)}</p>
                    {result.billMode === 'kopiKenangan' && (
                      <p className="text-xs text-[#8B83B8] mt-1">
                        Store: <span className="text-ink font-semibold">Kopi Kenangan</span>
                        {result.kopiKenanganOutlet && (
                          <span> - {formatOutletName(result.kopiKenanganOutlet)}</span>
                        )}
                      </p>
                    )}
                    {result.payerName && (
                      <p className="text-xs text-[#8B83B8] mt-1">
                        Ditalangi oleh <span className="text-ink font-semibold">{result.payerName}</span>
                        {result.payerAccountNumber && (
                          <span className="block mt-0.5 text-[#8B83B8]">No. Rek: {result.payerAccountNumber}</span>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Summary + distribution side by side */}
                  <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-4 mb-5">
                    <div className="rounded-2xl bg-sidebar text-white p-5 flex flex-col justify-between">
                      <div>
                        <p className="text-xs text-white/50 uppercase tracking-wider font-semibold">Total payment</p>
                        <p className="text-3xl sm:text-4xl font-extrabold font-mono mt-1">
                          Rp{result.totalFinal.toLocaleString('id-ID')}
                        </p>
                      </div>
                      {result.totalSaved > 0 && (
                        <p className="text-sm text-white/70 mt-4">
                          Total saved{' '}
                          <span className="font-mono font-bold text-white">
                            Rp{result.totalSaved.toLocaleString('id-ID')}
                          </span>
                        </p>
                      )}
                    </div>
                    <SplitDistributionBar results={result.results} total={result.totalFinal} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {result.results.map((r, i) => (
                      <ResultCard key={r.person.id} result={r} index={i} grandTotal={result.totalFinal} />
                    ))}
                  </div>

                  {/* Desktop actions */}
                  <div className="hidden lg:flex gap-3 mt-6">
                    <a
                      href={getWhatsAppUrl(result)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm transition-all"
                    >
                      <IoLogoWhatsapp className="w-5 h-5" />
                      Share via WhatsApp
                    </a>
                    <button
                      onClick={handleSave}
                      disabled={saved}
                      className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all border ${
                        saved
                          ? 'bg-accentSoft text-accent border-accent/30 cursor-default'
                          : 'bg-white hover:bg-accentSoft text-ink border-line2'
                      }`}
                    >
                      {saved ? <IoCheckmarkCircle className="w-5 h-5" /> : null}
                      {saved ? 'Saved' : 'Save to history'}
                    </button>
                    <button
                      onClick={handleReset}
                      className="px-6 py-3 rounded-xl bg-white hover:bg-accentSoft text-ink3 hover:text-ink font-semibold text-sm transition-all border border-line2"
                    >
                      New bill
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Inner sidebar — live preview (steps 1 & 2 only) */}
            {step !== 3 && (
              <div className="hidden 2xl:block">
                <div className="sticky top-8 space-y-4">
                  <LivePreview
                    people={people}
                    feeConfig={feeConfig}
                    billMode={billMode}
                    kopiKenanganOutlet={billMode === 'kopiKenangan' ? kopiKenanganOutlet : undefined}
                  />

                  {step === 1 && (
                    <button
                      onClick={() => setStep(2)}
                      disabled={!canProceedStep1}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accentDark transition-all"
                    >
                      Next: Fees &amp; discounts
                      <IoArrowForward className="w-4 h-4" />
                    </button>
                  )}
                  {step === 2 && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep(1)}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-ink3 font-semibold text-sm border border-line2 hover:bg-accentSoft transition-all"
                      >
                        <IoArrowBack className="w-4 h-4" />
                        Back
                      </button>
                      <button
                        onClick={handleCalculate}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-bold text-sm hover:bg-accentDark transition-all"
                      >
                        Calculate
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Desktop step nav for < 2xl (no inner sidebar visible) */}
          {step !== 3 && (
            <div className="hidden lg:flex 2xl:hidden gap-3 mt-6">
              {step === 1 && (
                <button
                  onClick={() => setStep(2)}
                  disabled={!canProceedStep1}
                  className="ml-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-accent text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accentDark transition-all"
                >
                  Next: Fees &amp; discounts
                  <IoArrowForward className="w-4 h-4" />
                </button>
              )}
              {step === 2 && (
                <>
                  <button
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-ink3 font-semibold text-sm border border-line2 hover:bg-accentSoft transition-all"
                  >
                    <IoArrowBack className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    onClick={handleCalculate}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-bold text-sm hover:bg-accentDark transition-all"
                  >
                    Calculate
                  </button>
                </>
              )}
            </div>
          )}

          <footer className="mt-10 pt-6 border-t border-line text-center">
            <p className="text-muted text-sm">
              &copy; {new Date().getFullYear()} Bayar Bareng. All rights reserved.
            </p>
            <p className="text-[#8B83B8] text-xs mt-1 font-medium">@aljasonch</p>
          </footer>
        </main>
      </div>

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-paper/95 backdrop-blur-md lg:hidden border-t border-line z-40">
        {step === 1 && (
          <button
            onClick={() => setStep(2)}
            disabled={!canProceedStep1}
            className="w-full px-6 py-3.5 rounded-xl bg-accent text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accentDark transition-all flex items-center justify-center gap-2"
          >
            Next: Fees &amp; discounts
            <IoArrowForward className="w-4 h-4" />
          </button>
        )}
        {step === 2 && (
          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-3.5 rounded-xl bg-white text-ink3 font-semibold text-sm border border-line2"
            >
              <IoArrowBack className="w-4 h-4" />
            </button>
            <button
              onClick={handleCalculate}
              className="flex-1 px-6 py-3.5 rounded-xl bg-accent text-white font-bold text-sm hover:bg-accentDark transition-all flex items-center justify-center gap-2"
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
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm transition-all"
            >
              <IoLogoWhatsapp className="w-4 h-4" />
              WhatsApp
            </a>
            <button
              onClick={handleSave}
              disabled={saved}
              className={`px-4 py-3.5 rounded-xl font-bold text-sm transition-all border ${
                saved
                  ? 'bg-accentSoft text-accent border-accent/30'
                  : 'bg-white text-ink border-line2'
              }`}
            >
              {saved ? 'Saved' : 'Save'}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-3.5 rounded-xl bg-white text-ink3 font-bold text-sm border border-line2 hover:text-ink transition-all"
            >
              New
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
