'use client'

import { formatRp } from '@/lib/item-display'
import { ArrowRight } from 'lucide-react'

interface StickySummaryBarProps {
  currentStep: number
  totalItems: number
  totalPeople: number
  totalAmount: number
  onOpenStep: (step: number) => void
}

export default function StickySummaryBar({
  currentStep,
  totalItems,
  totalPeople,
  totalAmount,
  onOpenStep,
}: StickySummaryBarProps) {
  const getCtaText = () => {
    if (currentStep === 1) return 'Lanjut: Sesuaikan'
    if (currentStep === 2) return 'Lanjut: Tagih'
    return 'Lihat Nota'
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-rule bg-white/95 p-3 shadow-lg backdrop-blur-md md:hidden">
      <div className="mx-auto flex items-center justify-between gap-3 max-w-md">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <span className="font-mono font-medium">{totalPeople} orang</span>
            <span>•</span>
            <span className="font-mono font-medium">{totalItems} pesanan</span>
          </div>
          <div className="font-mono text-base font-bold text-accent">
            {formatRp(totalAmount)}
          </div>
        </div>

        <button
          onClick={() => onOpenStep(currentStep < 3 ? currentStep + 1 : 3)}
          className="button-accent flex items-center gap-2 rounded-md px-4 py-2.5 text-xs shadow-md active:scale-95"
        >
          <span>{getCtaText()}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
