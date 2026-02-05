'use client'

import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Card as ChartCard } from '@/components/ui/card'

interface ChartData {
  name: string
  value: number
  color: string
}

interface MonthlyData {
  month: string
  positive: number
  negative: number
}

interface ChartSectionProps {
  allData: any[]
}

export function ChartSection({ allData }: ChartSectionProps) {
  // Prepare pie chart data
  const categoryData: ChartData[] = [
    { 
      name: 'Rumah', 
      value: allData.filter(item => item.jenis === 'rumah').reduce((sum, item) => sum + item.nominal, 0), 
      color: '#3b82f6' 
    },
    { 
      name: 'Anak', 
      value: allData.filter(item => item.jenis === 'anak').reduce((sum, item) => sum + item.nominal, 0), 
      color: '#10b981' 
    },
    { 
      name: 'Holiday', 
      value: allData.filter(item => item.jenis === 'holiday').reduce((sum, item) => sum + item.nominal, 0), 
      color: '#f59e0b' 
    }
  ].filter(item => item.value > 0)

  const total = categoryData.reduce((sum, item) => sum + item.value, 0)

  // Prepare monthly data for line chart
  const monthlyData: MonthlyData[] = Object.entries(
    allData.reduce((acc, item) => {
      const month = new Date(item.date).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })
      if (!acc[month]) acc[month] = { positive: 0, negative: 0 }
      if (item.nominal > 0) {
        acc[month].positive += item.nominal
      } else {
        acc[month].negative += Math.abs(item.nominal)
      }
      return acc
    }, {} as Record<string, { positive: number, negative: number }>)
  ).map(([month, data]) => ({
    month,
    positive: data.positive,
    negative: data.negative
  })).slice(0, 6)

  // Custom tooltip for pie chart
  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: ChartData = payload[0].payload
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0'
      return (
        <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow">
          <p className="text-sm font-medium">{data.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Rp {data.value.toLocaleString('id-ID')} ({percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  // Custom tooltip for line chart
  const LineTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow">
          <p className="text-sm font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey === 'positive' ? 'Pemasukan' : 'Pengeluaran'}: Rp {entry.value.toLocaleString('id-ID')}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Distribusi Kategori</CardTitle>
            <CardDescription className="text-xs">Persentase tabungan per kategori</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Pergerakan Keuangan</CardTitle>
            <CardDescription className="text-xs">Pendapatan vs Pengeluaran per bulan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={(value) => `Rp ${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<LineTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="positive" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="negative" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Detail Statistik</CardTitle>
          <CardDescription className="text-xs">Informasi lebih lanjut tentang data keuangan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                +Rp {allData.filter(item => item.nominal > 0).reduce((sum, item) => sum + item.nominal, 0).toLocaleString('id-ID')}
              </div>
              <div className="text-xs text-gray-600">Total Pemasukan</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">
                -Rp {Math.abs(allData.filter(item => item.nominal < 0).reduce((sum, item) => sum + item.nominal, 0)).toLocaleString('id-ID')}
              </div>
              <div className="text-xs text-gray-600">Total Pengeluaran</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                Rp {allData.reduce((sum, item) => sum + item.nominal, 0).toLocaleString('id-ID')}
              </div>
              <div className="text-xs text-gray-600">Saldo Bersih</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{allData.length}</div>
              <div className="text-xs text-gray-600">Total Transaksi</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}