'use client'

import { PersonResult } from '@/types'
import {
  HiOutlineTag,
  HiOutlineTruck,
  HiOutlineClipboardDocumentList,
  HiOutlineGift,
} from 'react-icons/hi2'

interface ResultCardProps {
  result: PersonResult
  index: number
}

export default function ResultCard({ result, index }: ResultCardProps) {
  return (
    <div
      className="animate-slide-up rounded-xl border border-white/10 bg-white/5 p-4 sm:p-6 transition-all duration-200 hover:border-brand/30"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-brand to-orange-600 flex items-center justify-center font-bold text-sm sm:text-base text-white shadow-lg shadow-brand/20">
          {index + 1}
        </div>
        <h3 className="text-base sm:text-lg font-bold text-zinc-100">{result.person.name || `Person ${index + 1}`}</h3>
      </div>

      {/* Items */}
      <div className="space-y-1.5 mb-3 pb-3 border-b border-white/5">
        {result.person.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-zinc-400 truncate mr-2">{item.name || 'Unnamed'}</span>
            <span className="font-mono text-zinc-300 flex-shrink-0">Rp{item.price.toLocaleString('id-ID')}</span>
          </div>
        ))}
      </div>

      {/* Breakdown */}
      <div className="space-y-1.5 text-sm mb-3">
        <div className="flex justify-between">
          <span className="text-zinc-400">Subtotal</span>
          <span className="font-mono text-zinc-300">Rp{result.subtotal.toLocaleString('id-ID')}</span>
        </div>
        {result.discountSaved > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <HiOutlineTag className="w-3.5 h-3.5 text-teal-400" />
              Discount
            </span>
            <span className="font-mono text-teal-400">-Rp{result.discountSaved.toLocaleString('id-ID')}</span>
          </div>
        )}
        {result.deliveryShare > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <HiOutlineTruck className="w-3.5 h-3.5 text-blue-400" />
              Delivery
            </span>
            <span className="font-mono text-zinc-300">+Rp{result.deliveryShare.toLocaleString('id-ID')}</span>
          </div>
        )}
        {result.additionalFeesShare > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <HiOutlineClipboardDocumentList className="w-3.5 h-3.5 text-amber-400" />
              Add. Fees
            </span>
            <span className="font-mono text-zinc-300">+Rp{result.additionalFeesShare.toLocaleString('id-ID')}</span>
          </div>
        )}
        {result.cashbackSaved > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <HiOutlineGift className="w-3.5 h-3.5 text-purple-400" />
              Cashback
            </span>
            <span className="font-mono text-teal-400">-Rp{result.cashbackSaved.toLocaleString('id-ID')}</span>
          </div>
        )}
      </div>

      {/* Final amount */}
      <div className="pt-3 border-t border-white/10 flex justify-between items-center">
        <span className="text-sm font-semibold text-zinc-300">Total to Pay</span>
        <span className="text-lg sm:text-xl font-bold font-mono text-brand">
          Rp{result.final.toLocaleString('id-ID')}
        </span>
      </div>
    </div>
  )
}
