'use client'

import { useMemo, useState } from 'react'
import {
  IoAdd,
  IoBagAddOutline,
  IoClose,
  IoRemove,
  IoSearch,
  IoStorefrontOutline,
  IoTrashOutline,
} from 'react-icons/io5'
import {
  IceLevelOption,
  Item,
  KopiKenanganOutlet,
  KopiKenanganSize,
  Person,
  SweetnessOption,
} from '@/types'
import {
  getAvailableSizes,
  getOutletAdjustment,
  KOPI_KENANGAN_CATEGORIES,
  KOPI_KENANGAN_MENU,
  KOPI_KENANGAN_MODIFIER_GROUPS,
  KOPI_KENANGAN_SIZES,
  SWEETNESS_OPTIONS,
  ICE_LEVEL_OPTIONS,
  KopiKenanganCatalogItem,
  KopiKenanganCategory,
} from '@/lib/kopi-kenangan'
import { formatRp, getItemDetailLines, getItemLabel, getItemUnitPrice } from '@/lib/item-display'
import { getPersonColor } from '@/lib/colors'

interface KopiKenanganOrderProps {
  people: Person[]
  outlet: KopiKenanganOutlet
  onOutletChange: (outlet: KopiKenanganOutlet) => void
  onAddPerson: () => void
  onUpdatePerson: (index: number, person: Person) => void
  onRemovePerson: (index: number) => void
}

type CategoryFilter = 'All' | KopiKenanganCategory

const ALL_MODIFIERS = KOPI_KENANGAN_MODIFIER_GROUPS.flatMap((group) => group.items)

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

function getItemSearchText(item: KopiKenanganCatalogItem): string {
  return `${item.name} ${item.category}`.toLowerCase()
}

