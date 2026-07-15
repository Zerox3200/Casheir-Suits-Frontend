import React, { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts'
import { useFormatMoney } from '../../hooks/useSettings'

const COLORS = {
  navy: '#1e2a38',
  gold: '#9e7e3a',
  emerald: '#047857',
  amber: '#b45309',
  red: '#dc2626',
  muted: '#8a939e',
}

function MoneyTooltip({ active, payload, formatMoney }) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div
      className="rounded-lg border border-[#1e2a38]/10 bg-white px-3 py-2 text-xs shadow-md"
      style={{ fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif" }}
    >
      <p className="font-semibold text-[#1e2a38]">{item?.payload?.name}</p>
      <p className="mt-0.5 text-[#5c6570]">{formatMoney(item?.value)}</p>
    </div>
  )
}

function CountTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const item = payload[0]?.payload
  return (
    <div
      className="rounded-lg border border-[#1e2a38]/10 bg-white px-3 py-2 text-xs shadow-md"
      style={{ fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif" }}
    >
      <p className="font-semibold text-[#1e2a38]">{item?.name}</p>
      <p className="mt-0.5 text-[#5c6570]">{item?.value}</p>
    </div>
  )
}

export default function StatsBriefCharts({
  todaySales = 0,
  monthlySales = 0,
  totalRevenue = 0,
  totalProfit = 0,
  lowCount = 0,
  outCount = 0,
  totalProducts = 0,
}) {
  const { formatMoney } = useFormatMoney()

  const salesData = useMemo(
    () => [
      { name: 'اليوم', value: Number(todaySales) || 0, fill: COLORS.gold },
      { name: 'الشهر', value: Number(monthlySales) || 0, fill: COLORS.navy },
      {
        name: 'الإيراد',
        value: Number(totalRevenue) || 0,
        fill: COLORS.muted,
      },
      {
        name: 'الربح',
        value: Number(totalProfit) || 0,
        fill: COLORS.emerald,
      },
    ],
    [todaySales, monthlySales, totalRevenue, totalProfit]
  )

  const stockOk = Math.max(
    0,
    Number(totalProducts) - Number(lowCount) - Number(outCount)
  )

  const stockData = useMemo(() => {
    const rows = [
      { name: 'متوفر', value: stockOk, fill: COLORS.emerald },
      { name: 'منخفض', value: Number(lowCount) || 0, fill: COLORS.amber },
      { name: 'نفد', value: Number(outCount) || 0, fill: COLORS.red },
    ]
    const positive = rows.filter((d) => d.value > 0)
    return positive.length > 0
      ? positive
      : [{ name: 'لا بيانات', value: 1, fill: '#d4d0c8' }]
  }, [stockOk, lowCount, outCount])

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <section className="min-w-0 overflow-hidden rounded-2xl border border-[#1e2a38]/8 bg-white p-4 shadow-sm lg:col-span-3">
        <h2 className="mb-1 text-sm font-bold text-[#1e2a38]">
          نظرة مالية سريعة
        </h2>
        <p className="mb-4 text-xs text-[#8a939e]">
          مقارنة المبيعات والإيراد والربح
        </p>
        <div dir="ltr" style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={salesData}
              margin={{ top: 12, right: 12, left: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3814" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#5c6570', fontSize: 12 }}
                axisLine={{ stroke: '#1e2a3820' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#8a939e', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => formatMoney(v)}
                width={72}
              />
              <Tooltip
                content={<MoneyTooltip formatMoney={formatMoney} />}
                cursor={{ fill: '#f7f5f2' }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={52}>
                {salesData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="min-w-0 overflow-hidden rounded-2xl border border-[#1e2a38]/8 bg-white p-4 shadow-sm lg:col-span-2">
        <h2 className="mb-1 text-sm font-bold text-[#1e2a38]">حالة المخزون</h2>
        <p className="mb-4 text-xs text-[#8a939e]">توزيع الأصناف حسب التوفر</p>
        <div dir="ltr" style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stockData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
              >
                {stockData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CountTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="mt-2 flex flex-wrap justify-center gap-3 text-[11px] text-[#5c6570]">
          {stockData.map((s) => (
            <li key={s.name} className="inline-flex items-center gap-1.5">
              <span
                className="inline-block size-2 rounded-full"
                style={{ background: s.fill }}
              />
              {s.name}: {s.value}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
