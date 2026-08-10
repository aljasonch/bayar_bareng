'use client'

import React from 'react'
import { BillResult } from '@/types'
import { formatBillDate } from '@/lib/date'
import { formatOutletName } from '@/lib/kopi-kenangan'
import { formatRp, getItemLabel } from '@/lib/item-display'
import BilbilLogo from '@/components/BilbilLogo'

interface DigitalReceiptProps {
  result: BillResult
  saved?: boolean
  className?: string
}

export default function DigitalReceipt({
  result,
  saved = false,
  className = '',
}: DigitalReceiptProps) {
  const totalItemCount = result.people.reduce(
    (sum, p) => sum + p.items.reduce((iSum, item) => iSum + (item.quantity || 1), 0),
    0
  )

  return (
    <div className={`receipt-frame ${className}`}>
      {/* Main receipt body */}
      <div className="relative rounded-t-sm border border-b-0 border-rule2/80 bg-white p-5 sm:p-6 shadow-receipt text-ink">
        {/* Header */}
        <div className="text-center space-y-1.5 pb-3">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-sm bg-ink text-paper mb-0.5">
            <BilbilLogo className="h-5 w-5" />
          </div>
          <h3 className="font-mono text-base font-bold uppercase tracking-[0.2em] text-ink leading-tight">
            Bilbil
          </h3>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            Nota Digital Pembagian
          </p>
          <p className="font-mono text-[10px] text-faint">
            REF: #{result.id.slice(0, 8).toUpperCase()}
          </p>
        </div>

        {/* Info Meta */}
        <div className="perforation mt-3 space-y-1 pt-3 font-mono text-xs text-muted">
          <div className="flex justify-between gap-2">
            <span>TANGGAL</span>
            <span className="font-semibold text-ink2">{formatBillDate(result)}</span>
          </div>

          {result.billMode === 'kopiKenangan' && (
            <div className="flex justify-between gap-2">
              <span>STORE</span>
              <span className="font-semibold text-ink2">
                Kopi Kenangan ({formatOutletName(result.kopiKenanganOutlet)})
              </span>
            </div>
          )}

          {result.payerName && (
            <div className="flex justify-between gap-2">
              <span>DITALANGI</span>
              <span className="font-semibold text-ink2">
                {result.payerName}
                {result.payerAccountNumber ? ` (${result.payerAccountNumber})` : ''}
              </span>
            </div>
          )}

          <div className="flex justify-between gap-2">
            <span>PESERTA</span>
            <span className="text-ink2 font-medium">
              {result.people.length} orang ({totalItemCount} item)
            </span>
          </div>
        </div>

        {/* Detailed items per person */}
        <div className="perforation mt-3.5 space-y-3 pt-3.5">
          <p className="label text-[10px] text-muted">Rincian Pesanan</p>
          {result.results.map((item, index) => (
            <div key={item.person.id} className="space-y-1 font-mono text-xs">
              <div className="flex items-baseline justify-between font-semibold">
                <span className="text-ink">
                  {index + 1}. {item.person.name || `Orang ${index + 1}`}
                </span>
                <span className="text-ink">{formatRp(item.final)}</span>
              </div>

              {/* Sub items */}
              {item.person.items.length > 0 && (
                <div className="pl-3.5 space-y-0.5 text-[11px] text-muted">
                  {item.person.items.map((subItem) => (
                    <div key={subItem.id} className="flex items-center justify-between gap-2">
                      <span className="truncate text-ink3">
                        {subItem.quantity && subItem.quantity > 1 ? `${subItem.quantity}x ` : ''}
                        {getItemLabel(subItem)}
                      </span>
                      <span className="shrink-0 text-faint">{formatRp(subItem.price)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Cost adjustment summary for person */}
              {(item.discountSaved > 0 || item.cashbackSaved > 0 || item.deliveryShare > 0 || item.additionalFeesShare > 0) && (
                <div className="pl-3.5 flex flex-wrap gap-x-2 text-[10px] text-faint">
                  {item.discountSaved > 0 && (
                    <span className="text-stamp">Diskon -{formatRp(item.discountSaved)}</span>
                  )}
                  {item.cashbackSaved > 0 && (
                    <span className="text-stamp">CB -{formatRp(item.cashbackSaved)}</span>
                  )}
                  {item.deliveryShare > 0 && (
                    <span>Ongkir +{formatRp(item.deliveryShare)}</span>
                  )}
                  {item.additionalFeesShare > 0 && (
                    <span>Biaya +{formatRp(item.additionalFeesShare)}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Fee & Discount summary if any */}
        {(result.feeConfig.discountPct > 0 ||
          result.feeConfig.deliveryFee > 0 ||
          result.feeConfig.additionalFees.length > 0 ||
          result.feeConfig.cashbackPct > 0) && (
          <div className="perforation mt-3 space-y-1 pt-3 font-mono text-xs">
            {result.feeConfig.deliveryFee > 0 && (
              <div className="flex justify-between text-muted">
                <span>Ongkos Kirim</span>
                <span>+{formatRp(result.feeConfig.deliveryFee)}</span>
              </div>
            )}
            {result.feeConfig.additionalFees.map((fee) => (
              <div key={fee.id} className="flex justify-between text-muted">
                <span>{fee.name || 'Biaya Tambahan'}</span>
                <span>+{formatRp(fee.amount)}</span>
              </div>
            ))}
            {result.totalSaved > 0 && (
              <div className="flex justify-between font-semibold text-stamp">
                <span>Total Hemat / Diskon</span>
                <span>-{formatRp(result.totalSaved)}</span>
              </div>
            )}
          </div>
        )}

        {/* Total section */}
        <div className="rule-total mt-4 pt-3.5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-ink">
              Total Tagihan
            </span>
            <span className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-ink">
              {formatRp(result.totalFinal)}
            </span>
          </div>
        </div>

        {/* Stamp & Footer details */}
        <div className="mt-4 flex min-h-12 items-center justify-between gap-3 pt-2">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-faint leading-relaxed">
            Terima Kasih • Patungan Tanpa Salah Hitung
          </p>
          {saved && <span className="stamp animate-stamp-in shrink-0">Tersimpan</span>}
        </div>

        {/* Barcode visual */}
        <div className="mt-4 flex flex-col items-center gap-1 opacity-75">
          <div
            className="h-7 w-48 max-w-full"
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg, #1c1917 0, #1c1917 2px, transparent 2px, transparent 4px, #1c1917 4px, #1c1917 7px, transparent 7px, transparent 8px, #1c1917 8px, #1c1917 11px, transparent 11px, transparent 13px)',
            }}
          />
          <span className="font-mono text-[9px] tracking-[0.22em] text-faint">
            BILBIL-SPLIT-{result.id.slice(0, 6).toUpperCase()}
          </span>
        </div>
      </div>

      {/* Jagged / Sawtooth tear bottom edge */}
      <div className="w-full overflow-hidden leading-none drop-shadow-sm -mt-px">
        <svg
          className="w-full h-3.5 text-white fill-current block"
          viewBox="0 0 100 10"
          preserveAspectRatio="none"
        >
          <path d="M0,0 L0,10 L3.125,0 L6.25,10 L9.375,0 L12.5,10 L15.625,0 L18.75,10 L21.875,0 L25,10 L28.125,0 L31.25,10 L34.375,0 L37.5,10 L40.625,0 L43.75,10 L46.875,0 L50,10 L53.125,0 L56.25,10 L59.375,0 L62.5,10 L65.625,0 L68.75,10 L71.875,0 L75,10 L78.125,0 L81.25,10 L84.375,0 L87.5,10 L90.625,0 L93.75,10 L96.875,0 L100,10 L100,0 Z" />
        </svg>
      </div>
    </div>
  )
}
