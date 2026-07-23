'use client'

import { Drawer } from 'vaul'
import { ChevronLeft, X, CheckCircle2, UserPlus, SlidersHorizontal, Receipt } from 'lucide-react'

interface MobileWizardProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  currentStep: number
  setStep: (step: number) => void
  canOpenStep: (step: number) => boolean
  children: React.ReactNode
}

const STEPS = [
  { id: 1, name: 'Catat', desc: 'Orang & Pesanan', icon: UserPlus },
  { id: 2, name: 'Sesuaikan', desc: 'Diskon & Biaya', icon: SlidersHorizontal },
  { id: 3, name: 'Tagih', desc: 'Hasil & Share', icon: Receipt },
]

export default function MobileWizard({
  isOpen,
  setIsOpen,
  currentStep,
  setStep,
  canOpenStep,
  children,
}: MobileWizardProps) {
  return (
    <Drawer.Root open={isOpen} onOpenChange={setIsOpen}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex max-h-[92vh] flex-col rounded-t-2xl bg-paper shadow-2xl outline-none">
          {/* Drag Handle */}
          <div className="flex items-center justify-between border-b border-rule px-4 py-3">
            <div className="flex items-center gap-2">
              {currentStep > 1 && (
                <button
                  onClick={() => setStep(currentStep - 1)}
                  className="icon-button -ml-1 text-ink"
                  aria-label="Kembali"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent">
                  Langkah {currentStep} dari 3
                </span>
                <h3 className="font-mono text-sm font-bold uppercase text-ink">
                  {STEPS[currentStep - 1].name} — {STEPS[currentStep - 1].desc}
                </h3>
              </div>
            </div>

            {/* Step indicators dots */}
            <div className="flex items-center gap-1.5">
              {STEPS.map((s) => {
                const isActive = s.id === currentStep
                const isDone = s.id < currentStep
                return (
                  <button
                    key={s.id}
                    disabled={!canOpenStep(s.id)}
                    onClick={() => setStep(s.id)}
                    className={`h-2 rounded-full transition-all ${
                      isActive
                        ? 'w-6 bg-accent'
                        : isDone
                        ? 'w-2 bg-accent/40'
                        : 'w-2 bg-rule2'
                    }`}
                  />
                )
              })}
              <button
                onClick={() => setIsOpen(false)}
                className="icon-button ml-2 text-muted hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Swipe indicator bar */}
          <div className="flex justify-center pt-2">
            <div className="h-1 w-12 rounded-full bg-rule2" />
          </div>

          {/* Drawer content scrollable */}
          <div className="flex-1 overflow-y-auto p-4 pb-20">
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
