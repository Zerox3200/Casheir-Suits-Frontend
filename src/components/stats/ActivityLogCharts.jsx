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

const ENTITY_COLORS = [
  '#1e2a38',
  '#9e7e3a',
  '#047857',
  '#b45309',
  '#0369a1',
  '#7c3aed',
  '#be123c',
]

const ACTION_COLORS = [
  '#9e7e3a',
  '#1e2a38',
  '#047857',
  '#0369a1',
  '#b45309',
  '#7c3aed',
  '#be123c',
  '#0f766e',
  '#a16207',
  '#475569',
]

function CountTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const item = payload[0]?.payload
  return (
    <div
      className="rounded-lg border border-[#1e2a38]/10 bg-white px-3 py-2 text-xs shadow-md"
      style={{ fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif" }}
    >
      <p className="font-semibold text-[#1e2a38]">{item?.name}</p>
      <p className="mt-0.5 text-[#5c6570]">{item?.value} عملية</p>
    </div>
  )
}

function aggregateBy(logs, key) {
  const map = new Map()
  logs.forEach((log) => {
    const label = log[key] || 'أخرى'
    map.set(label, (map.get(label) || 0) + 1)
  })
  return [...map.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

export default function ActivityLogCharts({ logs = [] }) {
  const byEntity = useMemo(() => {
    const rows = aggregateBy(logs, 'entity')
    return rows.length
      ? rows
      : [{ name: 'لا بيانات', value: 1 }]
  }, [logs])

  const byAction = useMemo(() => {
    const rows = aggregateBy(logs, 'action')
    return rows.length
      ? rows.slice(0, 8)
      : [{ name: 'لا بيانات', value: 1 }]
  }, [logs])

  const empty = logs.length === 0

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <section className="min-w-0 overflow-hidden rounded-2xl border border-[#1e2a38]/8 bg-white p-4 shadow-sm lg:col-span-3">
        <h2 className="mb-1 text-sm font-bold text-[#1e2a38]">
          النشاط حسب النوع
        </h2>
        <p className="mb-4 text-xs text-[#8a939e]">
          توزيع العمليات حسب نوع الكيان
        </p>
        <div dir="ltr" style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={byEntity}
              margin={{ top: 12, right: 12, left: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3814" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#5c6570', fontSize: 11 }}
                axisLine={{ stroke: '#1e2a3820' }}
                tickLine={false}
                interval={0}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: '#8a939e', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={36}
              />
              <Tooltip content={<CountTooltip />} cursor={{ fill: '#f7f5f2' }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={48}>
                {byEntity.map((entry, i) => (
                  <Cell
                    key={entry.name}
                    fill={
                      empty
                        ? '#d4d0c8'
                        : ENTITY_COLORS[i % ENTITY_COLORS.length]
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="min-w-0 overflow-hidden rounded-2xl border border-[#1e2a38]/8 bg-white p-4 shadow-sm lg:col-span-2">
        <h2 className="mb-1 text-sm font-bold text-[#1e2a38]">
          النشاط حسب الإجراء
        </h2>
        <p className="mb-4 text-xs text-[#8a939e]">أكثر الإجراءات تكراراً</p>
        <div dir="ltr" style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={byAction}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={78}
                paddingAngle={3}
              >
                {byAction.map((entry, i) => (
                  <Cell
                    key={entry.name}
                    fill={
                      empty
                        ? '#d4d0c8'
                        : ACTION_COLORS[i % ACTION_COLORS.length]
                    }
                  />
                ))}
              </Pie>
              <Tooltip content={<CountTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="mt-2 max-h-24 space-y-1 overflow-y-auto text-[11px]">
          {byAction.map((item, i) => (
            <li
              key={item.name}
              className="flex items-center justify-between gap-2 px-1"
            >
              <span className="flex min-w-0 items-center gap-1.5">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor: empty
                      ? '#d4d0c8'
                      : ACTION_COLORS[i % ACTION_COLORS.length],
                  }}
                />
                <span className="truncate text-[#5c6570]">{item.name}</span>
              </span>
              <span className="shrink-0 font-semibold text-[#1e2a38]">
                {empty ? 0 : item.value}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
