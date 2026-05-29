'use client'

import { useMemo, useState } from 'react'
import {
  IoAdd,
  IoBagAddOutline,
  IoCafeOutline,
  IoClose,
  IoPricetagsOutline,
  IoRemove,
  IoSearch,
  IoStorefrontOutline,
  IoTrashOutline,
} from 'react-icons/io5'
import {
  IceLevelOption,
  Item,
  ItemModifier,
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

function formatModifierPrice(modifier: ItemModifier): string {
  return `+${formatRp(modifier.price)}`
}

function getItemSearchText(item: KopiKenanganCatalogItem): string {
  return `${item.name} ${item.category}`.toLowerCase()
}

function QuantityControl({
  value,
  onChange,
}: {
  value: number
  onChange: (value: number) => void
}) {
  const safeValue = Math.max(1, value)

  return (
    <div className="inline-grid grid-cols-[2.25rem_3rem_2.25rem] h-10 rounded-lg border border-zinc-800 bg-zinc-950 overflow-hidden">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, safeValue - 1))}
        className="flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-colors"
        aria-label="Decrease quantity"
      >
        <IoRemove className="w-4 h-4" />
      </button>
      <input
        type="number"
        min={1}
        value={safeValue}
        onChange={(event) => onChange(Math.max(1, Number(event.target.value) || 1))}
        className="w-full bg-transparent text-center text-sm font-mono font-bold text-zinc-100 outline-none"
        aria-label="Quantity"
      />
      <button
        type="button"
        onClick={() => onChange(safeValue + 1)}
        className="flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-colors"
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

  const updateName = (name: string) => {
    onUpdate({ ...person, name })
  }

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
    onUpdate({
      ...person,
      items: person.items.filter((item) => item.id !== itemId),
    })
  }

  const toggleModifier = (modifierId: string) => {
    setSelectedModifierIds((current) =>
      current.includes(modifierId)
        ? current.filter((id) => id !== modifierId)
        : [...current, modifierId]
    )
  }

  return (
    <div className="animate-fade-in rounded-lg border border-zinc-800 bg-zinc-950/80 p-4 sm:p-5 transition-all duration-200 hover:border-zinc-700">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-brand flex items-center justify-center font-bold text-sm sm:text-base text-white shadow-lg shadow-brand/20 flex-shrink-0">
            {index + 1}
          </div>
          <input
            type="text"
            value={person.name}
            onChange={(event) => updateName(event.target.value)}
            placeholder={`Person ${index + 1}`}
            className="bg-transparent text-lg sm:text-xl font-bold text-zinc-100 placeholder:text-zinc-600 outline-none border-b border-transparent focus:border-brand/50 transition-colors pb-1 w-full min-w-0"
          />
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 text-zinc-500 hover:text-red-400 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-400/10 text-sm"
          >
            <IoTrashOutline className="w-4 h-4" />
            Remove
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(38rem,1.45fr)_minmax(24rem,0.75fr)] 2xl:grid-cols-[minmax(48rem,1.6fr)_minmax(25rem,0.7fr)] gap-4">
        <div className="space-y-3">
          <div className="relative">
            <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search Kopi Kenangan menu"
                className="w-full bg-zinc-900 rounded-lg pl-10 pr-3 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none border border-zinc-800 focus:border-brand/60 transition-colors"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {(['All', ...KOPI_KENANGAN_CATEGORIES] as CategoryFilter[]).map((itemCategory) => (
              <button
                key={itemCategory}
                type="button"
                onClick={() => setCategory(itemCategory)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold border whitespace-nowrap transition-all duration-200 ${
                  category === itemCategory
                    ? 'bg-brand text-white border-brand shadow-sm'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-100 hover:border-brand/40'
                }`}
              >
                {itemCategory}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-2.5 max-h-[min(62vh,44rem)] overflow-y-auto pr-1">
            {filteredMenu.map((menuItem) => (
              <button
                key={menuItem.id}
                type="button"
                onClick={() => setSelectedItemId(menuItem.id)}
                className={`min-h-[8rem] rounded-lg border p-3 text-left transition-all duration-200 ${
                  selectedItem.id === menuItem.id
                    ? 'bg-brand/10 border-brand/70 shadow-lg shadow-brand/10'
                    : 'bg-zinc-900 border-zinc-800 hover:border-brand/40 hover:bg-zinc-900/80'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-zinc-100 leading-snug">{menuItem.name}</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">{menuItem.category}</p>
                  </div>
                  <IoCafeOutline className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {KOPI_KENANGAN_SIZES.map((size) => {
                    const sizePrice = menuItem.prices[size]
                    if (!sizePrice) return null

                    return (
                      <span
                        key={size}
                        className="text-[10px] font-mono rounded-md bg-black/30 border border-zinc-800 px-2 py-0.5 text-zinc-300"
                      >
                        {size} {formatRp(sizePrice)}
                      </span>
                    )
                  })}
                  {menuItem.hasOneLiter && (
                    <span className="text-[10px] rounded-md bg-teal-500/10 border border-teal-500/30 px-2 py-0.5 text-teal-300">
                      1L available
                    </span>
                  )}
                  {menuItem.isBaristaChoice && (
                    <span className="text-[10px] rounded-md bg-brand/10 border border-brand/30 px-2 py-0.5 text-brand">
                      Barista choice
                    </span>
                  )}
                </div>
              </button>
            ))}

            {filteredMenu.length === 0 && (
              <div className="sm:col-span-2 rounded-lg border border-dashed border-zinc-700/60 p-5 text-center">
                <p className="text-sm text-zinc-500">No menu found</p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-[#101114] p-4 space-y-4 xl:sticky xl:top-24 xl:self-start xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Selected</p>
              <h3 className="text-base font-extrabold text-zinc-100 mt-1 leading-tight">{selectedItem.name}</h3>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-[10px] rounded-md bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-zinc-400">
                  {selectedItem.category}
                </span>
                {selectedItem.hasOneLiter && (
                  <span className="text-[10px] rounded-md bg-teal-500/10 border border-teal-500/30 px-2 py-0.5 text-teal-300">
                    1L available
                  </span>
                )}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-zinc-500">Item total</p>
              <p className="font-mono text-xl font-extrabold text-brand">{formatRp(totalPrice)}</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-2">Size</p>
            <div className="grid grid-cols-3 gap-2">
              {KOPI_KENANGAN_SIZES.map((size) => {
                const sizePrice = selectedItem.prices[size]
                const unavailable = sizePrice === undefined

                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => !unavailable && setSelectedSize(size)}
                    disabled={unavailable}
                    className={`min-h-16 rounded-lg border px-2 py-2 text-center transition-all duration-200 ${
                      resolvedSize === size && !unavailable
                        ? 'bg-brand text-white border-brand shadow-lg shadow-brand/20'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-100 hover:border-brand/40 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-zinc-800'
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
              <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Quantity</p>
              <p className="text-[11px] text-zinc-600 mt-1">Per-unit modifiers are included</p>
            </div>
            <QuantityControl value={quantity} onChange={setQuantity} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3">
            <div>
              <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-2">Sweetness</p>
              <div className="grid grid-cols-3 gap-1.5">
                {SWEETNESS_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSweetness(option)}
                    className={`min-h-9 rounded-lg px-2 text-[11px] font-semibold border transition-all duration-200 ${
                      sweetness === option
                        ? 'bg-brand text-white border-brand'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-100'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-2">Ice Level</p>
              <div className="grid grid-cols-3 gap-1.5">
                {ICE_LEVEL_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setIceLevel(option)}
                    className={`min-h-9 rounded-lg px-2 text-[11px] font-semibold border transition-all duration-200 ${
                      iceLevel === option
                        ? 'bg-brand text-white border-brand'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-100'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <IoPricetagsOutline className="w-4 h-4 text-brand" />
              <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Modifiers</p>
            </div>
            {KOPI_KENANGAN_MODIFIER_GROUPS.map((group) => (
              <div key={group.title}>
                <p className="text-[11px] text-zinc-500 font-semibold mb-1.5">{group.title}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-1.5">
                  {group.items.map((modifier) => {
                    const checked = selectedModifierIds.includes(modifier.id)

                    return (
                      <label
                        key={modifier.id}
                        className={`min-h-9 rounded-lg border px-2.5 py-2 flex items-center gap-2 cursor-pointer transition-all duration-200 ${
                          checked
                            ? 'bg-brand/10 border-brand/50 text-zinc-100'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-brand/40'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleModifier(modifier.id)}
                          className="h-3.5 w-3.5 accent-brand flex-shrink-0"
                        />
                        <span className="text-xs font-medium flex-1 min-w-0">{modifier.name}</span>
                        <span className="text-[11px] font-mono text-zinc-500 flex-shrink-0">
                          {formatModifierPrice(modifier)}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg bg-black/30 border border-zinc-800 px-3 py-2.5 text-xs space-y-1">
            <div className="flex justify-between gap-3">
              <span className="text-zinc-500">Base</span>
              <span className="font-mono text-zinc-300">{formatRp(basePrice)}</span>
            </div>
            {outletAdjustment > 0 && (
              <div className="flex justify-between gap-3">
                <span className="text-zinc-500">Mall adjustment</span>
                <span className="font-mono text-zinc-300">+{formatRp(outletAdjustment)}</span>
              </div>
            )}
            {modifierTotal > 0 && (
              <div className="flex justify-between gap-3">
                <span className="text-zinc-500">Modifiers</span>
                <span className="font-mono text-zinc-300">+{formatRp(modifierTotal)}</span>
              </div>
            )}
            <div className="flex justify-between gap-3 pt-1 border-t border-white/5">
              <span className="text-zinc-300 font-semibold">Unit</span>
              <span className="font-mono text-zinc-100 font-bold">{formatRp(unitPrice)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={addCatalogItem}
            className="w-full h-11 rounded-lg bg-brand text-white font-bold text-sm hover:bg-orange-600 transition-all duration-200 shadow-lg shadow-brand/20 flex items-center justify-center gap-2"
          >
            <IoBagAddOutline className="w-5 h-5" />
            Add Item
          </button>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-white/5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <button
            type="button"
            onClick={() => setShowCustom((value) => !value)}
            className="self-start inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-brand hover:border-brand/40 text-sm font-semibold transition-all duration-200"
          >
            {showCustom ? <IoClose className="w-4 h-4" /> : <IoAdd className="w-4 h-4" />}
            Custom Item
          </button>
          <span className="font-mono text-sm text-zinc-400">
            Subtotal: <span className="text-zinc-100 font-bold">{formatRp(subtotal)}</span>
          </span>
        </div>

        {showCustom && (
          <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_9rem_8rem_auto] gap-2 animate-fade-in">
            <input
              type="text"
              value={customName}
              onChange={(event) => setCustomName(event.target.value)}
              placeholder="Custom item name"
              className="w-full bg-zinc-900 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none border border-zinc-800 focus:border-brand/60 transition-colors"
            />
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-mono">Rp</span>
              <input
                type="number"
                value={customPrice || ''}
                onChange={(event) => setCustomPrice(Number(event.target.value))}
                placeholder="0"
                className="w-full bg-zinc-900 rounded-lg pl-9 pr-3 py-2.5 text-sm font-mono text-zinc-100 placeholder:text-zinc-600 outline-none border border-zinc-800 focus:border-brand/60 transition-colors text-right"
              />
            </div>
            <QuantityControl value={customQuantity} onChange={setCustomQuantity} />
            <button
              type="button"
              onClick={addCustomItem}
              disabled={!customName.trim() || customPrice <= 0}
              className="h-10 px-4 rounded-lg bg-brand text-white text-sm font-bold hover:bg-orange-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              <IoAdd className="w-4 h-4" />
              Add
            </button>
          </div>
        )}

        {person.items.length > 0 ? (
          <div className="space-y-2">
            {person.items.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-3 animate-fade-in"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-zinc-100 truncate">{getItemLabel(item)}</p>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                      {getItemDetailLines(item).map((line) => (
                        <span key={line} className="text-[11px] text-zinc-500">
                          {line}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-start gap-2 flex-shrink-0">
                    <div className="text-right">
                      <p className="font-mono text-sm font-bold text-zinc-100">{formatRp(item.price)}</p>
                      {item.quantity && item.quantity > 1 && (
                        <p className="font-mono text-[11px] text-zinc-500">{formatRp(getItemUnitPrice(item))}/unit</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-zinc-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-400/10"
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
          <div className="rounded-lg border border-dashed border-zinc-800 p-4 text-center bg-zinc-900/40">
            <p className="text-sm text-zinc-500">No items for this person yet</p>
          </div>
        )}
      </div>
    </div>
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
    <div className="space-y-4">
      <div className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand/15 border border-brand/30 flex items-center justify-center flex-shrink-0">
              <IoStorefrontOutline className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-zinc-100">Store Kopi Kenangan</h3>
              <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
                Mall store adds Rp2.000 to each base drink. Modifiers keep their normal price.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 min-w-full md:min-w-[20rem]">
            <button
              type="button"
              onClick={() => onOutletChange('normal')}
              className={`min-h-12 rounded-lg border px-3 py-2 text-left transition-all duration-200 ${
                outlet === 'normal'
                  ? 'bg-brand text-white border-brand shadow-lg shadow-brand/20'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-100 hover:border-brand/40'
              }`}
            >
              <span className="block text-sm font-bold">Normal</span>
              <span className="block text-[11px] opacity-80">Menu price</span>
            </button>
            <button
              type="button"
              onClick={() => onOutletChange('mall')}
              className={`min-h-12 rounded-lg border px-3 py-2 text-left transition-all duration-200 ${
                outlet === 'mall'
                  ? 'bg-brand text-white border-brand shadow-lg shadow-brand/20'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-100 hover:border-brand/40'
              }`}
            >
              <span className="block text-sm font-bold">Mall</span>
              <span className="block text-[11px] opacity-80">+Rp2.000/item</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-extrabold text-zinc-100">Orders</h3>
          <p className="text-xs text-zinc-500">{KOPI_KENANGAN_MENU.length} catalog drinks plus modifiers</p>
        </div>
        <button
          type="button"
          onClick={onAddPerson}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-brand text-white text-xs sm:text-sm font-semibold hover:bg-orange-600 transition-all duration-200 shadow-lg shadow-brand/20"
        >
          <IoAdd className="w-4 h-4" />
          Add Person
        </button>
      </div>

      {people.map((person, index) => (
        <KopiKenanganPersonCard
          key={person.id}
          person={person}
          index={index}
          outlet={outlet}
          onUpdate={(updatedPerson) => onUpdatePerson(index, updatedPerson)}
          onRemove={() => onRemovePerson(index)}
          canRemove={people.length > 1}
        />
      ))}
    </div>
  )
}
