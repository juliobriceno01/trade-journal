"use client"

import { JournalStats } from "./types"
import { fmtUsd, fmtPct } from "./utils"
import { TrendingUp, TrendingDown, Target, Activity, Award, AlertTriangle } from "lucide-react"

interface StatsPanelProps {
  stats: JournalStats
}

function StatCard({
  label,
  value,
  sub,
  positive,
  icon: Icon,
}: {
  label: string
  value: string
  sub?: string
  positive?: boolean
  icon: React.ElementType
}) {
  const color =
    positive === undefined
      ? "text-[#252420]"
      : positive
      ? "text-emerald-600"
      : "text-red-500"

  return (
    <div className="rounded-xl border border-[#E8E8E3] bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-[#8B8B85]">{label}</span>
        <Icon className="h-4 w-4 text-[#8B8B85]" />
      </div>
      <p className={`mt-2 text-2xl font-semibold ${color}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-[#8B8B85]">{sub}</p>}
    </div>
  )
}

export function StatsPanel({ stats }: StatsPanelProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <StatCard
        label="Total P&L"
        value={fmtUsd(stats.totalPnl)}
        sub={fmtPct(stats.totalPnlPct) + " overall"}
        positive={stats.totalPnl >= 0}
        icon={stats.totalPnl >= 0 ? TrendingUp : TrendingDown}
      />
      <StatCard
        label="Win Rate"
        value={`${stats.winRate.toFixed(0)}%`}
        sub={`${stats.wins}W / ${stats.losses}L`}
        positive={stats.winRate >= 50}
        icon={Target}
      />
      <StatCard
        label="Avg Win"
        value={fmtPct(stats.avgWin)}
        sub="per winning trade"
        positive={stats.avgWin > 0}
        icon={TrendingUp}
      />
      <StatCard
        label="Avg Loss"
        value={fmtPct(stats.avgLoss)}
        sub="per losing trade"
        positive={false}
        icon={TrendingDown}
      />
      <StatCard
        label="Open Positions"
        value={`${stats.openPositions}`}
        sub="not yet closed"
        icon={Activity}
      />
      <StatCard
        label="Best Trade"
        value={stats.bestTrade ? fmtPct(stats.bestTrade.pnlPct) : "—"}
        sub={stats.bestTrade?.ticker || ""}
        positive={!!stats.bestTrade}
        icon={stats.totalPnl >= 0 ? Award : AlertTriangle}
      />
    </div>
  )
}
