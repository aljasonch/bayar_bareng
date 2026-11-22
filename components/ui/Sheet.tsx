'use client'

import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
}

export default function Sheet({ open, onOpenChange, title, description, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) el.showModal()
    else if (!open && el.open) el.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className="sheet-dialog"
      onCancel={(e) => {
        e.preventDefault()
        onOpenChange(false)
      }}
      onClick={(e) => e.target === ref.current && onOpenChange(false)}
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-line" />
        <div className="flex items-start justify-between gap-3 px-5 pb-2 pt-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold">
              {title}
            </h2>
            {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
          </div>
          <button type="button" className="-mr-1 rounded-full p-1.5 text-muted hover:text-ink" onClick={() => onOpenChange(false)} aria-label="Tutup">
            <X size={18} />
          </button>
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </dialog>
  )
}
