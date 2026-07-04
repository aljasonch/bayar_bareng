'use client'

import { useEffect, useState } from 'react'
import { BillResult } from '@/types'
import { generateWhatsAppText, getWhatsAppUrl } from '@/lib/whatsapp'
import { IoCheckmark, IoCopyOutline, IoLogoWhatsapp } from 'react-icons/io5'

type CopyState = 'idle' | 'copied' | 'failed'

interface WhatsAppActionsProps {
  result: BillResult
  className?: string
  copyClassName?: string
  whatsappClassName?: string
}

async function copyTextToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  textarea.style.top = '0'
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()

  const copied = document.execCommand('copy')
  document.body.removeChild(textarea)

  if (!copied) {
    throw new Error('Copy command failed')
  }
}

/**
 * The natural end of the flow: send the breakdown to the group chat.
 * Opening WhatsApp with the prefilled message is the primary action;
 * copying the text is the fallback.
 */
export default function WhatsAppActions({
  result,
  className = 'grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]',
  copyClassName = 'button-secondary min-h-12',
  whatsappClassName = 'button-wa',
}: WhatsAppActionsProps) {
  const [copyState, setCopyState] = useState<CopyState>('idle')

  useEffect(() => {
    if (copyState === 'idle') return

    const timeoutId = window.setTimeout(() => setCopyState('idle'), 2200)
    return () => window.clearTimeout(timeoutId)
  }, [copyState])

  const handleCopy = async () => {
    try {
      await copyTextToClipboard(generateWhatsAppText(result))
      setCopyState('copied')
    } catch {
      setCopyState('failed')
    }
  }

  return (
    <div className={className}>
      <a
        href={getWhatsAppUrl(result)}
        target="_blank"
        rel="noopener noreferrer"
        className={whatsappClassName}
      >
        <IoLogoWhatsapp className="h-5 w-5" />
        Kirim via WhatsApp
      </a>
      <button type="button" onClick={handleCopy} className={copyClassName}>
        {copyState === 'copied' ? <IoCheckmark className="h-4 w-4" /> : <IoCopyOutline className="h-4 w-4" />}
        {copyState === 'copied' ? 'Tersalin' : 'Salin pesan'}
      </button>
      {copyState === 'failed' && (
        <p className="text-xs text-stamp sm:col-span-2">
          Gagal menyalin otomatis. Pakai tombol “Kirim via WhatsApp” saja.
        </p>
      )}
    </div>
  )
}
