'use client'

import Link from 'next/link'
import { IoTimeOutline, IoCheckmark, IoPeopleOutline, IoArrowForward } from 'react-icons/io5'

export interface RailStep {
  num: number
  label: string
  hint: string
}

interface SideRailProps {
  steps: RailStep[]
  step: number
  canGoTo: (num: number) => boolean
  onStep: (num: number) => void
  peopleCount: number
  runningTotal: number
}

/**
 * Vertical navigation rail (desktop) / horizontal header (mobile handled in page).
 * Deep indigo surface holding brand, vertical stepper, and a live total panel.
 */
export default function SideRail({
  steps,
  step,
  canGoTo,
  onStep,
  peopleCount,
  runningTotal,
}: SideRailProps) {
  return (
    <aside className="hidden lg:flex flex-col w-72 shrink-0 bg-sidebar text-white sticky top-0 h-screen px-5 py-6">
      {/* Brand */}
      <div className="flex items-center gap-3 px-1">
        <div className="h-10 w-10 rounded-xl bg-white text-sidebar flex items-center justify-center font-mono font-black text-lg">
          B
        </div>
        <div>
          <h1 className="text-base font-extrabold leading-tight">Bayar Bareng</h1>
          <p className="text-[11px] text-white/50 leading-tight">Split bill workspace</p>
        </div>
      </div>

      {/* Vertical stepper */}
      <nav className="mt-9 flex flex-col gap-1.5">
        <p className="px-1 mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
          Workflow
        </p>
        {steps.map((s) => {
          const isActive = step === s.num
          const isDone = step > s.num
          const reachable = canGoTo(s.num)
          return (
            <button
              key={s.num}
              onClick={() => reachable && onStep(s.num)}
              disabled={!reachable}
              className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-all ${
                isActive
                  ? 'bg-white text-sidebar'
                  : reachable
                  ? 'text-white/70 hover:bg-sidebarHi hover:text-white'
                  : 'text-white/35 cursor-not-allowed'
              }`}
            >
              <span
                className={`flex items-center justify-center h-7 w-7 rounded-lg text-xs font-bold flex-shrink-0 ${
                  isActive
                    ? 'bg-accent text-white'
                    : isDone
                    ? 'bg-accent text-white'
                    : 'bg-white/10 text-white/60 group-hover:bg-white/20'
                }`}
              >
                {isDone ? <IoCheckmark className="w-4 h-4" /> : s.num}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold leading-tight">{s.label}</span>
                <span
                  className={`block text-[11px] leading-tight ${
                    isActive ? 'text-sidebar/60' : 'text-white/40'
                  }`}
                >
                  {s.hint}
                </span>
              </span>
            </button>
          )
        })}
      </nav>

      {/* Live total panel */}
      <div className="mt-auto space-y-3">
        <div className="rounded-2xl bg-sidebarHi/70 border border-white/10 p-4">
          <div className="flex items-center gap-2 text-white/50 text-[11px] font-semibold uppercase tracking-wider">
            <IoPeopleOutline className="w-4 h-4" />
            Running total
          </div>
          <p className="mt-2 font-mono text-2xl font-extrabold">
            Rp{runningTotal.toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-white/50 mt-0.5">
            {peopleCount} {peopleCount === 1 ? 'person' : 'people'} in split
          </p>
        </div>

        <Link
          href="/history"
          className="flex items-center justify-between gap-2 rounded-xl px-4 py-3 bg-sidebarHi/50 hover:bg-sidebarHi text-white/80 hover:text-white text-sm font-semibold transition-all border border-white/5"
        >
          <span className="flex items-center gap-2">
            <IoTimeOutline className="w-4 h-4" />
            History
          </span>
          <IoArrowForward className="w-4 h-4 opacity-60" />
        </Link>
      </div>
    </aside>
  )
}
