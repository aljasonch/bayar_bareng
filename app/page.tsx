'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ReceiptText, CheckCircle2, History } from 'lucide-react'
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
import StickySummaryBar from '@/components/StickySummaryBar'
import MobileWizard from '@/components/MobileWizard'

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
  const [isWizardOpen, setIsWizardOpen] = useState(false)

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
        <header className="flex items-center justify-between gap-4 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-white shadow-md">
              <ReceiptText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-mono text-xl font-bold uppercase tracking-[0.12em] text-ink">
                  Bilbil
                </h1>
                <span className="rounded bg-accentSoft px-1.5 py-0.5 font-mono text-[10px] font-bold text-accent">
                  v2.0
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted">Kalkulator patungan — catat, bagi, tagih.</p>
            </div>
          </div>
          <Link href="/history" className="button-secondary shrink-0 gap-1.5 px-3 py-2 text-xs">
            <History className="h-4 w-4" />
            <span>Riwayat</span>
          </Link>
        </header>

        {/* Step indicator: progress bar + status */}
        <nav className="card overflow-hidden border-accent/20 shadow-sm">
          <div className="grid grid-cols-3">
            {STEPS.map((item, i) => {
              const active = step === item.num
              const done = canOpenStep(item.num) && step > item.num
              const disabled = !canOpenStep(item.num)
              return (
                <button
                  key={item.num}
                  type="button"
                  onClick={() => openStep(item.num)}
                  disabled={disabled}
                  className={`relative px-3 py-3.5 text-left transition-all disabled:cursor-not-allowed sm:px-5 ${
                    i > 0 ? 'border-l border-rule' : ''
                  } ${
                    active
                      ? 'bg-accent text-white font-bold shadow-inner'
                      : done
                      ? 'bg-accentSoft text-ink hover:bg-accentSoft/80'
                      : disabled
                      ? 'text-faint bg-paper'
                      : 'text-muted hover:bg-paper2 hover:text-ink'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                        active
                          ? 'bg-white text-accent'
                          : done
                          ? 'bg-accent text-white'
                          : 'bg-rule2 text-muted'
                      }`}
                    >
                      {done ? '✓' : item.num}
                    </span>
                    <span className="font-mono text-xs font-bold uppercase tracking-[0.1em] sm:text-sm">
                      {item.title}
                    </span>
                  </div>
                  <span
                    className={`mt-1 block text-[11px] sm:text-xs ${
                      active ? 'text-white/80' : done ? 'text-accent' : 'text-faint'
                    }`}
                  >
                    {item.description}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Running counter bar */}
          {step !== 3 && (
            <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-1 border-t border-rule bg-paper2 px-4 py-2.5 font-mono text-xs">
              <div className="flex items-center gap-4">
                <span className="text-muted">
                  ORANG <span className="font-bold text-ink">{people.length}</span>
                </span>
                <span className="text-muted">
                  ITEM <span className="font-bold text-ink">{itemCount}</span>
                </span>
              </div>
              <div className="text-muted">
                SUBTOTAL <span className="ml-1 font-mono text-sm font-bold text-accent">{formatRp(runningTotal)}</span>
              </div>
            </div>
          )}
        </nav>

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
                          Pilih nama dari roster di samping, atau tekan “+ Orang baru” untuk orang yang cuma ikut
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

          {step === 3 && result && (
            <div className="space-y-5 animate-fade-in">
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
                {/* The printed receipt: summary of the whole split. */}
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

      {step !== 3 && (
        <div className="hidden sm:block fixed inset-x-0 bottom-0 z-40 border-t border-rule bg-paper/95 px-4 py-3 backdrop-blur-sm sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[1440px] gap-3">
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
                <button type="button" onClick={() => setStep(1)} className="button-secondary min-h-12 px-5">
                  ← Kembali
                </button>
                <button type="button" onClick={handleCalculate} className="button-primary min-h-12 flex-1">
                  Hitung pembagian
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Mobile Sticky Summary & Wizard */}
      <StickySummaryBar
        currentStep={step}
        totalItems={itemCount}
        totalPeople={people.length}
        totalAmount={runningTotal}
        onOpenStep={(targetStep) => {
          if (canOpenStep(targetStep)) {
            setStep(targetStep)
            setIsWizardOpen(true)
          }
        }}
      />

      <MobileWizard
        isOpen={isWizardOpen}
        setIsOpen={setIsWizardOpen}
        currentStep={step}
        setStep={setStep}
        canOpenStep={canOpenStep}
      >
        {step === 1 && (
          <div className="space-y-4">
            <PeopleProfiles
              profiles={profiles}
              people={people}
              onCreateProfile={handleCreateProfile}
              onRenameProfile={handleRenameProfile}
              onDeleteProfile={handleDeleteProfile}
              onAddProfileToSplit={addPerson}
              onAddManualPerson={addManualPerson}
            />
            {people.map((person, index) => (
              <PersonCard
                key={person.id}
                person={person}
                index={index}
                onUpdate={(updated) => updatePerson(index, updated)}
                onRemove={() => removePerson(index)}
                canRemove={people.length > 1}
              />
            ))}
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <FeeSettings feeConfig={feeConfig} onUpdate={setFeeConfig} />
            <AdditionalFees
              fees={feeConfig.additionalFees}
              onUpdate={(fees) => setFeeConfig({ ...feeConfig, additionalFees: fees })}
            />
          </div>
        )}
        {step === 3 && result && (
          <div className="space-y-4">
            <WhatsAppActions result={result} />
            <SplitDistributionBar results={result.results} total={result.totalFinal} />
            {result.results.map((item, index) => (
              <ResultCard key={item.person.id} result={item} index={index} grandTotal={result.totalFinal} />
            ))}
          </div>
        )}
      </MobileWizard>
    </div>
  )
}