function QuantityControl({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const safeValue = Math.max(1, value)

  return (
    <div className="inline-grid grid-cols-[2.25rem_3rem_2.25rem] h-10 rounded-lg border border-line2 bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, safeValue - 1))}
        className="flex items-center justify-center text-muted hover:text-ink hover:bg-surface2 transition-colors"
        aria-label="Decrease quantity"
      >
        <IoRemove className="w-4 h-4" />
      </button>
      <input
        type="number"
        min={1}
        value={safeValue}
        onChange={(event) => onChange(Math.max(1, Number(event.target.value) || 1))}
        className="w-full bg-transparent text-center text-sm font-mono font-bold text-ink outline-none"
        aria-label="Quantity"
      />
      <button
        type="button"
        onClick={() => onChange(safeValue + 1)}
        className="flex items-center justify-center text-muted hover:text-ink hover:bg-surface2 transition-colors"
        aria-label="Increase quantity"
      >
        <IoAdd className="w-4 h-4" />
      </button>
    </div>
  )
}

function KopiKenanganPersonCard({
  person,
  index,
  outlet,
  canRemove,
  onUpdate,
  onRemove,
}: {
  person: Person
  index: number
  outlet: KopiKenanganOutlet
  canRemove: boolean
  onUpdate: (person: Person) => void
  onRemove: () => void
}) {
  const color = getPersonColor(index)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('All')
  const [selectedItemId, setSelectedItemId] = useState(KOPI_KENANGAN_MENU[0].id)
  const [selectedSize, setSelectedSize] = useState<KopiKenanganSize>('R')
  const [quantity, setQuantity] = useState(1)
  const [selectedModifierIds, setSelectedModifierIds] = useState<string[]>([])
  const [sweetness, setSweetness] = useState<SweetnessOption>('Normal')
  const [iceLevel, setIceLevel] = useState<IceLevelOption>('Normal')
  const [showCustom, setShowCustom] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customPrice, setCustomPrice] = useState(0)
  const [customQuantity, setCustomQuantity] = useState(1)

  const subtotal = person.items.reduce((sum, item) => sum + item.price, 0)
  const normalizedQuery = query.trim().toLowerCase()

  const filteredMenu = useMemo(() => {
    return KOPI_KENANGAN_MENU.filter((item) => {
      const matchesCategory = category === 'All' || item.category === category
      const matchesQuery = !normalizedQuery || getItemSearchText(item).includes(normalizedQuery)
      return matchesCategory && matchesQuery
    })
  }, [category, normalizedQuery])

  const selectedItem =
    KOPI_KENANGAN_MENU.find((item) => item.id === selectedItemId) ?? KOPI_KENANGAN_MENU[0]
  const availableSizes = getAvailableSizes(selectedItem)
  const resolvedSize = selectedItem.prices[selectedSize] !== undefined ? selectedSize : availableSizes[0]
  const basePrice = selectedItem.prices[resolvedSize] ?? 0
  const outletAdjustment = getOutletAdjustment(outlet)
  const selectedModifiers = ALL_MODIFIERS.filter((modifier) => selectedModifierIds.includes(modifier.id))
  const modifierTotal = selectedModifiers.reduce((sum, modifier) => sum + modifier.price, 0)
  const unitPrice = basePrice + outletAdjustment + modifierTotal
  const totalPrice = unitPrice * quantity

  const updateName = (name: string) => onUpdate({ ...person, profileId: undefined, name })

  const addCatalogItem = () => {
    const item: Item = {
      id: generateId(),
      name: selectedItem.name,
      price: totalPrice,
      quantity,
      unitPrice,
      basePrice,
      outletAdjustment,
      selectedSize: resolvedSize,
      catalogItemId: selectedItem.id,
      catalogCategory: selectedItem.category,
      modifiers: selectedModifiers,
      sweetness,
      iceLevel,
      hasOneLiter: selectedItem.hasOneLiter,
      isBaristaChoice: selectedItem.isBaristaChoice,
    }
    onUpdate({ ...person, items: [...person.items, item] })
    setQuantity(1)
    setSelectedModifierIds([])
    setSweetness('Normal')
    setIceLevel('Normal')
  }

  const addCustomItem = () => {
    if (!customName.trim() || customPrice <= 0) return
    const quantityValue = Math.max(1, customQuantity)
    const unitPriceValue = Math.round(customPrice)
    onUpdate({
      ...person,
      items: [
        ...person.items,
        {
          id: generateId(),
          name: customName.trim(),
          price: unitPriceValue * quantityValue,
          quantity: quantityValue,
          unitPrice: unitPriceValue,
          basePrice: unitPriceValue,
          outletAdjustment: 0,
          isCustom: true,
        },
      ],
    })
    setCustomName('')
    setCustomPrice(0)
    setCustomQuantity(1)
    setShowCustom(false)
  }

  const removeItem = (itemId: string) => {
    onUpdate({ ...person, items: person.items.filter((item) => item.id !== itemId) })
  }

  const toggleModifier = (modifierId: string) => {
    setSelectedModifierIds((current) =>
      current.includes(modifierId) ? current.filter((id) => id !== modifierId) : [...current, modifierId]
    )
  }

  return (
    <article className="animate-fade-in card overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-line px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: color.base }}
          >
            {person.name ? person.name.charAt(0).toUpperCase() : index + 1}
          </div>
          <div className="min-w-0 flex-1">
            <input
              type="text"
              value={person.name}
              onChange={(event) => updateName(event.target.value)}
              placeholder={`Person ${index + 1}`}
              className="w-full min-w-0 bg-transparent text-base font-semibold text-ink outline-none placeholder:text-faint sm:text-lg"
            />
            <p className="mt-0.5 text-xs text-muted">
              {person.profileId ? 'Saved profile' : 'One-off bill person'}
            </p>
          </div>
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="button-secondary self-start px-3 py-2 text-xs hover:text-danger"
          >
            <IoTrashOutline className="w-4 h-4" />
            Remove
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 p-4 sm:p-5 xl:grid-cols-[minmax(34rem,1.45fr)_minmax(22rem,0.7fr)]">
        {/* Catalog */}
        <div className="space-y-3">
          <div className="relative">
            <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-faint" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search Kopi Kenangan menu"
              className="field py-3 pl-10"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {(['All', ...KOPI_KENANGAN_CATEGORIES] as CategoryFilter[]).map((itemCategory) => (
              <button
                key={itemCategory}
                type="button"
                onClick={() => setCategory(itemCategory)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border whitespace-nowrap transition-all ${
                  category === itemCategory
                    ? 'bg-accent text-white border-accent'
                    : 'bg-white text-muted border-line2 hover:text-ink hover:border-accent/40'
                }`}
              >
                {itemCategory}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-2.5 max-h-[min(62vh,44rem)] overflow-y-auto pr-1">
            {filteredMenu.map((menuItem) => {
              const selected = selectedItem.id === menuItem.id
              return (
                <button
                  key={menuItem.id}
                  type="button"
                  onClick={() => setSelectedItemId(menuItem.id)}
                    className={`min-h-[7.5rem] rounded-2xl border p-3 text-left transition-all ${
                      selected
                      ? 'border-ink bg-accentSoft ring-1 ring-ink/10'
                      : 'border-line2 bg-white hover:border-ink/25'
                  }`}
                >
                  <p className="text-sm font-bold text-ink leading-snug">{menuItem.name}</p>
                  <p className="text-[11px] text-faint mt-0.5">{menuItem.category}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {KOPI_KENANGAN_SIZES.map((size) => {
                      const sizePrice = menuItem.prices[size]
                      if (!sizePrice) return null
                      return (
                        <span
                          key={size}
                          className="text-[10px] font-mono rounded bg-surface px-2 py-0.5 text-ink3"
                        >
                          {size} {formatRp(sizePrice)}
                        </span>
                      )
                    })}
                    {menuItem.hasOneLiter && (
                      <span className="text-[10px] rounded bg-surface border border-line2 px-2 py-0.5 text-ink3">
                        1L
                      </span>
                    )}
                    {menuItem.isBaristaChoice && (
                      <span className="text-[10px] rounded bg-surface border border-line2 px-2 py-0.5 text-ink3">
                        Barista choice
                      </span>
                    )}
                  </div>
                </button>
              )
            })}

            {filteredMenu.length === 0 && (
              <div className="md:col-span-2 rounded-lg border border-dashed border-line2 p-5 text-center">
                <p className="text-sm text-faint">No menu found</p>
              </div>
            )}
          </div>
        </div>

        {/* Configurator */}
        <div className="space-y-4 rounded-[1.35rem] border border-line bg-surface2/80 p-4 xl:sticky xl:top-5 xl:max-h-[calc(100vh-3rem)] xl:self-start xl:overflow-y-auto">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="label">Selected</p>
              <h3 className="text-base font-extrabold text-ink mt-1 leading-tight">{selectedItem.name}</h3>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-[10px] rounded bg-white border border-line2 px-2 py-0.5 text-muted">
                  {selectedItem.category}
                </span>
                {selectedItem.hasOneLiter && (
                  <span className="text-[10px] rounded bg-surface border border-line2 px-2 py-0.5 text-ink3">
                    1L available
                  </span>
                )}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-faint">Item total</p>
              <p className="font-mono text-xl font-extrabold text-ink">{formatRp(totalPrice)}</p>
            </div>
          </div>

          <div>
            <p className="label mb-2">Size</p>
            <div className="grid grid-cols-3 gap-2">
              {KOPI_KENANGAN_SIZES.map((size) => {
                const sizePrice = selectedItem.prices[size]
                const unavailable = sizePrice === undefined
                const active = resolvedSize === size && !unavailable
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => !unavailable && setSelectedSize(size)}
                    disabled={unavailable}
                    className={`min-h-14 rounded-lg border px-2 py-2 text-center transition-all ${
                      active
                        ? 'bg-accent text-white border-accent'
                        : 'bg-white text-muted border-line2 hover:border-accent/40 disabled:opacity-40 disabled:cursor-not-allowed'
                    }`}
                  >
                    <span className="block text-sm font-extrabold">{size}</span>
                    <span className="block text-[11px] font-mono mt-0.5">
                      {sizePrice ? formatRp(sizePrice) : '-'}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="label">Quantity</p>
              <p className="text-[11px] text-faint mt-1">Modifiers included per unit</p>
            </div>
            <QuantityControl value={quantity} onChange={setQuantity} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3">
            <div>
              <p className="label mb-2">Sweetness</p>
              <div className="grid grid-cols-3 gap-1.5">
                {SWEETNESS_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSweetness(option)}
                    className={`min-h-9 rounded-lg px-2 text-[11px] font-semibold border transition-all ${
                      sweetness === option
                        ? 'bg-accent text-white border-accent'
                        : 'bg-white text-muted border-line2 hover:text-ink'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="label mb-2">Ice level</p>
              <div className="grid grid-cols-3 gap-1.5">
                {ICE_LEVEL_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setIceLevel(option)}
                    className={`min-h-9 rounded-lg px-2 text-[11px] font-semibold border transition-all ${
                      iceLevel === option
                        ? 'bg-accent text-white border-accent'
                        : 'bg-white text-muted border-line2 hover:text-ink'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="label">Modifiers</p>
            {KOPI_KENANGAN_MODIFIER_GROUPS.map((group) => (
              <div key={group.title}>
                <p className="text-[11px] text-muted font-semibold mb-1.5">{group.title}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-1.5">
                  {group.items.map((modifier) => {
                    const checked = selectedModifierIds.includes(modifier.id)
                    return (
                      <label
                        key={modifier.id}
                        className={`min-h-9 rounded-lg border px-2.5 py-2 flex items-center gap-2 cursor-pointer transition-all ${
                          checked
                            ? 'bg-accentSoft border-accent text-accent'
                            : 'bg-white border-line2 text-muted hover:text-ink hover:border-accent/40'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleModifier(modifier.id)}
                          className="h-3.5 w-3.5 accent-accent flex-shrink-0"
                        />
                        <span className="text-xs font-medium flex-1 min-w-0">{modifier.name}</span>
                        <span className="text-[11px] font-mono text-faint flex-shrink-0">
                          +{formatRp(modifier.price)}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg bg-white border border-line2 px-3 py-2.5 text-xs space-y-1">
            <div className="flex justify-between gap-3">
              <span className="text-muted">Base</span>
              <span className="font-mono text-ink2">{formatRp(basePrice)}</span>
            </div>
            {outletAdjustment > 0 && (
              <div className="flex justify-between gap-3">
                <span className="text-muted">Mall adjustment</span>
                <span className="font-mono text-ink2">+{formatRp(outletAdjustment)}</span>
              </div>
            )}
            {modifierTotal > 0 && (
              <div className="flex justify-between gap-3">
                <span className="text-muted">Modifiers</span>
                <span className="font-mono text-ink2">+{formatRp(modifierTotal)}</span>
              </div>
            )}
            <div className="flex justify-between gap-3 pt-1 border-t border-line">
              <span className="text-ink3 font-semibold">Unit</span>
              <span className="font-mono text-ink font-bold">{formatRp(unitPrice)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={addCatalogItem}
            className="w-full h-11 rounded-lg bg-accent text-white font-bold text-sm hover:bg-accentDark transition-all flex items-center justify-center gap-2"
          >
            <IoBagAddOutline className="w-5 h-5" />
            Add item
          </button>
        </div>
      </div>

      {/* Items list */}
      <div className="px-4 sm:px-5 pb-5 pt-1 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <button
            type="button"
            onClick={() => setShowCustom((value) => !value)}
            className="self-start inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-line2 text-ink3 hover:text-ink hover:border-line2 text-sm font-semibold transition-all"
          >
            {showCustom ? <IoClose className="w-4 h-4" /> : <IoAdd className="w-4 h-4" />}
            Custom item
          </button>
          <span className="text-sm text-muted">
            Subtotal <span className="font-mono font-bold text-ink ml-1">{formatRp(subtotal)}</span>
          </span>
        </div>

        {showCustom && (
          <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_9rem_8rem_auto] gap-2 animate-fade-in">
            <input
              type="text"
              value={customName}
              onChange={(event) => setCustomName(event.target.value)}
              placeholder="Custom item name"
              className="field"
            />
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-faint text-xs font-mono">Rp</span>
              <input
                type="number"
                value={customPrice || ''}
                onChange={(event) => setCustomPrice(Number(event.target.value))}
                placeholder="0"
                className="field field-mono text-right pl-9"
              />
            </div>
            <QuantityControl value={customQuantity} onChange={setCustomQuantity} />
            <button
              type="button"
              onClick={addCustomItem}
              disabled={!customName.trim() || customPrice <= 0}
              className="h-10 px-4 rounded-lg bg-accent text-white text-sm font-bold hover:bg-accentDark transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              <IoAdd className="w-4 h-4" />
              Add
            </button>
          </div>
        )}

        {person.items.length > 0 ? (
          <div className="space-y-2">
            {person.items.map((item) => (
              <div key={item.id} className="rounded-lg border border-line2 bg-white px-3 py-3 animate-fade-in">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-ink truncate">{getItemLabel(item)}</p>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                      {getItemDetailLines(item).map((line) => (
                        <span key={line} className="text-[11px] text-faint">
                          {line}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-start gap-2 flex-shrink-0">
                    <div className="text-right">
                      <p className="font-mono text-sm font-bold text-ink">{formatRp(item.price)}</p>
                      {item.quantity && item.quantity > 1 && (
                        <p className="font-mono text-[11px] text-faint">{formatRp(getItemUnitPrice(item))}/unit</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-faint hover:text-danger transition-colors p-1.5 rounded-lg hover:bg-dangerSoft"
                      aria-label="Remove item"
                    >
                      <IoTrashOutline className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-line2 p-4 text-center bg-surface2">
            <p className="text-sm text-faint">No items for this person yet</p>
          </div>
        )}
      </div>
    </article>
  )
}

export default function KopiKenanganOrder({
  people,
  outlet,
  onOutletChange,
  onAddPerson,
  onUpdatePerson,
  onRemovePerson,
}: KopiKenanganOrderProps) {
  return (
    <section className="space-y-5">
      <div className="card p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-line2 bg-surface">
              <IoStorefrontOutline className="w-5 h-5 text-ink" />
            </div>
            <div>
              <p className="label">Catalog source</p>
              <h3 className="mt-1 text-base font-semibold text-ink">Kopi Kenangan order</h3>
              <p className="text-xs text-muted mt-0.5">
                Mall store adds Rp2.000 to each base drink. Modifiers keep their normal price.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 min-w-full md:min-w-[18rem]">
            <button
              type="button"
              onClick={() => onOutletChange('normal')}
              className={`min-h-12 rounded-lg border px-3 py-2 text-left transition-all ${
                outlet === 'normal'
                  ? 'bg-accent text-white border-accent'
                  : 'bg-white text-muted border-line2 hover:text-ink hover:border-accent/40'
              }`}
            >
              <span className="block text-sm font-bold">Normal</span>
              <span className="block text-[11px] opacity-80">Menu price</span>
            </button>
            <button
              type="button"
              onClick={() => onOutletChange('mall')}
              className={`min-h-12 rounded-lg border px-3 py-2 text-left transition-all ${
                outlet === 'mall'
                  ? 'bg-accent text-white border-accent'
                  : 'bg-white text-muted border-line2 hover:text-ink hover:border-accent/40'
              }`}
            >
              <span className="block text-sm font-bold">Mall</span>
              <span className="block text-[11px] opacity-80">+Rp2.000/item</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="label">Orders</p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight text-ink">People in this split</h3>
          <p className="text-xs text-muted">{KOPI_KENANGAN_MENU.length} catalog drinks plus modifiers</p>
        </div>
        <button
          type="button"
          onClick={onAddPerson}
          className="button-secondary"
        >
          <IoAdd className="w-4 h-4" />
          One-off person
        </button>
      </div>

      {people.length === 0 ? (
        <div className="card border-dashed p-8 text-center">
          <h3 className="text-base font-semibold text-ink">No one in the order yet</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Add a saved name from the roster, or create a one-off person for this Kopi Kenangan split.
          </p>
        </div>
      ) : (
        people.map((person, index) => (
          <KopiKenanganPersonCard
            key={person.id}
            person={person}
            index={index}
            outlet={outlet}
            onUpdate={(updatedPerson) => onUpdatePerson(index, updatedPerson)}
            onRemove={() => onRemovePerson(index)}
            canRemove={people.length > 0}
          />
        ))
      )}
    </section>
  )
}
