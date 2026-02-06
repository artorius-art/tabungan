'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { useDarkMode } from '@/lib/dark-mode'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ArrowLeftIcon, SaveIcon, EditIcon } from 'lucide-react'

interface FormClientProps {
  tab: string
  editId: string | null
}

export function FormClient({ tab, editId }: FormClientProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { darkMode } = useDarkMode()
  
  const [formData, setFormData] = useState({
    nominal: '',
    keterangan: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Map tab values to database jenis values
  const getJenisFromTab = (tab: string) => {
    switch (tab) {
      case 'tab1': return 'rumah'
      case 'tab2': return 'anak'
      case 'tab3': return 'holiday'
      case 'tab4': return 'statistik'
      default: return 'rumah'
    }
  }

  // Map tab values to display labels
  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'tab1': return 'Rumah'
      case 'tab2': return 'Anak'
      case 'tab3': return 'Holiday'
      case 'tab4': return 'Statistik'
      default: return 'Rumah'
    }
  }

  const jenis = getJenisFromTab(tab)
  const tabLabel = getTabLabel(tab)

  // Fetch existing data for editing
  const fetchEditData = async () => {
    if (!editId) return
    
    try {
      const { data, error } = await supabase
        .from('tabungan_master')
        .select('*')
        .eq('id', editId)
        .single()

      if (error) {
        console.error('Error fetching edit data:', error)
        setError('Gagal memuat data untuk diedit')
      } else if (data) {
        setIsEditing(true)
        setFormData({
          nominal: data.nominal.toString(),
          keterangan: data.keterangan || '',
          date: data.date
        })
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Terjadi kesalahan saat memuat data')
    }
  }

  useEffect(() => {
    fetchEditData()
  }, [editId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // Validate required fields
      if (!formData.nominal || !formData.date) {
        throw new Error('Nominal dan tanggal harus diisi')
      }

      // Parse the nominal value including negative sign
      const numericValue = formData.nominal.replace(/[^0-9-]/g, '')
      const nominalValue = parseInt(numericValue)
      
      if (isNaN(nominalValue)) {
        throw new Error('Nominal harus berupa angka')
      }

      if (isEditing && editId) {
        // Update existing data
        const { error } = await supabase
          .from('tabungan_master')
          .update({
            nominal: nominalValue,
            keterangan: formData.keterangan,
            date: formData.date
          })
          .eq('id', editId)

        if (error) {
          throw error
        }
      } else {
        // Insert new data
        const { error } = await supabase
          .from('tabungan_master')
          .insert({
            jenis: jenis,
            nominal: nominalValue,
            keterangan: formData.keterangan,
            date: formData.date,
            is_active: true
          })

        if (error) {
          throw error
        }
      }

      setSuccess(true)
      
      // Redirect back to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/')
      }, 2000)

    } catch (error: any) {
      setError(error.message || 'Terjadi kesalahan saat menyimpan data')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: string) => {
    // Remove non-numeric characters except minus sign
    const numericValue = value.replace(/[^0-9-]/g, '')
    // Format with thousand separators, preserving minus sign
    const isNegative = numericValue.startsWith('-')
    const absoluteValue = numericValue.replace('-', '')
    const formattedValue = absoluteValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    return isNegative ? '-' + formattedValue : formattedValue
  }

  const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const formattedValue = formatCurrency(value)
    setFormData(prev => ({
      ...prev,
      nominal: formattedValue
    }))
  }

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg flex items-center space-x-2">
                <span>{isEditing ? 'Edit' : 'Tambah'} Data {tabLabel}</span>
                {isEditing && <EditIcon className="h-5 w-5 text-blue-600" />}
              </CardTitle>
              <CardDescription className="text-sm">
                {isEditing 
                  ? `Edit data untuk kategori ${tabLabel}`
                  : `Tambahkan data baru untuk kategori ${tabLabel}`
                }
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={() => router.push('/')}
              className="flex items-center space-x-2 w-full sm:w-auto"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Kembali</span>
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                Data berhasil disimpan! Mengarahkan kembali ke dashboard...
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jenis">Kategori</Label>
                <div className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                  {tabLabel}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Tanggal</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nominal" className="text-sm font-medium">Nominal (Rp)</Label>
              <Input
                id="nominal"
                name="nominal"
                type="text"
                placeholder="Masukkan nominal (contoh: 500.000 atau -200.000)"
                value={formData.nominal}
                onChange={handleNominalChange}
                required={!isEditing}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keterangan" className="text-sm font-medium">Keterangan</Label>
              <Textarea
                id="keterangan"
                name="keterangan"
                placeholder="Masukkan keterangan (opsional)"
                value={formData.keterangan}
                onChange={handleInputChange}
                rows={4}
                className="text-sm"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => router.push('/')}
                disabled={loading}
                className="flex-1 text-sm"
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                disabled={loading || success}
                className="flex items-center space-x-2 flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <SaveIcon className="h-4 w-4" />
                <span className="text-sm">{loading ? 'Menyimpan...' : isEditing ? 'Update Data' : 'Simpan Data'}</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}