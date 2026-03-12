'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Person, FeeConfig, BillResult } from '@/types'
import { calculateBill } from '@/lib/calculate'
import { saveToHistory } from '@/lib/history'
import { getWhatsAppUrl } from '@/lib/whatsapp'
import PersonCard from '@/components/PersonCard'
import FeeSettings from '@/components/FeeSettings'
import AdditionalFees from '@/components/AdditionalFees'
import ResultCard from '@/components/ResultCard'
import LivePreview from '@/components/LivePreview'
import {
  HiOutlineReceiptPercent,
  HiOutlineUserGroup,
  HiOutlineCog6Tooth,
  HiOutlineDocumentText,
  HiOutlineClock,
  HiOutlinePlus,
  HiOutlineArrowRight,
  HiOutlineArrowLeft,
  HiOutlineCheck,
  HiOutlineArrowPath,
} from 'react-icons/hi2'
import { IoLogoWhatsapp } from 'react-icons/io5'
import { FiSave } from 'react-icons/fi'

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

const STEPS = [
  { num: 1, label: 'People & Items', icon: HiOutlineUserGroup },
  { num: 2, label: 'Fees & Discounts', icon: HiOutlineCog6Tooth },
  { num: 3, label: 'Results', icon: HiOutlineDocumentText },
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
    const billResult = calculateBill(people, feeConfig)
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
    setResult(null)
    setStep(1)
    setSaved(false)
  }

  const canProceedStep1 = people.some((p) => p.items.some((i) => i.price > 0))

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="w-full max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-brand to-orange-600 flex items-center justify-center shadow-lg shadow-brand/20">
              <HiOutlineReceiptPercent className="text-white text-base sm:text-lg" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-zinc-100 leading-tight">Bayar Bareng</h1>
              <p className="text-[10px] sm:text-xs text-zinc-500 leading-tight">Split Bill Calculator</p>
            </div>
          </div>
          <Link
            href="/history"
            className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-brand transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
          >
            <HiOutlineClock className="w-4 h-4" />
            <span className="hidden sm:inline">History</span>
          </Link>
        </div>
      </header>

      <main className="w-full max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 lg:pb-8">
        {/* Step Navigation */}
        <div className="flex items-center justify-center gap-1 sm:gap-2 mb-6 sm:mb-8">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            return (
              <div key={s.num} className="flex items-center">
                <button
                  onClick={() => {
                    if (s.num < step || (s.num === 3 && result)) setStep(s.num)
                  }}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    step === s.num
                      ? 'bg-brand text-white shadow-lg shadow-brand/25'
                      : step > s.num
                      ? 'bg-brand/10 text-brand border border-brand/20'
                      : 'bg-zinc-800/50 text-zinc-500 border border-zinc-700/30'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{s.label}</span>
                  <span className="sm:hidden">{s.num}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`w-6 sm:w-10 h-px mx-1 ${step > s.num ? 'bg-brand/50' : 'bg-zinc-700/30'}`} />
                )}
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className={step === 3 ? 'lg:col-span-3' : 'lg:col-span-2'}>
            {/* Step 1: People & Items */}
            {step === 1 && (
              <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-100">People & Items</h2>
                    <p className="text-sm text-zinc-500 mt-0.5">Add everyone and what they ordered</p>
                  </div>
                  <button
                    onClick={addPerson}
                    className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-brand/10 border border-brand/30 text-brand text-xs sm:text-sm font-semibold hover:bg-brand/20 transition-all duration-200"
                  >
                    <HiOutlinePlus className="w-4 h-4" />
                    Add Person
                  </button>
                </div>

                <div className="space-y-4">
                  {people.map((person, i) => (
                    <PersonCard
                      key={person.id}
                      person={person}
                      index={i}
                      onUpdate={(p) => updatePerson(i, p)}
                      onRemove={() => removePerson(i)}
                      canRemove={people.length > 1}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Fee Settings */}
            {step === 2 && (
              <div className="animate-fade-in">
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-100">Fees & Discounts</h2>
                  <p className="text-sm text-zinc-500 mt-0.5">Configure discounts, delivery, and cashback</p>
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {result.results.map((r, i) => (
                    <ResultCard key={r.person.id} result={r} index={i} />
                  ))}
                </div>

                {/* Summary */}
                <div className="mt-6 rounded-xl border border-brand/20 bg-brand/5 p-4 sm:p-6">
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
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-emerald-600/20"
                  >
                    <IoLogoWhatsapp className="w-5 h-5" />
                    Share via WhatsApp
                  </a>
                  <button
                    onClick={handleSave}
                    disabled={saved}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                      saved
                        ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30 cursor-default'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700'
                    }`}
                  >
                    {saved ? (
                      <>
                        <HiOutlineCheck className="w-5 h-5" />
                        Saved!
                      </>
                    ) : (
                      <>
                        <FiSave className="w-5 h-5" />
                        Save to History
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 font-semibold text-sm transition-all duration-200 border border-zinc-700 flex items-center gap-2"
                  >
                    <HiOutlineArrowPath className="w-4 h-4" />
                    New Bill
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Sidebar - Live Preview */}
          <div className="hidden lg:block">
            {step !== 3 && (
              <div className="sticky top-20 space-y-4">
                <LivePreview people={people} feeConfig={feeConfig} />

                {/* Desktop Step Navigation Buttons */}
                {step === 1 && (
                  <button
                    onClick={() => setStep(2)}
                    disabled={!canProceedStep1}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-orange-600 transition-all duration-200 shadow-lg shadow-brand/25"
                  >
                    Next: Fees & Discounts
                    <HiOutlineArrowRight className="w-4 h-4" />
                  </button>
                )}
                {step === 2 && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(1)}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-800 text-zinc-300 font-semibold text-sm border border-zinc-700 hover:bg-zinc-700 transition-all duration-200"
                    >
                      <HiOutlineArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                    <button
                      onClick={handleCalculate}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand text-white font-bold text-sm hover:bg-orange-600 transition-all duration-200 shadow-lg shadow-brand/25"
                    >
                      Calculate
                      <HiOutlineArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="w-full max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-white/5 text-center">
        <p className="text-zinc-500 text-sm">
          &copy; {new Date().getFullYear()} Bayar Bareng. All rights reserved.
        </p>
        <p className="text-zinc-600 text-xs mt-1 font-medium">
          @aljasonch
        </p>
      </footer>

      {/* Sticky Bottom CTA (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-zinc-900/90 backdrop-blur-md lg:hidden border-t border-white/5 z-40">
        {step === 1 && (
          <button
            onClick={() => setStep(2)}
            disabled={!canProceedStep1}
            className="w-full px-6 py-3.5 rounded-xl bg-brand text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-orange-600 transition-all duration-200 shadow-lg shadow-brand/25 flex items-center justify-center gap-2"
          >
            Next: Fees & Discounts
            <HiOutlineArrowRight className="w-4 h-4" />
          </button>
        )}
        {step === 2 && (
          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-3.5 rounded-xl bg-zinc-800 text-zinc-300 font-semibold text-sm border border-zinc-700 hover:bg-zinc-700 transition-all duration-200"
            >
              <HiOutlineArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleCalculate}
              className="flex-1 px-6 py-3.5 rounded-xl bg-brand text-white font-bold text-sm hover:bg-orange-600 transition-all duration-200 shadow-lg shadow-brand/25 flex items-center justify-center gap-2"
            >
              Calculate
              <HiOutlineArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
        {step === 3 && result && (
          <div className="flex gap-2">
            <a
              href={getWhatsAppUrl(result)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all duration-200"
            >
              <IoLogoWhatsapp className="w-4 h-4" />
              WhatsApp
            </a>
            <button
              onClick={handleSave}
              disabled={saved}
              className={`px-4 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                saved
                  ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30'
                  : 'bg-zinc-800 text-zinc-100 border border-zinc-700 hover:bg-zinc-700'
              }`}
            >
              {saved ? <HiOutlineCheck className="w-4 h-4" /> : <FiSave className="w-4 h-4" />}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-3.5 rounded-xl bg-zinc-800 text-zinc-400 font-bold text-sm border border-zinc-700 hover:bg-zinc-700 hover:text-zinc-100 transition-all duration-200"
            >
              <HiOutlineArrowPath className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
