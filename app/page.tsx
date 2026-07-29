'use client'

import { Fragment, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { BillMode, BillResult, FeeConfig, KopiKenanganOutlet, Person, PersonProfile } from '@/types'
import { calculateBill } from '@/lib/calculate'
import { formatBillDate, getTodayDateInputValue } from '@/lib/date'
import { saveToHistory } from '@/lib/history'
import { createProfile, getProfiles, saveProfiles } from '@/lib/profiles'
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
import WhatsAppActions from '@/components/WhatsAppActions'

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

const STEPS = [
  { num: 1, title: 'Catat', description: 'orang & pesanan' },
  { num: 2, title: 'Sesuaikan', description: 'diskon & biaya' },
  { num: 3, title: 'Tagih', description: 'hasil akhir' },
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
        {/* ── Header ────────────────────────────────── */}
        <header className="flex items-baseline justify-between gap-4 pb-5">
          <div>
            <h1 className="font-mono text-lg font-bold uppercase tracking-[0.14em] text-ink">
              Bilbil
            </h1>
            <p className="mt-0.5 text-xs text-muted">Patungan tanpa salah hitung</p>
          </div>
          <Link
            href="/history"
            className="font-mono text-xs font-bold uppercase tracking-[0.1em] text-muted transition-colors hover:text-ink"
          >
            Riwayat
          </Link>
        </header>

        {/* ── Step progress ─────────────────────────── */}
        <nav className="flex items-center gap-0 pb-1 pt-1" aria-label="Langkah">
          {STEPS.map((item, i) => {
            const active = step === item.num
            const done = canOpenStep(item.num) && step > item.num
            const disabled = !canOpenStep(item.num)
            return (
              <Fragment key={item.num}>
                {i > 0 && (
                  <div
                    className={`mx-1 h-px flex-1 sm:mx-2 ${
                      done || active ? 'bg-ink' : 'bg-rule'
                    }`}
                  />
                )}
                <button
                  type="button"
                  onClick={() => openStep(item.num)}
                  disabled={disabled}
                  className="flex items-center gap-1.5 disabled:cursor-not-allowed sm:gap-2"
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold sm:h-7 sm:w-7 ${
                      active
                        ? 'bg-ink text-paper'
                        : done
                        ? 'bg-ink text-paper'
                        : 'border border-rule2 text-faint'
                    }`}
                  >
                    {done ? '✓' : item.num}
                  </span>
                  <div className="text-left">
                    <span
                      className={`block font-mono text-[11px] font-bold uppercase tracking-[0.08em] sm:text-xs ${
                        active || done ? 'text-ink' : 'text-faint'
                      }`}
                    >
                      {item.title}
                    </span>
                    <span
                      className={`hidden text-[10px] sm:block ${
                        active ? 'text-ink3' : 'text-faint'
                      }`}
                    >
                      {item.description}
                    </span>
                  </div>
                </button>
              </Fragment>
            )
          })}
        </nav>

        {/* Running counter */}
        {step !== 3 && (
          <div className="flex items-center justify-between border-b border-rule pb-4 pt-3 font-mono text-xs">
            <div className="flex items-center gap-3 text-muted">
              <span>
                <span className="font-bold text-ink">{people.length}</span> orang
              </span>
              <span>
                <span className="font-bold text-ink">{itemCount}</span> item
              </span>
            </div>
            <div className="text-muted">
              subtotal{' '}
              <span className="ml-0.5 text-sm font-bold text-ink">{formatRp(runningTotal)}</span>
            </div>
          </div>
        )}

        {/* ── Step content ──────────────────────────── */}
        <main className={step !== 3 ? 'pb-24 pt-5 sm:pb-28' : 'pb-10 pt-5'}>
          {/* ─ Step 1: Catat ─ */}
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
                      <p className="label">Jenis nota</p>
                      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {(
                          [
                            { mode: 'general' as BillMode, title: 'Nota umum', desc: 'Tulis item & harga manual' },
                            { mode: 'kopiKenangan' as BillMode, title: 'Kopi Kenangan', desc: 'Menu resmi + modifier' },
                          ]
                        ).map((option) => {
                          const active = billMode === option.mode
                          return (
                            <button
                              key={option.mode}
                              type="button"
                              onClick={() => setBillMode(option.mode)}
                              className={`flex items-start gap-3 rounded-sm border p-3.5 text-left transition-colors ${
                                active
                                  ? 'border-ink bg-paper2'
                                  : 'border-rule2 bg-paper text-muted hover:border-ink hover:text-ink'
                              }`}
                            >
                              <span
                                className={`mt-1 h-2.5 w-2.5 shrink-0 border border-ink ${active ? 'bg-ink' : 'bg-transparent'}`}
                              />
                              <span>
                                <span className={`block text-sm font-semibold ${active ? 'text-ink' : ''}`}>
                                  {option.title}
                                </span>
                                <span className="mt-0.5 block text-xs text-muted">{option.desc}</span>
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label htmlFor="split-date" className="label mb-2 block">
                          Tanggal
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
                          Ditalangi oleh
                        </label>
                        <input
                          id="payer-name"
                          type="text"
                          value={payerName}
                          onChange={(event) => setPayerName(event.target.value)}
                          placeholder="Nama (opsional)"
                          className="field"
                        />
                        <input
                          id="payer-account-number"
                          type="text"
                          value={payerAccountNumber}
                          onChange={(event) => setPayerAccountNumber(event.target.value)}
                          placeholder="No. rekening (opsional)"
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
                        <p className="label">Entri nota</p>
                        <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink">Orang di nota ini</h2>
                      </div>
                      <button type="button" onClick={addManualPerson} className="button-secondary">
                        + Orang baru
                      </button>
                    </div>

                    {people.length === 0 ? (
                      <div className="rounded-sm border border-dashed border-rule2 bg-paper/60 p-8 text-center">
                        <h3 className="text-base font-semibold text-ink">Nota masih kosong</h3>
                        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
                          Pilih nama dari roster di samping, atau tekan &quot;+ Orang baru&quot; untuk orang yang cuma ikut
                          nota ini.
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

          {/* ─ Step 2: Sesuaikan ─ */}
          {step === 2 && (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
              <div className="space-y-5">
                <div>
                  <p className="label">Penyesuaian</p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">Diskon & biaya</h2>
                  <p className="mt-1 text-sm text-muted">
                    Masukkan ongkir, service charge, diskon, atau cashback sebelum dibagi.
                  </p>
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

          {/* ─ Step 3: Tagih ─ */}
          {step === 3 && result && (
            <div className="animate-fade-in space-y-5">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="label">Hasil akhir</p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">Tagihan siap dikirim</h2>
                </div>
                <button type="button" onClick={handleReset} className="button-secondary">
                  Nota baru
                </button>
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(19rem,23rem)_minmax(0,1fr)] lg:items-start">
                {/* Receipt */}
                <div className="receipt-frame lg:sticky lg:top-5">
                  <section className="receipt px-5 pt-5">
                    <div className="text-center">
                      <p className="font-mono text-sm font-bold uppercase tracking-[0.2em] text-ink">
                        Bilbil
                      </p>
                      <p className="mt-1 font-mono text-xs text-muted">nota pembagian</p>
                    </div>

                    <div className="perforation mt-4 space-y-1 pt-3 font-mono text-xs text-muted">
                      <div className="flex justify-between gap-2">
                        <span>TANGGAL</span>
                        <span className="text-ink2">{formatBillDate(result)}</span>
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
                          <span className="truncate text-ink2">
                            {item.person.name || `Orang ${index + 1}`}
                          </span>
                          <span className="dots" aria-hidden />
                          <span className="shrink-0 font-semibold text-ink">{formatRp(item.final)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="rule-total mt-4 pt-3">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-ink">
                          Total
                        </span>
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

                    <div className="flex min-h-14 items-center justify-between gap-3 pb-4 pt-3">
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
                        {result.people.length} orang · dihitung otomatis
                      </p>
                      {saved && <span className="stamp animate-stamp-in">Tersimpan</span>}
                    </div>
                  </section>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                    <WhatsAppActions result={result} />
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saved}
                      className="button-secondary disabled:cursor-default disabled:border-stamp/40 disabled:text-stamp"
                    >
                      {saved ? 'Tersimpan di riwayat' : 'Simpan ke riwayat'}
                    </button>
                  </div>

                  <SplitDistributionBar results={result.results} total={result.totalFinal} />

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {result.results.map((item, index) => (
                      <ResultCard key={item.person.id} result={item} index={index} grandTotal={result.totalFinal} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── Sticky bottom action bar (all breakpoints) ── */}
      {step !== 3 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-rule bg-paper/95 px-4 py-3 backdrop-blur-sm sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[1440px] items-center gap-3">
            {/* Mobile: compact summary */}
            <div className="flex-1 sm:hidden">
              <span className="font-mono text-[11px] text-muted">
                {people.length} orang · {itemCount} item
              </span>
              <span className="block font-mono text-sm font-bold text-ink">
                {formatRp(runningTotal)}
              </span>
            </div>

            {step === 1 && (
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
                className="button-primary ml-auto min-h-12 px-6 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Lanjut: diskon & biaya →
              </button>
            )}
            {step === 2 && (
              <>
                <button type="button" onClick={() => setStep(1)} className="button-secondary hidden min-h-12 px-5 sm:inline-flex">
                  ← Kembali
                </button>
                <button type="button" onClick={handleCalculate} className="button-primary min-h-12 flex-1 sm:flex-none sm:px-8">
                  Hitung pembagian
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
