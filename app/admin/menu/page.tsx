'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

function formatRupiah(amount: number): string {
  return `Rp${amount.toLocaleString('id-ID')}`
}

interface Category {
  id: string
  name: string
}

interface MenuItem {
  id: string
  category_id: string
  name: string
  price_r: number | null
  price_l: number | null
  price_j: number | null
  has_one_liter: boolean
  is_barista_choice: boolean
  is_new: boolean
  is_limited_time: boolean
  sort_order: number
  categories?: { name: string }
}

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCategoryId, setFilterCategoryId] = useState<string>('')

  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    id: '',
    category_id: '',
    name: '',
    price_r: '',
    price_l: '',
    price_j: '',
    has_one_liter: false,
    is_barista_choice: false,
    is_new: false,
    is_limited_time: false,
    sort_order: '0',
  })

  const fetchData = async () => {
    setLoading(true)
    const [catsRes, itemsRes] = await Promise.all([
      supabase.from('categories').select('id, name').order('sort_order'),
      supabase.from('menu_items').select('*, categories(name)').order('sort_order'),
    ])

    if (catsRes.error) console.error(catsRes.error)
    else setCategories(catsRes.data || [])

    if (itemsRes.error) console.error(itemsRes.error)
    else setItems(itemsRes.data || [])
    
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAddClick = () => {
    setFormData({
      id: '',
      category_id: categories[0]?.id || '',
      name: '',
      price_r: '',
      price_l: '',
      price_j: '',
      has_one_liter: false,
      is_barista_choice: false,
      is_new: false,
      is_limited_time: false,
      sort_order: '0',
    })
    setShowAddForm(true)
  }

  const handleEditClick = (item: MenuItem) => {
    setFormData({
      id: item.id,
      category_id: item.category_id,
      name: item.name,
      price_r: item.price_r?.toString() || '',
      price_l: item.price_l?.toString() || '',
      price_j: item.price_j?.toString() || '',
      has_one_liter: item.has_one_liter,
      is_barista_choice: item.is_barista_choice,
      is_new: item.is_new,
      is_limited_time: item.is_limited_time,
      sort_order: item.sort_order.toString(),
    })
    setShowAddForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const payload = {
      category_id: formData.category_id,
      name: formData.name,
      price_r: formData.price_r ? parseInt(formData.price_r) : null,
      price_l: formData.price_l ? parseInt(formData.price_l) : null,
      price_j: formData.price_j ? parseInt(formData.price_j) : null,
      has_one_liter: formData.has_one_liter,
      is_barista_choice: formData.is_barista_choice,
      is_new: formData.is_new,
      is_limited_time: formData.is_limited_time,
      sort_order: parseInt(formData.sort_order) || 0,
    }

    let error
    if (formData.id) {
      const res = await supabase.from('menu_items').update(payload).eq('id', formData.id)
      error = res.error
    } else {
      const res = await supabase.from('menu_items').insert(payload)
      error = res.error
    }

    if (error) {
      alert(error.message)
    } else {
      setShowAddForm(false)
      fetchData()
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Hapus menu "${name}"?`)) return
    const { error } = await supabase.from('menu_items').delete().eq('id', id)
    if (error) alert(error.message)
    else fetchData()
  }

  const filteredItems = filterCategoryId 
    ? items.filter(i => i.category_id === filterCategoryId)
    : items

  if (loading && items.length === 0) {
    return <div className="p-4 text-ink3 text-sm">Memuat...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Menu Items</h1>
        <div className="flex gap-2">
          <select 
            value={filterCategoryId} 
            onChange={e => setFilterCategoryId(e.target.value)}
            className="field w-48"
          >
            <option value="">Semua Kategori</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button onClick={showAddForm ? () => setShowAddForm(false) : handleAddClick} className="button-primary">
            {showAddForm ? 'Batal' : 'Tambah Menu'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleSave} className="card p-4 space-y-4 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label mb-1 block">Nama Menu</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="field" required />
            </div>
            
            <div>
              <label className="label mb-1 block">Kategori</label>
              <select value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} className="field" required>
                <option value="">Pilih Kategori</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="label mb-1 block">Urutan</label>
              <input type="number" value={formData.sort_order} onChange={e => setFormData({...formData, sort_order: e.target.value})} className="field field-mono" required />
            </div>

            <div>
              <label className="label mb-1 block">Harga R</label>
              <input type="number" value={formData.price_r} onChange={e => setFormData({...formData, price_r: e.target.value})} className="field field-mono" placeholder="Kosongkan jika tdk ada" />
            </div>
            <div>
              <label className="label mb-1 block">Harga L</label>
              <input type="number" value={formData.price_l} onChange={e => setFormData({...formData, price_l: e.target.value})} className="field field-mono" placeholder="Kosongkan jika tdk ada" />
            </div>
            <div>
              <label className="label mb-1 block">Harga J</label>
              <input type="number" value={formData.price_j} onChange={e => setFormData({...formData, price_j: e.target.value})} className="field field-mono" placeholder="Kosongkan jika tdk ada" />
            </div>
          </div>

          <div className="flex gap-4 flex-wrap mt-2 pt-2 border-t border-rule2/50">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={formData.has_one_liter} onChange={e => setFormData({...formData, has_one_liter: e.target.checked})} />
              Has 1 Liter
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={formData.is_barista_choice} onChange={e => setFormData({...formData, is_barista_choice: e.target.checked})} />
              Barista Choice
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={formData.is_new} onChange={e => setFormData({...formData, is_new: e.target.checked})} />
              New
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={formData.is_limited_time} onChange={e => setFormData({...formData, is_limited_time: e.target.checked})} />
              Limited Time
            </label>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" className="button-primary">Simpan</button>
          </div>
        </form>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-paper2 border-b border-rule">
            <tr>
              <th className="p-3 label text-ink2">Nama</th>
              <th className="p-3 label text-ink2">Kategori</th>
              <th className="p-3 label text-ink2 text-right">Harga R</th>
              <th className="p-3 label text-ink2 text-right">Harga L</th>
              <th className="p-3 label text-ink2 text-right">Harga J</th>
              <th className="p-3 label text-ink2">Flags</th>
              <th className="p-3 label text-ink2 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {filteredItems.map(item => (
              <tr key={item.id} className="hover:bg-paper2/50">
                <td className="p-3 font-medium cursor-pointer" onClick={() => handleEditClick(item)}>{item.name}</td>
                <td className="p-3 text-ink3">{item.categories?.name}</td>
                <td className="p-3 text-right font-mono">{item.price_r ? formatRupiah(item.price_r) : '-'}</td>
                <td className="p-3 text-right font-mono">{item.price_l ? formatRupiah(item.price_l) : '-'}</td>
                <td className="p-3 text-right font-mono">{item.price_j ? formatRupiah(item.price_j) : '-'}</td>
                <td className="p-3 text-xs text-ink3 gap-1 flex flex-wrap max-w-xs">
                  {item.has_one_liter && <span className="px-1.5 py-0.5 bg-paper2 rounded border border-rule2">1L</span>}
                  {item.is_barista_choice && <span className="px-1.5 py-0.5 bg-paper2 rounded border border-rule2">Barista</span>}
                  {item.is_new && <span className="px-1.5 py-0.5 bg-paper2 rounded border border-rule2">New</span>}
                  {item.is_limited_time && <span className="px-1.5 py-0.5 bg-paper2 rounded border border-rule2">LTO</span>}
                </td>
                <td className="p-3 flex items-center justify-end gap-2">
                  <button onClick={() => handleEditClick(item)} className="text-ink3 hover:text-ink text-xs font-bold">EDIT</button>
                  <button onClick={() => handleDelete(item.id, item.name)} className="text-stamp hover:text-stamp/80 text-xs font-bold">HAPUS</button>
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr><td colSpan={7} className="p-4 text-center text-ink3">Belum ada data</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
