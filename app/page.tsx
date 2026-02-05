'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { useDarkMode } from "@/lib/dark-mode"
import { supabase } from "@/lib/supabase"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { SearchIcon, PlusIcon, EditIcon, TrashIcon, LogOutIcon, SunIcon, MoonIcon } from "lucide-react"
import { ChartSection } from "@/components/chart-section"

export default function Page() {
  const router = useRouter()
  const { user, loading, signOut } = useAuth()
  const { darkMode, toggleDarkMode } = useDarkMode()
  const [activeTab, setActiveTab] = useState("tab1")
  const [searchQuery, setSearchQuery] = useState("")
  const [filter1, setFilter1] = useState("all")
  const [filter2, setFilter2] = useState("all")
  const [filter3, setFilter3] = useState("all")
  const [data, setData] = useState<any[]>([])
  const [allData, setAllData] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(false)

  // Redirect to login if not authenticated
  if (!loading && !user) {
    router.push('/login')
    return null
  }

  // Map tab values to database jenis values
  const getJenisFromTab = (tab: string) => {
    switch (tab) {
      case "tab1": return "rumah"
      case "tab2": return "anak"
      case "tab3": return "holiday"
      case "tab4": return "statistik"
      default: return "rumah"
    }
  }

  // Map tab values to display labels
  const getTabLabel = (tab: string) => {
    switch (tab) {
      case "tab1": return "Rumah"
      case "tab2": return "Anak"
      case "tab3": return "Holiday"
      case "tab4": return "Statistik"
      default: return "Rumah"
    }
  }

  // Fetch data from Supabase for current tab
  const fetchData = async () => {
    setLoadingData(true)
    try {
      const jenis = getJenisFromTab(activeTab)
      const { data: result, error } = await supabase
        .from('tabungan_master')
        .select('*')
        .eq('jenis', jenis)
        .eq('is_active', true)
        .order('date', { ascending: false })

      if (error) {
        console.error('Error fetching data:', error)
      } else {
        setData(result || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoadingData(false)
    }
  }

  // Fetch all data for summary cards
  const fetchAllData = async () => {
    try {
      const { data: result, error } = await supabase
        .from('tabungan_master')
        .select('*')
        .eq('is_active', true)
        .order('date', { ascending: false })

      if (error) {
        console.error('Error fetching all data:', error)
      } else {
        setAllData(result || [])
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  useEffect(() => {
    fetchData()
    fetchAllData()
  }, [activeTab])

  const filteredData = data.filter(item =>
    item.nominal.toString().includes(searchQuery.toLowerCase()) ||
    item.keterangan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.date?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase
        .from('tabungan_master')
        .update({ is_active: false })
        .eq('id', id)

      if (error) {
        console.error('Error deleting data:', error)
      } else {
        fetchData() // Refresh data after deletion
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Aktif": return "bg-green-100 text-green-800"
      case "Pending": return "bg-yellow-100 text-yellow-800"
      case "Selesai": return "bg-blue-100 text-blue-800"
      case "Dalam Proses": return "bg-purple-100 text-purple-800"
      case "Jatuh Tempo": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Keuangan</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">Selamat datang, {user?.email?.split('@')[0]}</p>
          </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {/* <Button className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white">
              <PlusIcon className="mr-2 h-4 w-4" />
              Tambah Baru
            </Button> */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={toggleDarkMode}
              className="flex items-center space-x-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {darkMode ? (
                <>
                  <SunIcon className="h-4 w-4 text-yellow-500" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <MoonIcon className="h-4 w-4 text-blue-600" />
                  <span>Dark</span>
                </>
              )}
            </Button>
            <Button variant="outline" onClick={signOut} className="flex-1 sm:flex-none border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
              <LogOutIcon className="mr-2 h-4 w-4" />
              Keluar
            </Button>
          </div>
        </div>
      </div>

      {/* 4 Cards Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Rumah</CardTitle>
            <CardDescription className="text-xs">Total tabungan rumah</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">Rp {allData.filter(item => item.jenis === 'rumah').reduce((sum, item) => sum + item.nominal, 0).toLocaleString('id-ID')}</div>
            <div className="text-xs text-gray-600">{allData.filter(item => item.jenis === 'rumah').length} data</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Anak</CardTitle>
            <CardDescription className="text-xs">Total tabungan anak</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">Rp {allData.filter(item => item.jenis === 'anak').reduce((sum, item) => sum + item.nominal, 0).toLocaleString('id-ID')}</div>
            <div className="text-xs text-gray-600">{allData.filter(item => item.jenis === 'anak').length} data</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Holiday</CardTitle>
            <CardDescription className="text-xs">Total tabungan holiday</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">Rp {allData.filter(item => item.jenis === 'holiday').reduce((sum, item) => sum + item.nominal, 0).toLocaleString('id-ID')}</div>
            <div className="text-xs text-gray-600">{allData.filter(item => item.jenis === 'holiday').length} data</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Semua</CardTitle>
            <CardDescription className="text-xs">Total semua kategori aktif</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">Rp {allData.reduce((sum, item) => sum + item.nominal, 0).toLocaleString('id-ID')}</div>
            <div className="text-xs text-gray-600">{allData.length} data aktif</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-4">
            {[
              { id: "tab1", label: "Rumah" },
              { id: "tab2", label: "Anak" },
              { id: "tab3", label: "Holiday" },
              { id: "tab4", label: "Statistik" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex-1 min-w-[120px] ${
                  activeTab === tab.id
                    ? "bg-blue-100 text-blue-700 border-b-2 border-blue-500 dark:bg-blue-900 dark:text-blue-200"
                    : "text-gray-600 hover:text-gray-900 bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters and Search */}
          <div className="space-y-4">
            {/* <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Select value={filter1} onValueChange={(value) => setFilter1(value || "all")}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter 1" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filter2} onValueChange={(value) => setFilter2(value || "all")}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter 2" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="high">Tinggi</SelectItem>
                  <SelectItem value="medium">Sedang</SelectItem>
                  <SelectItem value="low">Rendah</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filter3} onValueChange={(value) => setFilter3(value || "all")}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter 3" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="this-month">Bulan Ini</SelectItem>
                  <SelectItem value="last-month">Bulan Lalu</SelectItem>
                </SelectContent>
              </Select>
            </div> */}

            <div className="flex justify-end">
              <Button className="w-full sm:w-auto flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white" onClick={() => router.push(`/form?tab=${activeTab}`)}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Transaksi Tabungan 
              </Button>
            </div>
          </div>

          {/* List */}
          {activeTab === "tab4" ? (
            // Statistik Tab Content
            <ChartSection allData={allData} />
          ) : (
            // Regular Tab Content
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 divide-y">
              {/* Mobile List View */}
              <div className="sm:hidden divide-y">
                {filteredData.map((item) => (
                  <div key={item.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium text-sm">{item.nominal >= 0 ? 'Rp' : '-Rp'} {Math.abs(item.nominal).toLocaleString('id-ID')}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{item.date}</div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => router.push(`/form?tab=${activeTab}&edit=${item.id}`)}
                        >
                          <EditIcon className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(item.id)}
                        >
                          <TrashIcon className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {item.keterangan || '-'}
                    </div>
                    <div className="flex justify-between items-center">
                      <Badge className={`text-xs px-2 py-1 ${
                        item.nominal >= 0 
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}>
                        {item.nominal >= 0 ? 'Pemasukan' : 'Pengeluaran'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block">
                <div className="grid grid-cols-5 gap-2 p-3 bg-gray-50 dark:bg-gray-700 font-semibold text-xs text-gray-600 dark:text-gray-200 uppercase tracking-wide">
                  <div>Nominal</div>
                  <div>Kategori</div>
                  <div>Keterangan</div>
                  <div>Tipe</div>
                  <div>Aksi</div>
                </div>
                
                {filteredData.map((item) => (
                  <div key={item.id} className="p-3">
                    <div className="grid grid-cols-5 gap-2 items-center">
                      <div className="sm:col-span-1">
                        <div className={`font-medium text-sm ${item.nominal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.nominal >= 0 ? 'Rp' : '-Rp'} {Math.abs(item.nominal).toLocaleString('id-ID')}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{item.date}</div>
                      </div>
                      <div className="sm:col-span-1">
                        <div className="text-sm text-gray-700 dark:text-gray-200 capitalize">{item.jenis}</div>
                      </div>
                      <div className="sm:col-span-1">
                        <div className="text-sm text-gray-700 dark:text-gray-200">{item.keterangan || '-'}</div>
                      </div>
                      <div className="sm:col-span-1">
                        <Badge className={`text-xs px-2 py-1 ${
                          item.nominal >= 0 
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}>
                          {item.nominal >= 0 ? 'Pemasukan' : 'Pengeluaran'}
                        </Badge>
                      </div>
                      <div className="sm:col-span-1 flex justify-end space-x-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => router.push(`/form?tab=${activeTab}&edit=${item.id}`)}
                        >
                          <EditIcon className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(item.id)}
                        >
                          <TrashIcon className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}