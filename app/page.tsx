'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { BillMode, BillResult, FeeConfig, KopiKenanganOutlet, Person, PersonProfile } from '@/types'
import { calculateBill } from '@/lib/calculate'
import { formatBillDate, getTodayDateInputValue } from '@/lib/date'
import { saveToHistory } from '@/lib/history'
import { createProfile, getProfiles, saveProfiles } from '@/lib/profiles'
import { getWhatsAppUrl } from '@/lib/whatsapp'
import { formatOutletName } from '@/lib/kopi-kenangan'
import { formatRp } from '@/lib/item-display'
import AdditionalFees from '@/components/AdditionalFees'
import FeeSettings from '@/components/FeeSettings'
import KopiKenanganOrder from '@/components/KopiKenanganOrder'
import LivePreview from '@/components/LivePreview'
import PeopleProfiles from '@/components/PeopleProfiles'
import PersonCard from '@/components/PersonCard'
import ResultCard from '@/components/ResultCard'
import SplitDistributionBar from '@/components/SplitDistributionBar'
import {
  IoArrowBack,
  IoArrowForward,
  IoCafeOutline,
  IoCheckmarkCircle,
  IoLogoWhatsapp,
  IoPeopleOutline,
  IoReceiptOutline,
  IoTimeOutline,
} from 'react-icons/io5'

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

const STEPS = [
  { num: 1, title: 'Build', description: 'People and items' },
  { num: 2, title: 'Adjust', description: 'Fees and discounts' },
  { num: 3, title: 'Settle', description: 'Final amounts' },
]

const EMPTY_FEE_CONFIG: FeeConfig = {
  discountPct: 0,
  discountMax: 0,
  deliveryFee: 0,
  additionalFees: [],
  cashbackPct: 0,
  cashbackMax: 0,
  cashbackBase: 'totalPayment',
}

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ')
}

function createPerson(profile?: PersonProfile): Person {
  return {
    id: generateId(),
    profileId: profile?.id,
    name: profile?.name ?? '',
    items: [],
  }
}

function Metric({ label, value, subtext }: { label: string; value: string; subtext?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white/75 px-4 py-3">
      <p className="label">{label}</p>
      <p className="mt-1 font-mono text-xl font-semibold tracking-tight text-ink">{value}</p>
      {subtext && <p className="mt-1 text-xs text-muted">{subtext}</p>}
    </div>
  )
}

