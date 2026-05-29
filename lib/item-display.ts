import { Item, ItemModifier } from '@/types'

export function formatRp(amount: number): string {
  return 'Rp' + amount.toLocaleString('id-ID')
}

export function getItemQuantity(item: Item): number {
  return Math.max(1, item.quantity ?? 1)
}

export function getItemUnitPrice(item: Item): number {
  if (item.unitPrice !== undefined) return item.unitPrice

  const quantity = getItemQuantity(item)
  return quantity > 1 ? Math.round(item.price / quantity) : item.price
}

export function getItemLabel(item: Item): string {
  return item.selectedSize ? `${item.name} (${item.selectedSize})` : item.name
}

function groupModifiers(modifiers: ItemModifier[] = [], type: ItemModifier['type']): ItemModifier[] {
  return modifiers.filter((modifier) => modifier.type === type)
}

function formatModifierList(label: string, modifiers: ItemModifier[]): string | null {
  if (modifiers.length === 0) return null

  const names = modifiers
    .map((modifier) => `${modifier.name} +${formatRp(modifier.price)}`)
    .join(', ')

  return `${label}: ${names}`
}

export function getItemDetailLines(item: Item): string[] {
  const lines: string[] = []
  const quantity = getItemQuantity(item)
  const unitPrice = getItemUnitPrice(item)

  if (quantity > 1 || item.unitPrice !== undefined) {
    lines.push(`${quantity} x ${formatRp(unitPrice)}`)
  }

  if (item.basePrice !== undefined) {
    const outletAdjustment = item.outletAdjustment ?? 0
    const adjustmentText = outletAdjustment > 0 ? ` + mall ${formatRp(outletAdjustment)}` : ''
    lines.push(`Base: ${formatRp(item.basePrice)}${adjustmentText}`)
  }

  const upgradeLine = formatModifierList('Upgrade', groupModifiers(item.modifiers, 'upgrade'))
  const syrupLine = formatModifierList('Syrup', groupModifiers(item.modifiers, 'syrup'))
  const addonLine = formatModifierList('Add-ons', groupModifiers(item.modifiers, 'addon'))

  if (upgradeLine) lines.push(upgradeLine)
  if (syrupLine) lines.push(syrupLine)
  if (addonLine) lines.push(addonLine)

  if (item.sweetness) lines.push(`Sweetness: ${item.sweetness}`)
  if (item.iceLevel) lines.push(`Ice: ${item.iceLevel}`)

  return lines
}
