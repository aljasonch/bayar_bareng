'use client'

import { useEffect, useState } from 'react'
import { BillResult } from '@/types'
import { generateWhatsAppText, getWhatsAppUrl } from '@/lib/whatsapp'
import { IoCheckmarkCircle, IoCopyOutline, IoLogoWhatsapp } from 'react-icons/io5'

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

export default function WhatsAppActions({
  result,
  className = 'grid grid-cols-1 gap-3 sm:grid-cols-2',
  copyClassName = 'button-primary bg-whatsapp hover:bg-whatsappDark',
  whatsappClassName = 'button-secondary',
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
      <button type="button" onClick={handleCopy} className={copyClassName}>
        {copyState === 'copied' ? (
          <IoCheckmarkCircle className="h-5 w-5" />
        ) : (
          <IoCopyOutline className="h-5 w-5" />
        )}
        {copyState === 'copied' ? 'Copied WA message' : 'Copy WA message'}
      </button>
      <a
        href={getWhatsAppUrl(result)}
        target="_blank"
        rel="noopener noreferrer"
        className={whatsappClassName}
      >
        <IoLogoWhatsapp className="h-5 w-5" />
        Open WhatsApp
      </a>
      {copyState === 'failed' && (
        <p className="text-xs text-danger sm:col-span-2">
          Could not copy automatically. Try opening WhatsApp instead.
        </p>
      )}
    </div>
  )
}
