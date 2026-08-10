'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

function formatRupiah(amount: number): string {
  return `Rp${amount.toLocaleString('id-ID')}`
}

interface Modifier {
  id: string
  group_id: string
  name: string
  type: string
  price: number
  sort_order: number
}

interface ModifierGroup {
  id: string
  name: string
  sort_order: number
  modifiers: Modifier[]
}

export default function ModifiersPage() {
  const [groups, setGroups] = useState<ModifierGroup[]>([])
  const [loading, setLoading] = useState(true)

  const [addGroupName, setAddGroupName] = useState('')
  const [addGroupSort, setAddGroupSort] = useState('0')

  const [activeGroupModForm, setActiveGroupModForm] = useState<string | null>(null)
  const [modFormData, setModFormData] = useState({
    id: '',
    name: '',
    type: 'addon',
    price: '0',
    sort_order: '0',
  })

  const fetchGroups = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('modifier_groups')
      .select('*, modifiers(*)')
      .order('sort_order')
    
    if (error) {
      alert('Error fetch groups: ' + error.message)
    } else {
      // sort modifiers manually or let supabase do it if we nested order, manual is easier here
      const sortedGroups = (data || []).map(g => ({
        ...g,
        modifiers: g.modifiers.sort((a: Modifier, b: Modifier) => a.sort_order - b.sort_order)
      }))
      setGroups(sortedGroups)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addGroupName.trim()) return

    const { error } = await supabase.from('modifier_groups').insert({
      name: addGroupName.trim(),
      sort_order: parseInt(addGroupSort) || 0
    })

    if (error) alert(error.message)
    else {
      setAddGroupName('')
      setAddGroupSort('0')
      fetchGroups()
    }
  }

  const handleDeleteGroup = async (id: string, name: string) => {
    if (!window.confirm(`Hapus modifier group "${name}"? Ini juga akan menghapus modifier di dalamnya.`)) return
    const { error } = await supabase.from('modifier_groups').delete().eq('id', id)
    if (error) alert(error.message)
    else fetchGroups()
  }

  const handleSaveMod = async (groupId: string) => {
    const payload = {
      group_id: groupId,
      name: modFormData.name.trim(),
      type: modFormData.type,
      price: parseInt(modFormData.price) || 0,
      sort_order: parseInt(modFormData.sort_order) || 0,
    }

    let error
    if (modFormData.id) {
      const res = await supabase.from('modifiers').update(payload).eq('id', modFormData.id)
      error = res.error
    } else {
      const res = await supabase.from('modifiers').insert(payload)
      error = res.error
    }

    if (error) {
      alert(error.message)
    } else {
      setActiveGroupModForm(null)
      fetchGroups()
    }
  }

  const handleDeleteMod = async (id: string, name: string) => {
    if (!window.confirm(`Hapus modifier "${name}"?`)) return
    const { error } = await supabase.from('modifiers').delete().eq('id', id)
    if (error) alert(error.message)
    else fetchGroups()
  }

  if (loading && groups.length === 0) {
    return <div className="p-4 text-ink3 text-sm">Memuat...</div>
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">Modifier</h1>

      <form onSubmit={handleAddGroup} className="card p-4 flex gap-4 items-end bg-paper2/30">
        <div className="flex-1">
          <label className="label mb-1 block">Nama Group (Misal: Addon, Syrup)</label>
          <input type="text" value={addGroupName} onChange={e => setAddGroupName(e.target.value)} className="field" required />
        </div>
        <div className="w-24">
          <label className="label mb-1 block">Urutan</label>
          <input type="number" value={addGroupSort} onChange={e => setAddGroupSort(e.target.value)} className="field field-mono" required />
        </div>
        <button type="submit" className="button-primary">Tambah Group</button>
      </form>

      <div className="space-y-6">
        {groups.map(group => (
          <div key={group.id} className="card overflow-hidden">
            <div className="bg-paper2 p-4 flex justify-between items-center border-b border-rule">
              <div>
                <h3 className="font-bold text-lg">{group.name}</h3>
                <span className="text-xs text-ink3 font-mono">Urutan: {group.sort_order}</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setModFormData({ id: '', name: '', type: 'addon', price: '0', sort_order: '0' })
                    setActiveGroupModForm(activeGroupModForm === group.id && !modFormData.id ? null : group.id)
                  }}
                  className="button-secondary !min-h-8 !py-1 !px-3"
                >
                  Tambah Modifier
                </button>
                <button 
                  onClick={() => handleDeleteGroup(group.id, group.name)}
                  className="text-stamp hover:text-stamp/80 text-xs font-bold px-2"
                >
                  HAPUS GRP
                </button>
              </div>
            </div>

            {activeGroupModForm === group.id && (
              <div className="p-4 border-b border-rule bg-paper2/20 flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[150px]">
                  <label className="label mb-1 block">Nama</label>
                  <input type="text" value={modFormData.name} onChange={e => setModFormData({...modFormData, name: e.target.value})} className="field" />
                </div>
                <div className="w-32">
                  <label className="label mb-1 block">Tipe</label>
                  <select value={modFormData.type} onChange={e => setModFormData({...modFormData, type: e.target.value})} className="field">
                    <option value="addon">Addon</option>
                    <option value="syrup">Syrup</option>
                    <option value="upgrade">Upgrade</option>
                  </select>
                </div>
                <div className="w-32">
                  <label className="label mb-1 block">Harga</label>
                  <input type="number" value={modFormData.price} onChange={e => setModFormData({...modFormData, price: e.target.value})} className="field field-mono" />
                </div>
                <div className="w-20">
                  <label className="label mb-1 block">Urutan</label>
                  <input type="number" value={modFormData.sort_order} onChange={e => setModFormData({...modFormData, sort_order: e.target.value})} className="field field-mono" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleSaveMod(group.id)} className="button-primary !min-h-10 !py-1">Simpan</button>
                  <button onClick={() => setActiveGroupModForm(null)} className="button-secondary !min-h-10 !py-1">Batal</button>
                </div>
              </div>
            )}

            <table className="w-full text-left text-sm">
              <tbody className="divide-y divide-rule">
                {group.modifiers.map(mod => (
                  <tr key={mod.id} className="hover:bg-paper2/50">
                    <td className="p-3 pl-4">{mod.name} <span className="text-[10px] uppercase text-ink3 ml-2 border border-rule2 px-1 rounded bg-paper2">{mod.type}</span></td>
                    <td className="p-3 text-right font-mono w-32">{formatRupiah(mod.price)}</td>
                    <td className="p-3 text-right font-mono w-24">#{mod.sort_order}</td>
                    <td className="p-3 flex items-center justify-end gap-2 w-32 pr-4">
                      <button 
                        onClick={() => {
                          setModFormData({
                            id: mod.id,
                            name: mod.name,
                            type: mod.type,
                            price: mod.price.toString(),
                            sort_order: mod.sort_order.toString()
                          })
                          setActiveGroupModForm(group.id)
                        }}
                        className="text-ink3 hover:text-ink text-xs font-bold"
                      >
                        EDIT
                      </button>
                      <button 
                        onClick={() => handleDeleteMod(mod.id, mod.name)}
                        className="text-stamp hover:text-stamp/80 text-xs font-bold"
                      >
                        HAPUS
                      </button>
                    </td>
                  </tr>
                ))}
                {group.modifiers.length === 0 && (
                  <tr><td colSpan={4} className="p-4 text-center text-ink3 text-sm">Belum ada modifier</td></tr>
                )}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  )
}
