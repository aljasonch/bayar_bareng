'use client'

import { useMemo, useState } from 'react'
import { IoAdd, IoClose, IoRemove, IoSearch, IoTrashOutline } from 'react-icons/io5'
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

function Tag({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span
      className={`rounded-sm border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] ${
        accent ? 'border-stamp/40 bg-stampSoft text-stamp' : 'border-rule2 bg-paper2 text-ink3'
      }`}
    >
      {children}
    </span>
  )
}

function QuantityControl({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const safeValue = Math.max(1, value)

  return (
    <div className="inline-grid h-10 grid-cols-[2.25rem_3rem_2.25rem] overflow-hidden rounded-sm border border-rule2 bg-white">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, safeValue - 1))}
        className="flex items-center justify-center text-muted transition-colors hover:bg-paper2 hover:text-ink"
        aria-label="Kurangi jumlah"
      >
        <IoRemove className="w-4 h-4" />
      </button>
      <input
        type="number"
        min={1}
        value={safeValue}
        onChange={(event) => onChange(Math.max(1, Number(event.target.value) || 1))}
        className="w-full bg-transparent text-center font-mono text-sm font-bold text-ink outline-none"
        aria-label="Jumlah"
      />
      <button
        type="button"
        onClick={() => onChange(safeValue + 1)}
        className="flex items-center justify-center text-muted transition-colors hover:bg-paper2 hover:text-ink"
        aria-label="Tambah jumlah"
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
      <div className="flex items-start gap-3 border-b border-rule px-4 py-3.5 sm:px-5">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm text-sm font-semibold text-white"
          style={{ backgroundColor: color.base }}
        >
          {person.name ? person.name.charAt(0).toUpperCase() : index + 1}
        </div>
        <div className="min-w-0 flex-1">
          <input
            type="text"
            value={person.name}
            onChange={(event) => updateName(event.target.value)}
            placeholder={`Orang ${index + 1}`}
            className="field-line w-full min-w-0 border-transparent px-0 py-1 text-base font-semibold hover:border-rule2 sm:text-lg"
          />
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
            {person.profileId ? 'dari roster' : 'hanya nota ini'}
          </p>
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="icon-button self-start hover:text-stamp"
            aria-label="Hapus orang ini"
          >
            <IoTrashOutline className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 p-4 sm:p-5 xl:grid-cols-[minmax(34rem,1.45fr)_minmax(22rem,0.7fr)]">
        {/* Katalog */}
        <div className="space-y-3">
          <div className="relative">
            <IoSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari menu Kopi Kenangan"
              className="field py-3 pl-10"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {(['All', ...KOPI_KENANGAN_CATEGORIES] as CategoryFilter[]).map((itemCategory) => (
              <button
                key={itemCategory}
                type="button"
                onClick={() => setCategory(itemCategory)}
                className={`whitespace-nowrap rounded-sm border px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.06em] transition-colors ${
                  category === itemCategory
                    ? 'border-ink bg-ink text-paper'
                    : 'border-rule2 bg-paper text-muted hover:border-ink hover:text-ink'
                }`}
              >
                {itemCategory === 'All' ? 'Semua' : itemCategory}
              </button>
            ))}
          </div>

          <div className="grid max-h-[min(62vh,44rem)] grid-cols-1 gap-2 overflow-y-auto pr-1 md:grid-cols-2 2xl:grid-cols-3">
            {filteredMenu.map((menuItem) => {
              const selected = selectedItem.id === menuItem.id
              return (
                <button
                  key={menuItem.id}
                  type="button"
                  onClick={() => setSelectedItemId(menuItem.id)}
                  className={`min-h-[7.5rem] rounded-sm border p-3 text-left transition-colors ${
                    selected ? 'border-ink bg-paper2' : 'border-rule2 bg-paper hover:border-ink'
                  }`}
                >
                  <p className="text-sm font-semibold leading-snug text-ink">{menuItem.name}</p>
                  <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-faint">
                    {menuItem.category}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {KOPI_KENANGAN_SIZES.map((size) => {
                      const sizePrice = menuItem.prices[size]
                      if (!sizePrice) return null
                      return (
                        <span key={size} className="rounded-sm bg-paper2 px-1.5 py-0.5 font-mono text-[10px] text-ink3">
                          {size} {formatRp(sizePrice)}
                        </span>
                      )
                    })}
                    {menuItem.hasOneLiter && <Tag>1L</Tag>}
                    {menuItem.isNew && <Tag accent>Baru</Tag>}
                    {menuItem.isLimitedTime && <Tag>Limited</Tag>}
                    {menuItem.isBaristaChoice && <Tag>Barista choice</Tag>}
                  </div>
                </button>
              )
            })}

            {filteredMenu.length === 0 && (
              <div className="rounded-sm border border-dashed border-rule2 p-5 text-center md:col-span-2">
                <p className="text-sm text-muted">Menu tidak ketemu. Coba kata kunci lain, atau pakai item custom.</p>
              </div>
            )}
          </div>
        </div>

        {/* Konfigurator */}
        <div className="space-y-4 rounded-sm border border-rule bg-paper2 p-4 xl:sticky xl:top-5 xl:max-h-[calc(100vh-3rem)] xl:self-start xl:overflow-y-auto">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="label">Dipilih</p>
              <h3 className="mt-1 text-base font-semibold leading-tight text-ink">{selectedItem.name}</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Tag>{selectedItem.category}</Tag>
                {selectedItem.hasOneLiter && <Tag>1L tersedia</Tag>}
                {selectedItem.isNew && <Tag accent>Baru</Tag>}
                {selectedItem.isLimitedTime && <Tag>Limited</Tag>}
              </div>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="label">Total item</p>
              <p className="font-mono text-xl font-bold text-ink">{formatRp(totalPrice)}</p>
            </div>
          </div>

          <div>
            <p className="label mb-2">Ukuran</p>
            <div className="grid grid-cols-3 gap-1.5">
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
                    className={`min-h-14 rounded-sm border px-2 py-2 text-center transition-colors ${
                      active
                        ? 'border-ink bg-ink text-paper'
                        : 'border-rule2 bg-paper text-muted hover:border-ink disabled:cursor-not-allowed disabled:opacity-40'
                    }`}
                  >
                    <span className="block font-mono text-sm font-bold">{size}</span>
                    <span className="mt-0.5 block font-mono text-[11px]">
                      {sizePrice ? formatRp(sizePrice) : '—'}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="label">Jumlah</p>
              <p className="mt-1 text-[11px] text-faint">Modifier dihitung per gelas</p>
            </div>
            <QuantityControl value={quantity} onChange={setQuantity} />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div>
              <p className="label mb-2">Gula</p>
              <div className="grid grid-cols-3 gap-1.5">
                {SWEETNESS_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSweetness(option)}
                    className={`min-h-9 rounded-sm border px-2 text-[11px] font-semibold transition-colors ${
                      sweetness === option
                        ? 'border-ink bg-ink text-paper'
                        : 'border-rule2 bg-paper text-muted hover:text-ink'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="label mb-2">Es</p>
              <div className="grid grid-cols-3 gap-1.5">
                {ICE_LEVEL_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setIceLevel(option)}
                    className={`min-h-9 rounded-sm border px-2 text-[11px] font-semibold transition-colors ${
                      iceLevel === option
                        ? 'border-ink bg-ink text-paper'
                        : 'border-rule2 bg-paper text-muted hover:text-ink'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="label">Modifier</p>
            {KOPI_KENANGAN_MODIFIER_GROUPS.map((group) => (
              <div key={group.title}>
                <p className="mb-1.5 text-[11px] font-semibold text-muted">{group.title}</p>
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 xl:grid-cols-1">
                  {group.items.map((modifier) => {
                    const checked = selectedModifierIds.includes(modifier.id)
                    return (
                      <label
                        key={modifier.id}
                        className={`flex min-h-9 cursor-pointer items-center gap-2 rounded-sm border px-2.5 py-2 transition-colors ${
                          checked
                            ? 'border-ink bg-paper text-ink'
                            : 'border-rule2 bg-paper text-muted hover:border-ink hover:text-ink'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleModifier(modifier.id)}
                          className="h-3.5 w-3.5 flex-shrink-0 accent-ink"
                        />
                        <span className="min-w-0 flex-1 text-xs font-medium">{modifier.name}</span>
                        <span className="flex-shrink-0 font-mono text-[11px] text-faint">
                          +{formatRp(modifier.price)}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-1 rounded-sm border border-rule2 bg-paper px-3 py-2.5 font-mono text-xs">
            <div className="flex justify-between gap-3">
              <span className="text-muted">Harga dasar</span>
              <span className="text-ink2">{formatRp(basePrice)}</span>
            </div>
            {outletAdjustment > 0 && (
              <div className="flex justify-between gap-3">
                <span className="text-muted">Selisih mall</span>
                <span className="text-ink2">+{formatRp(outletAdjustment)}</span>
              </div>
            )}
            {modifierTotal > 0 && (
              <div className="flex justify-between gap-3">
                <span className="text-muted">Modifier</span>
                <span className="text-ink2">+{formatRp(modifierTotal)}</span>
              </div>
            )}
            <div className="flex justify-between gap-3 border-t border-rule pt-1">
              <span className="font-bold uppercase tracking-[0.08em] text-ink3">Per gelas</span>
              <span className="font-bold text-ink">{formatRp(unitPrice)}</span>
            </div>
          </div>

          <button type="button" onClick={addCatalogItem} className="button-primary w-full">
            + Tambah ke pesanan
          </button>
        </div>
      </div>

      {/* Daftar pesanan */}
      <div className="space-y-3 px-4 pb-5 pt-1 sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => setShowCustom((value) => !value)}
            className="button-secondary min-h-10 self-start px-3 py-2"
          >
            {showCustom ? <IoClose className="w-4 h-4" /> : <IoAdd className="w-4 h-4" />}
            Item custom
          </button>
          <span className="font-mono text-xs text-muted">
            Subtotal <span className="ml-1 text-sm font-bold text-ink">{formatRp(subtotal)}</span>
          </span>
        </div>

        {showCustom && (
          <div className="animate-fade-in grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_9rem_8rem_auto]">
            <input
              type="text"
              value={customName}
              onChange={(event) => setCustomName(event.target.value)}
              placeholder="Nama item"
              className="field"
            />
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-faint">Rp</span>
              <input
                type="number"
                value={customPrice || ''}
                onChange={(event) => setCustomPrice(Number(event.target.value))}
                placeholder="0"
                className="field field-mono pl-9 text-right"
              />
            </div>
            <QuantityControl value={customQuantity} onChange={setCustomQuantity} />
            <button
              type="button"
              onClick={addCustomItem}
              disabled={!customName.trim() || customPrice <= 0}
              className="button-primary min-h-10 px-4 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Tambah
            </button>
          </div>
        )}

        {person.items.length > 0 ? (
          <div className="divide-y divide-rule border-y border-rule">
            {person.items.map((item) => (
              <div key={item.id} className="animate-fade-in flex items-start justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{getItemLabel(item)}</p>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                    {getItemDetailLines(item).map((line) => (
                      <span key={line} className="font-mono text-[11px] text-faint">
                        {line}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-shrink-0 items-start gap-2">
                  <div className="text-right">
                    <p className="font-mono text-sm font-bold text-ink">{formatRp(item.price)}</p>
                    {item.quantity && item.quantity > 1 && (
                      <p className="font-mono text-[11px] text-faint">{formatRp(getItemUnitPrice(item))}/gelas</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="icon-button h-8 w-8 hover:text-stamp"
                    aria-label="Hapus item"
                  >
                    <IoTrashOutline className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-sm border border-dashed border-rule2 bg-paper2/60 p-4 text-center">
            <p className="text-sm text-muted">Belum ada pesanan. Pilih menu di atas, lalu tambah ke pesanan.</p>
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
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="label">Sumber harga</p>
            <h3 className="mt-1 text-base font-semibold text-ink">Kopi Kenangan</h3>
            <p className="mt-0.5 text-xs text-muted">
              Harga menu langsung. Store di mall menambah Rp2.000 per gelas; harga di aplikasi delivery bisa beda.
            </p>
          </div>

          <div className="grid min-w-full grid-cols-2 gap-1.5 md:min-w-[18rem]">
            {(
              [
                { key: 'normal' as KopiKenanganOutlet, title: 'Normal', desc: 'harga menu' },
                { key: 'mall' as KopiKenanganOutlet, title: 'Mall', desc: '+Rp2.000/gelas' },
              ]
            ).map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => onOutletChange(option.key)}
                className={`min-h-12 rounded-sm border px-3 py-2 text-left transition-colors ${
                  outlet === option.key
                    ? 'border-ink bg-ink text-paper'
                    : 'border-rule2 bg-paper text-muted hover:border-ink hover:text-ink'
                }`}
              >
                <span className="block text-sm font-semibold">{option.title}</span>
                <span className="block font-mono text-[11px] opacity-70">{option.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="label">Pesanan</p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight text-ink">Orang di nota ini</h3>
          <p className="mt-0.5 text-xs text-muted">{KOPI_KENANGAN_MENU.length} menu + modifier</p>
        </div>
        <button type="button" onClick={onAddPerson} className="button-secondary">
          + Orang baru
        </button>
      </div>

      {people.length === 0 ? (
        <div className="rounded-sm border border-dashed border-rule2 bg-paper/60 p-8 text-center">
          <h3 className="text-base font-semibold text-ink">Belum ada yang pesan</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Pilih nama dari roster, atau tekan “+ Orang baru” untuk mulai mencatat pesanan.
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
