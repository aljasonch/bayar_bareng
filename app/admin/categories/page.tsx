'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Category {
  id: string
  name: string
  sort_order: number
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [addName, setAddName] = useState('')
  const [addSortOrder, setAddSortOrder] = useState('0')
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editSortOrder, setEditSortOrder] = useState('')

  const fetchCategories = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order')
    
    if (error) {
      console.error(error)
      alert('Gagal mengambil data kategori')
    } else {
      setCategories(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addName.trim()) return

    const { error } = await supabase.from('categories').insert({
      name: addName.trim(),
      sort_order: parseInt(addSortOrder) || 0,
    })

    if (error) {
      alert(error.message)
    } else {
      setAddName('')
      setAddSortOrder('0')
      setShowAddForm(false)
      fetchCategories()
    }
  }

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return

    const { error } = await supabase
      .from('categories')
      .update({
        name: editName.trim(),
        sort_order: parseInt(editSortOrder) || 0,
      })
      .eq('id', id)

    if (error) {
      alert(error.message)
    } else {
      setEditId(null)
      fetchCategories()
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Hapus kategori "${name}"?`)) return

    // Check if any menu_items reference it
    const { count, error: countError } = await supabase
      .from('menu_items')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id)
      
    if (countError) {
      alert(countError.message)
      return
    }

    if (count && count > 0) {
      alert('Tidak bisa menghapus kategori yang masih memiliki menu item.')
      return
    }

    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) {
      alert(error.message)
    } else {
      fetchCategories()
    }
  }

  if (loading && categories.length === 0) {
    return <div className="p-4 text-ink3 text-sm">Memuat...</div>
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kategori Menu</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="button-primary"
        >
          {showAddForm ? 'Batal' : 'Tambah Kategori'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="card p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label mb-1 block">Nama</label>
              <input
                type="text"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                className="field"
                required
              />
            </div>
            <div>
              <label className="label mb-1 block">Urutan</label>
              <input
                type="number"
                value={addSortOrder}
                onChange={(e) => setAddSortOrder(e.target.value)}
                className="field field-mono"
                required
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="button-primary">
              Simpan
            </button>
          </div>
        </form>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-paper2 border-b border-rule">
            <tr>
              <th className="p-4 label text-ink2">Nama</th>
              <th className="p-4 label text-ink2 w-24">Urutan</th>
              <th className="p-4 label text-ink2 w-32 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-paper2/50">
                {editId === cat.id ? (
                  <>
                    <td className="p-4">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="field"
                      />
                    </td>
                    <td className="p-4">
                      <input
                        type="number"
                        value={editSortOrder}
                        onChange={(e) => setEditSortOrder(e.target.value)}
                        className="field field-mono"
                      />
                    </td>
                    <td className="p-4 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleUpdate(cat.id)}
                        className="text-xs font-bold text-ink hover:underline"
                      >
                        SIMPAN
                      </button>
                      <button
                        onClick={() => setEditId(null)}
                        className="text-xs font-bold text-ink3 hover:underline"
                      >
                        BATAL
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td
                      className="p-4 cursor-pointer hover:bg-paper2/80"
                      onClick={() => {
                        setEditId(cat.id)
                        setEditName(cat.name)
                        setEditSortOrder(cat.sort_order.toString())
                      }}
                    >
                      {cat.name}
                    </td>
                    <td className="p-4 font-mono">{cat.sort_order}</td>
                    <td className="p-4 flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditId(cat.id)
                          setEditName(cat.name)
                          setEditSortOrder(cat.sort_order.toString())
                        }}
                        className="text-ink3 hover:text-ink text-xs font-bold"
                      >
                        EDIT
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="text-stamp hover:text-stamp/80 text-xs font-bold"
                      >
                        HAPUS
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {categories.length === 0 && !loading && (
              <tr>
                <td colSpan={3} className="p-4 text-center text-ink3 text-sm">
                  Belum ada data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
