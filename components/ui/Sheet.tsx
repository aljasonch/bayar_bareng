'use client'

import { Drawer } from 'vaul'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
}

export default function Sheet({ open, onOpenChange, title, description, children }: Props) {
  // The drawer portals to <body>, outside the page wrapper, so copy the page theme onto it.
  const theme = typeof document === 'undefined' ? undefined : document.querySelector('[data-theme]')?.getAttribute('data-theme') ?? undefined
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <div data-theme={theme} className="contents">
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/30" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[88vh] max-w-lg flex-col rounded-t-[1.75rem] bg-surface text-ink outline-none">
          <div className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-line" />
          <div className="px-5 pb-2 pt-4">
            <Drawer.Title className="text-lg font-semibold">{title}</Drawer.Title>
            {description ? (
              <Drawer.Description className="mt-0.5 text-sm text-muted">{description}</Drawer.Description>
            ) : (
              <Drawer.Description className="sr-only">{title}</Drawer.Description>
            )}
          </div>
          <div className="overflow-y-auto px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">{children}</div>
        </Drawer.Content>
        </div>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
