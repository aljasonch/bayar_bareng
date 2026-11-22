'use client'

import { useEffect, useMemo, useReducer, useState, useSyncExternalStore, type Dispatch, type ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import FeesEditor from '@/components/flow/FeesEditor'
import PromoPicker from '@/components/flow/PromoPicker'
import BillMeta from '@/components/flow/BillMeta'
import ResultView from '@/components/flow/ResultView'
import { billReducer, initialBill, type BillAction } from '@/lib/bill/reducer'
import { computeBill } from '@/lib/bill/compute'
import { validateBill, type BillValidation } from '@/lib/bill/validate'
import { formatRp } from '@/lib/money'
import { clearDraft, loadDraft, saveDraft } from '@/lib/storage/draft'
import type { Bill, BillMode, BillTotals, PromoCombo } from '@/lib/types'

export type FlowCtx = {
  bill: Bill
  dispatch: Dispatch<BillAction>
  totals: BillTotals
  validation: BillValidation
  goTo: (step: Step) => void
}

const noop = () => () => {}

export type Step = 'items' | 'promo' | 'result'

const STEPS: { id: Step; label: string }[] = [
  { id: 'items', label: 'Pesanan' },
  { id: 'promo', label: 'Promo & biaya' },
  { id: 'result', label: 'Tagihan' },
]

type Props = {
  mode: BillMode
  title: ReactNode
  headerClassName?: string
  combos?: PromoCombo[]
  itemsStep: (ctx: FlowCtx) => ReactNode
}

export default function SplitFlow({ mode, title, headerClassName = '', combos, itemsStep }: Props) {
  // The draft (sessionStorage) brings the bill back after a reload or an accidental back gesture.
  const [bill, dispatch] = useReducer(billReducer, mode, (m: BillMode) => loadDraft(m)?.bill ?? initialBill(m))
  const [step, setStep] = useState<Step>(() => loadDraft(mode)?.step ?? 'items')
  const totals = useMemo(() => computeBill(bill), [bill])
  const validation = useMemo(() => validateBill(bill), [bill])

  useEffect(() => {
    if (bill.people.length || bill.items.length) saveDraft({ bill, step })
    else clearDraft(bill.mode)
  }, [bill, step])

  // Each forward step gets a history entry, so the phone's back gesture goes back one step instead of leaving.
  useEffect(() => {
    const onPop = (e: PopStateEvent) => setStep((e.state?.bilbilStep as Step | undefined) ?? 'items')
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const goTo = (s: Step) => {
    if (STEPS.findIndex((x) => x.id === s) > STEPS.findIndex((x) => x.id === step)) history.pushState({ bilbilStep: s }, '')
    setStep(s)
    window.scrollTo({ top: 0 })
  }
  const ctx: FlowCtx = { bill, dispatch, totals, validation, goTo }
  const stepIndex = STEPS.findIndex((s) => s.id === step)
  // Client-only: the bill uses random ids, today's date and localStorage, none of which exist on the server.
  const mounted = useSyncExternalStore(noop, () => true, () => false)
  if (!mounted) return null

  return (
    <div className="pb-32">
      <header className={headerClassName}>
        <div className="mx-auto max-w-lg px-5 pt-5">
          <div className="flex items-center gap-2">
            {step === 'items' ? (
              <Link href="/" className="-ml-2 rounded-full p-2 opacity-80 hover:opacity-100" aria-label="Kembali ke beranda">
                <ArrowLeft size={20} />
              </Link>
            ) : (
              <button type="button" onClick={() => goTo(STEPS[stepIndex - 1].id)} className="-ml-2 rounded-full p-2 opacity-80 hover:opacity-100" aria-label="Langkah sebelumnya">
                <ArrowLeft size={20} />
              </button>
            )}
            <div className="text-lg font-semibold">{title}</div>
          </div>
          <nav aria-label="Langkah" className="mt-4 flex gap-1.5 pb-5">
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                type="button"
                disabled={i > stepIndex}
                onClick={() => goTo(s.id)}
                aria-current={s.id === step ? 'step' : undefined}
                className="flex-1 text-left disabled:cursor-default"
              >
                <span className={`block h-1 rounded-full transition-colors ${i <= stepIndex ? 'bg-current' : 'bg-current opacity-20'}`} />
                <span className={`mt-1.5 block text-xs ${s.id === step ? 'font-medium' : 'opacity-60'}`}>{s.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-5 pt-5">
        {step === 'items' && itemsStep(ctx)}
        {step === 'promo' && (
          <div className="space-y-8">
            {combos ? (
              <>
                <PromoPicker {...ctx} combos={combos} />
                <FeesEditor {...ctx} />
              </>
            ) : (
              <>
                <FeesEditor {...ctx} />
                <PromoPicker {...ctx} />
              </>
            )}
            <BillMeta {...ctx} />
          </div>
        )}
        {step === 'result' && (
          <ResultView
            bill={bill}
            totals={totals}
            onReset={() => {
              dispatch({ type: 'reset' })
              goTo('items')
            }}
          />
        )}
      </main>

      {step !== 'result' && (
        <div className="sticky-bar">
          <div className="mx-auto flex max-w-lg items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-xs text-muted">
                {bill.people.length} orang · {bill.items.length} item
              </div>
              <div className="num text-lg font-semibold">{formatRp(totals.paid)}</div>
            </div>
            {step === 'items' ? (
              <button type="button" className="btn-primary min-h-12" disabled={!validation.ok} onClick={() => goTo('promo')}>
                {validation.ok ? 'Lanjut ke promo' : validation.errors[0]}
              </button>
            ) : (
              <button type="button" className="btn-primary min-h-12" disabled={!validation.ok} onClick={() => goTo('result')}>
                Lihat tagihan
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
