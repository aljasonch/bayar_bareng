'use client'

import { useState, type CSSProperties } from 'react'
import { Check, MessageCircle, RotateCcw } from 'lucide-react'
import BilbilLogo from '@/components/BilbilLogo'
import PersonChip from '@/components/ui/PersonChip'
import { getPersonColor } from '@/lib/colors'
import { formatRp } from '@/lib/money'
import { formatBillDate, whatsappUrl } from '@/lib/bill/whatsapp'
import { saveToHistory } from '@/lib/storage/history'
import type { Bill, BillTotals } from '@/lib/types'

type Props = { bill: Bill; totals: BillTotals; onReset?: () => void }

/** Final split: receipt, proportion bar, per-person breakdown, WhatsApp and save. Also used by history. */
export default function ResultView({ bill, totals, onReset }: Props) {
  const [saved, setSaved] = useState(false)
  const sum = totals.perPerson.reduce((s, p) => s + p.final, 0)
  const saving = totals.appDiscount + totals.paymentDiscount + totals.cashback

  return (
    <div className="space-y-5">
      <div className="card-receipt anim-rise">
        <div className="flex items-center gap-2 text-sm text-muted">
          <BilbilLogo className="h-5 w-5 text-accent" />
          <span>{formatBillDate(bill.date)}</span>
          {bill.mode === 'kopken' && <span className="ml-auto">{bill.outlet === 'mall' ? 'Mall store' : 'Normal store'}</span>}
        </div>
        <div className="mt-4 text-sm text-muted">Total ditagih</div>
        <div className="num text-4xl font-semibold tracking-tight">{formatRp(sum)}</div>
        {saving > 0 && <div className="mt-1 text-sm text-accent">Hemat {formatRp(saving)} dari promo</div>}
        {bill.payerName && (
          <div className="mt-3 text-sm">
            Transfer ke <span className="font-medium">{bill.payerName}</span>
            {bill.payerAccount && <span className="num text-muted"> · {bill.payerAccount}</span>}
          </div>
        )}

        <div className="mt-5 flex h-3 gap-0.5 overflow-hidden rounded-full" aria-hidden>
          {totals.perPerson.map((p, i) => (
            <span key={p.personId} className="anim-grow h-full" style={{ '--stagger': i, flex: Math.max(p.final, 0), background: getPersonColor(i).base } as CSSProperties} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <a href={whatsappUrl(bill, totals)} target="_blank" rel="noreferrer" className="btn-wa">
          <MessageCircle size={18} /> Kirim WA
        </a>
        <button
          type="button"
          className="btn-secondary min-h-12"
          disabled={saved}
          onClick={() => {
            saveToHistory({ bill, totals })
            setSaved(true)
          }}
        >
          {saved ? (
            <>
              <Check size={16} /> Tersimpan
            </>
          ) : (
            'Simpan ke riwayat'
          )}
        </button>
      </div>

      <ul className="space-y-3">
        {bill.people.map((person, i) => {
          const share = totals.perPerson[i]
          const items = bill.items.filter((it) => it.assignees.includes(person.id))
          return (
            <li key={person.id} className="card anim-rise p-4" style={{ '--stagger': i + 2 } as CSSProperties}>
              <div className="flex items-center gap-2.5">
                <PersonChip name={person.name} index={i} />
                <span className="flex-1 font-medium">{person.name}</span>
                <span className="num text-lg font-semibold">{formatRp(share.final)}</span>
              </div>
              <ul className="mt-3 space-y-1 text-sm">
                {items.map((it) => (
                  <li key={it.id} className="flex justify-between gap-3 text-muted">
                    <span className="truncate">
                      {it.name}
                      {it.assignees.length > 1 && ` (1/${it.assignees.length})`}
                    </span>
                    <span className="num">{formatRp(Math.round(it.price / it.assignees.length))}</span>
                  </li>
                ))}
                {share.appDiscount > 0 && <Line label="Promo aplikasi" value={-share.appDiscount} />}
                {share.fees > 0 && <Line label="Ongkir & biaya" value={share.fees} />}
                {share.paymentDiscount > 0 && <Line label="Promo pembayaran" value={-share.paymentDiscount} />}
                {share.cashback > 0 && <Line label="Cashback" value={-share.cashback} />}
              </ul>
            </li>
          )
        })}
      </ul>

      {onReset && (
        <button type="button" className="btn-ghost w-full" onClick={onReset}>
          <RotateCcw size={16} /> Nota baru
        </button>
      )}
    </div>
  )
}

function Line({ label, value }: { label: string; value: number }) {
  return (
    <li className="flex justify-between text-muted">
      <span>{label}</span>
      <span className="num">
        {value < 0 ? '-' : '+'}
        {formatRp(Math.abs(value))}
      </span>
    </li>
  )
}