export default function Home() {
  const [step, setStep] = useState(1)
  const [profiles, setProfiles] = useState<PersonProfile[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [feeConfig, setFeeConfig] = useState<FeeConfig>(EMPTY_FEE_CONFIG)
  const [splitDate, setSplitDate] = useState<string>(() => getTodayDateInputValue())
  const [billMode, setBillMode] = useState<BillMode>('general')
  const [kopiKenanganOutlet, setKopiKenanganOutlet] = useState<KopiKenanganOutlet>('normal')
  const [payerName, setPayerName] = useState('')
  const [payerAccountNumber, setPayerAccountNumber] = useState('')
  const [result, setResult] = useState<BillResult | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setProfiles(getProfiles())
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [])

  const persistProfiles = useCallback((nextProfiles: PersonProfile[]) => {
    setProfiles(nextProfiles)
    saveProfiles(nextProfiles)
  }, [])

  const addPerson = useCallback((profile?: PersonProfile) => {
    setPeople((current) => {
      if (profile && current.some((person) => person.profileId === profile.id)) return current
      return [...current, createPerson(profile)]
    })
  }, [])

  const addManualPerson = useCallback(() => addPerson(), [addPerson])

  const handleCreateProfile = (name: string) => {
    const profile = createProfile(name)
    if (!profile) return

    persistProfiles(
      profiles.some((item) => item.name.toLowerCase() === profile.name.toLowerCase())
        ? profiles
        : [...profiles, profile]
    )
  }

  const handleRenameProfile = (id: string, name: string) => {
    const normalized = normalizeName(name)
    if (!normalized) return

    const nextProfiles = profiles.map((profile) =>
      profile.id === id ? { ...profile, name: normalized } : profile
    )
    persistProfiles(nextProfiles)
    setPeople((current) =>
      current.map((person) => (person.profileId === id ? { ...person, name: normalized } : person))
    )
  }

  const handleDeleteProfile = (id: string) => {
    persistProfiles(profiles.filter((profile) => profile.id !== id))
    setPeople((current) =>
      current.map((person) => (person.profileId === id ? { ...person, profileId: undefined } : person))
    )
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
    if (!result) return
    saveToHistory(result)
    setSaved(true)
  }

  const handleReset = () => {
    setPeople([])
    setFeeConfig({ ...EMPTY_FEE_CONFIG, additionalFees: [] })
    setBillMode('general')
    setKopiKenanganOutlet('normal')
    setSplitDate(getTodayDateInputValue())
    setPayerName('')
    setPayerAccountNumber('')
    setResult(null)
    setStep(1)
    setSaved(false)
  }

  const runningTotal = people.reduce(
    (sum, person) => sum + person.items.reduce((itemSum, item) => itemSum + item.price, 0),
    0
  )
  const itemCount = people.reduce((sum, person) => sum + person.items.length, 0)
  const canProceedStep1 = people.some((person) => person.items.some((item) => item.price > 0))
  const hasPayerName = payerName.trim().length > 0

  const canOpenStep = (num: number) => {
    if (num === 1) return true
    if (num === 2) return canProceedStep1 || step >= 2
    if (num === 3) return !!result
    return false
  }

  const openStep = (num: number) => {
    if (canOpenStep(num)) setStep(num)
  }

  return (
    <div className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1440px]">
        <header className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-ink">Bayar Bareng</h1>
              <p className="text-sm text-muted">A quieter workspace for shared bills.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/history" className="button-secondary">
              <IoTimeOutline className="h-4 w-4" />
              History
            </Link>
          </div>
        </header>

        <section className="mt-6 sheet overflow-hidden p-4 sm:p-5 lg:p-6">
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_28rem]">
            <div>
              <p className="label">Current bill</p>
              <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 className="max-w-3xl text-3xl font-semibold tracking-[-0.035em] text-ink sm:text-4xl">
                    Build the split once. Reuse the people every time.
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-muted sm:text-base">
                    Saved names live in your browser. Bills still keep their own names, so history stays readable even after the roster changes.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:min-w-[28rem]">
                  <Metric label="People" value={people.length.toString()} subtext="in this split" />
                  <Metric label="Items" value={itemCount.toString()} subtext="entered now" />
                  <Metric label="Subtotal" value={formatRp(runningTotal)} subtext="before fees" />
                </div>
              </div>
            </div>

            <nav className="grid grid-cols-3 gap-2 rounded-3xl border border-line bg-white/70 p-2">
              {STEPS.map((item) => {
                const active = step === item.num
                const disabled = !canOpenStep(item.num)
                return (
                  <button
                    key={item.num}
                    type="button"
                    onClick={() => openStep(item.num)}
                    disabled={disabled}
                    className={`rounded-2xl px-3 py-3 text-left transition-all disabled:cursor-not-allowed disabled:opacity-45 ${
                      active ? 'bg-ink text-white shadow-pop' : 'text-muted hover:bg-surface2 hover:text-ink'
                    }`}
                  >
                    <span className="block font-mono text-[11px] opacity-70">0{item.num}</span>
                    <span className="mt-1 block text-sm font-semibold">{item.title}</span>
                    <span className="hidden text-xs opacity-70 sm:block">{item.description}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </section>

        <main className={step !== 3 ? 'pb-28 pt-5 lg:pb-32' : 'pb-10 pt-5'}>
          {step === 1 && (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[24rem_minmax(0,1fr)]">
              <div className="xl:sticky xl:top-5 xl:self-start">
                <PeopleProfiles
                  profiles={profiles}
                  people={people}
                  onCreateProfile={handleCreateProfile}
                  onRenameProfile={handleRenameProfile}
                  onDeleteProfile={handleDeleteProfile}
                  onAddProfileToSplit={addPerson}
                  onAddManualPerson={addManualPerson}
                />
              </div>

              <div className="space-y-5">
                <section className="card p-4 sm:p-5">
                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(21rem,0.9fr)]">
                    <div>
                      <p className="label">Split type</p>
                      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => setBillMode('general')}
                          className={`rounded-2xl border p-4 text-left transition-all ${
                            billMode === 'general'
                              ? 'border-ink bg-ink text-white'
                              : 'border-line2 bg-white text-muted hover:border-ink/25 hover:text-ink'
                          }`}
                        >
                          <IoReceiptOutline className="h-5 w-5" />
                          <span className="mt-3 block text-sm font-semibold">General bill</span>
                          <span className="mt-1 block text-xs opacity-70">Manual item entry</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setBillMode('kopiKenangan')}
                          className={`rounded-2xl border p-4 text-left transition-all ${
                            billMode === 'kopiKenangan'
                              ? 'border-ink bg-ink text-white'
                              : 'border-line2 bg-white text-muted hover:border-ink/25 hover:text-ink'
                          }`}
                        >
                          <IoCafeOutline className="h-5 w-5" />
                          <span className="mt-3 block text-sm font-semibold">Kopi Kenangan</span>
                          <span className="mt-1 block text-xs opacity-70">Catalog with modifiers</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label htmlFor="split-date" className="label mb-2 block">
                          Split date
                        </label>
                        <input
                          id="split-date"
                          type="date"
                          value={splitDate}
                          onChange={(event) => setSplitDate(event.target.value)}
                          className="field field-mono"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="payer-name" className="label block">
                          Fronted by
                        </label>
                        <input
                          id="payer-name"
                          type="text"
                          value={payerName}
                          onChange={(event) => setPayerName(event.target.value)}
                          placeholder="Name, optional"
                          className="field"
                        />
                        <input
                          id="payer-account-number"
                          type="text"
                          value={payerAccountNumber}
                          onChange={(event) => setPayerAccountNumber(event.target.value)}
                          placeholder="Account number, optional"
                          disabled={!hasPayerName}
                          className="field field-mono disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {billMode === 'general' ? (
                  <section className="space-y-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="label">Bill lines</p>
                        <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink">People in this split</h2>
                      </div>
                      <button type="button" onClick={addManualPerson} className="button-secondary">
                        <IoPeopleOutline className="h-4 w-4" />
                        Add one-off person
                      </button>
                    </div>

                    {people.length === 0 ? (
                      <div className="card border-dashed p-8 text-center">
                        <h3 className="text-base font-semibold text-ink">No one in the split yet</h3>
                        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
                          Add a saved name from the roster, or create a one-off person for this bill.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {people.map((person, index) => (
                          <PersonCard
                            key={person.id}
                            person={person}
                            index={index}
                            onUpdate={(updatedPerson) => updatePerson(index, updatedPerson)}
                            onRemove={() => removePerson(index)}
                            canRemove={people.length > 0}
                          />
                        ))}
                      </div>
                    )}
                  </section>
                ) : (
                  <KopiKenanganOrder
                    people={people}
                    outlet={kopiKenanganOutlet}
                    onOutletChange={setKopiKenanganOutlet}
                    onAddPerson={addManualPerson}
                    onUpdatePerson={updatePerson}
                    onRemovePerson={removePerson}
                  />
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
              <div className="space-y-5">
                <div>
                  <p className="label">Adjustments</p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">Fees and discounts</h2>
                  <p className="mt-1 text-sm text-muted">Add delivery, service charges, discounts, and cashback before settling.</p>
                </div>
                <FeeSettings feeConfig={feeConfig} onUpdate={setFeeConfig} />
                <AdditionalFees
                  fees={feeConfig.additionalFees}
                  onUpdate={(fees) => setFeeConfig({ ...feeConfig, additionalFees: fees })}
                />
              </div>
              <div className="xl:sticky xl:top-5 xl:self-start">
                <LivePreview
                  people={people}
                  feeConfig={feeConfig}
                  billMode={billMode}
                  kopiKenanganOutlet={billMode === 'kopiKenangan' ? kopiKenanganOutlet : undefined}
                />
              </div>
            </div>
          )}

          {step === 3 && result && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="label">Settlement</p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">Final split</h2>
                  <p className="mt-1 text-sm text-muted">Split date: {formatBillDate(result)}</p>
                  {result.billMode === 'kopiKenangan' && (
                    <p className="mt-1 text-sm text-muted">
                      Kopi Kenangan, {formatOutletName(result.kopiKenanganOutlet)} outlet
                    </p>
                  )}
                  {result.payerName && (
                    <p className="mt-1 text-sm text-muted">
                      Fronted by <span className="font-semibold text-ink">{result.payerName}</span>
                      {result.payerAccountNumber ? `, ${result.payerAccountNumber}` : ''}
                    </p>
                  )}
                </div>
                <div className="grid w-full grid-cols-1 gap-2 sm:w-auto sm:grid-cols-2">
                  <a
                    href={getWhatsAppUrl(result)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button-primary bg-whatsapp hover:bg-whatsappDark"
                  >
                    <IoLogoWhatsapp className="h-5 w-5" />
                    Share WhatsApp
                  </a>
                  <button type="button" onClick={handleReset} className="button-secondary">
                    New bill
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(20rem,0.8fr)_minmax(0,1.2fr)]">
                <section className="rounded-[1.75rem] bg-ink p-5 text-white shadow-pop">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">Total payment</p>
                  <p className="mt-2 font-mono text-4xl font-semibold tracking-tight">{formatRp(result.totalFinal)}</p>
                  <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <p className="text-white/50">People</p>
                      <p className="mt-1 font-mono text-lg font-semibold">{result.people.length}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <p className="text-white/50">Saved</p>
                      <p className="mt-1 font-mono text-lg font-semibold">{formatRp(result.totalSaved)}</p>
                    </div>
                  </div>
                </section>
                <SplitDistributionBar results={result.results} total={result.totalFinal} />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {result.results.map((item, index) => (
                  <ResultCard key={item.person.id} result={item} index={index} grandTotal={result.totalFinal} />
                ))}
              </div>

              <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                <a
                  href={getWhatsAppUrl(result)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button-primary bg-whatsapp hover:bg-whatsappDark lg:col-span-2"
                >
                  <IoLogoWhatsapp className="h-5 w-5" />
                  Share via WhatsApp
                </a>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saved}
                  className="button-secondary disabled:cursor-default disabled:border-accent/30 disabled:bg-accentSoft disabled:text-accent"
                >
                  {saved ? <IoCheckmarkCircle className="h-5 w-5" /> : null}
                  {saved ? 'Saved' : 'Save to history'}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {step !== 3 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/90 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[1440px] gap-3">
            {step === 1 && (
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
                className="button-primary ml-auto min-h-12 px-6 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue to adjustments
                <IoArrowForward className="h-4 w-4" />
              </button>
            )}
            {step === 2 && (
              <>
                <button type="button" onClick={() => setStep(1)} className="button-secondary min-h-12 px-5">
                  <IoArrowBack className="h-4 w-4" />
                  Back
                </button>
                <button type="button" onClick={handleCalculate} className="button-primary min-h-12 flex-1">
                  Calculate split
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
