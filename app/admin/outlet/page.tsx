'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function OutletConfigPage() {
  const [loading, setLoading] = useState(true)
  const [mallAdjustment, setMallAdjustment] = useState('0')
  const [availableSizes, setAvailableSizes] = useState({
    R: true,
    L: true,
    J: true,
  })

  const fetchConfig = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('outlet_config').select('*')
    if (error) {
      alert(error.message)
    } else {
      data?.forEach(conf => {
        if (conf.key === 'mall_adjustment') {
          setMallAdjustment(conf.value?.toString() || '0')
        } else if (conf.key === 'available_sizes') {
          setAvailableSizes(conf.value || { R: true, L: true, J: true })
        }
      })
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchConfig()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const updates = [
      { key: 'mall_adjustment', value: parseInt(mallAdjustment) || 0 },
      { key: 'available_sizes', value: availableSizes },
    ]

    const { error } = await supabase
      .from('outlet_config')
      .upsert(updates, { onConflict: 'key' })
    
    if (error) {
      alert('Gagal menyimpan: ' + error.message)
    } else {
      alert('Konfigurasi berhasil disimpan!')
    }
  }

  if (loading) {
    return <div className="p-4 text-ink3 text-sm">Memuat...</div>
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">Konfigurasi Outlet</h1>
      
      <form onSubmit={handleSave} className="card p-6 space-y-6">
        <div>
          <label className="label mb-2 block">Mall Adjustment (Rp)</label>
          <p className="text-xs text-ink3 mb-3">
            Biaya tambahan yang diterapkan untuk seluruh menu jika outlet berlokasi di mall.
          </p>
          <input 
            type="number" 
            value={mallAdjustment} 
            onChange={e => setMallAdjustment(e.target.value)} 
            className="field field-mono w-full sm:w-1/2" 
          />
        </div>

        <hr className="border-rule" />

        <div>
          <label className="label mb-2 block">Available Sizes</label>
          <p className="text-xs text-ink3 mb-3">
            Pilih ukuran cup yang tersedia saat ini di outlet.
          </p>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={availableSizes.R} 
                onChange={e => setAvailableSizes({...availableSizes, R: e.target.checked})} 
              />
              <span className="font-mono font-bold">Reguler (R)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={availableSizes.L} 
                onChange={e => setAvailableSizes({...availableSizes, L: e.target.checked})} 
              />
              <span className="font-mono font-bold">Large (L)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={availableSizes.J} 
                onChange={e => setAvailableSizes({...availableSizes, J: e.target.checked})} 
              />
              <span className="font-mono font-bold">Jumbo (J)</span>
            </label>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button type="submit" className="button-primary">
            Simpan Konfigurasi
          </button>
        </div>
      </form>
    </div>
  )
}
