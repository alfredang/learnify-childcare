"use client"

import { useState, useMemo } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface RevenueDataPoint {
  date: string
  revenue: number
}

interface RevenueChartProps {
  data: RevenueDataPoint[]
}

function filterByRange(data: RevenueDataPoint[], range: string) {
  const now = new Date()
  let cutoff: Date

  switch (range) {
    case "7d":
      cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case "30d":
      cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case "12m":
      cutoff = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
      break
    default:
      return data
  }

  return data.filter((d) => new Date(d.date) >= cutoff)
}

export function RevenueChart({ data }: RevenueChartProps) {
  const [range, setRange] = useState("all")

  const filtered = useMemo(() => filterByRange(data, range), [data, range])

  const chartData = useMemo(() => {
    return filtered.map((d) => ({
      date: new Date(d.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      revenue: d.revenue / 100,
    }))
  }, [filtered])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Revenue</h3>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="12m">Last 12 months</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="h-[300px] w-full">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                formatter={(value) => [`$${Number(value ?? 0).toFixed(2)}`, "Revenue"]}
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#7c3aed"
                strokeWidth={2}
                dot={{ r: 4, fill: "#7c3aed" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            No revenue data for this period
          </div>
        )}
      </div>
    </div>
  )
}
