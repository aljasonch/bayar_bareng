import type { BillResult } from '@/types'

type BillDateSource = Pick<BillResult, 'createdAt' | 'splitDate'>

const DEFAULT_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}

function toLocalDateInputValue(date: Date): string {
  const timezoneOffsetMs = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 10)
}

export function getTodayDateInputValue(): string {
  return toLocalDateInputValue(new Date())
}

export function normalizeSplitDate(splitDate?: string): string {
  if (!splitDate) return getTodayDateInputValue()

  const parsed = new Date(`${splitDate}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) {
    return getTodayDateInputValue()
  }

  return splitDate
}

export function getBillDate(source: BillDateSource): Date {
  if (source.splitDate) {
    const splitDate = new Date(`${source.splitDate}T00:00:00`)
    if (!Number.isNaN(splitDate.getTime())) {
      return splitDate
    }
  }

  return new Date(source.createdAt)
}

export function formatBillDate(
  source: BillDateSource,
  options: Intl.DateTimeFormatOptions = DEFAULT_DATE_FORMAT
): string {
  return getBillDate(source).toLocaleDateString('id-ID', options)
}
