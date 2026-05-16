'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import { formatCurrency } from '@/utils/formatters'

interface AdminChartsProps {
  monthlyData: any[]
  planDistribution: any[]
}

const COLORS = ['#1a56db', '#f59e0b', '#10b981', '#8b5cf6']

export function AdminCharts({ monthlyData, planDistribution }: AdminChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Monthly Trend */}
      <div className="lg:col-span-2 premium-card p-6">
        <h2 className="font-semibold mb-4">Monthly Financial Overview</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
            <Tooltip 
              formatter={(v) => formatCurrency(Number(v))} 
              contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} 
            />
            <Bar dataKey="deposits" fill="#1a56db" radius={[4, 4, 0, 0]} name="Deposits" />
            <Bar dataKey="withdrawals" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Withdrawals" />
            <Bar dataKey="investments" fill="#10b981" radius={[4, 4, 0, 0]} name="Investments" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Plan Distribution */}
      <div className="premium-card p-6">
        <h2 className="font-semibold mb-4">Plan Distribution</h2>
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie 
              data={planDistribution} 
              cx="50%" cy="50%" 
              innerRadius={50} 
              outerRadius={70} 
              dataKey="value"
            >
              {planDistribution.map((_: any, i: number) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-1.5 mt-2">
          {planDistribution.map((p: any, i: number) => (
            <div key={p.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                <span>{p.name}</span>
              </div>
              <span className="text-muted-foreground">{p.value} investors</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
