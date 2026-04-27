"use client"

import { useState } from "react"
import { Position } from "./types"
import { fmtUsd, fmtPct } from "./utils"
import { cn } from "@/lib/utils"
import { RefreshCw, Trash2 } from "lucide-react"

interface PositionsTableProps {
  positions: Position[]
  liveprices: Record<string, number | null>
  onRefreshPrices: () => void
  onDelete: (ticker: string, week: string) => void
  refreshing: boolean
}

export function PositionsTable({
  positions,
  liveprices,
  onRefreshPrices,
  onDelete,
  refreshing,
}: PositionsTableProps) {
  const [filter, setFilter] = useState<"all" | "open" | "closed">("all")

  const filtered = positions.filter((p) => {
    if (filter === "open") return p.status === "open"
    if (filter === "closed") return p.status === "closed"
    return true
  }).sort((a, b) => b.buyDate.localeCompare(a.buyDate))

  const openTickers = positions
    .filter((p) => p.status === "open")
    .map((p) => p.ticker)
    .join(",")

  return (
    <div className="rounded-xl border border-[#E8E8E3] bg-white overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8E8E3] px-5 py-3">
        <h2 className="text-sm font-semibold text-[#252420]">All Positions</h2>
        <div className="flex items-center gap-2">
          {(["all", "open", "closed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                filter === f
                  ? "bg-[#252420] text-white"
                  : "bg-[#F4F4F0] text-[#8B8B85] hover:bg-[#E8E8E3]"
              )}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          {openTickers && (
            <button
              onClick={onRefreshPrices}
              disabled={refreshing}
              className="flex items-center gap-1.5 rounded-full bg-[#252420] px-3 py-1 text-xs font-medium text-white hover:bg-[#3a3a35] disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={cn("h-3 w-3", refreshing && "animate-spin")} />
              Live Prices
            </button>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E8E8E3] bg-[#FAFAF8]">
              <th className="px-5 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-[#8B8B85]">Ticker</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-[#8B8B85]">Week</th>
              <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide text-[#8B8B85]">Invested</th>
              <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide text-[#8B8B85]">P&L</th>
              <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide text-[#8B8B85]">Return</th>
              <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide text-[#8B8B85]">Live</th>
              <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide text-[#8B8B85]">Status</th>
              <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide text-[#8B8B85]">Date</th>
              <th className="px-4 py-2.5 text-center text-xs font-medium uppercase tracking-wide text-[#8B8B85]"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const livePrice = liveprices[p.ticker]
              const liveValue = livePrice ? livePrice * p.shares : null
              const livePnl = liveValue ? liveValue - p.invested : null
              const livePct = livePnl && p.invested > 0 ? (livePnl / p.invested) * 100 : null

              const displayPnl = p.status === "closed" ? p.pnl : (livePnl ?? p.pnl)
              const displayPct = p.status === "closed" ? p.pnlPct : (livePct ?? p.pnlPct)

              return (
                <tr key={`${p.ticker}-${p.week}`} className="border-b border-[#E8E8E3] last:border-0 hover:bg-[#FAFAF8] transition-colors">
                  <td className="px-5 py-3">
                    <span className="font-semibold text-[#252420]">{p.ticker}</span>
                  </td>
                  <td className="px-4 py-3 text-[#8B8B85] text-xs">{p.week}</td>
                  <td className="px-4 py-3 text-right text-[#252420]">${p.invested.toFixed(2)}</td>
                  <td className={cn("px-4 py-3 text-right font-semibold", displayPnl >= 0 ? "text-emerald-600" : "text-red-500")}>
                    {fmtUsd(displayPnl)}
                  </td>
                  <td className={cn("px-4 py-3 text-right font-semibold", displayPct >= 0 ? "text-emerald-600" : "text-red-500")}>
                    {fmtPct(displayPct)}
                  </td>
                  <td className="px-4 py-3 text-right text-[#8B8B85] text-xs">
                    {p.status === "open" && livePrice ? (
                      <span className="font-medium text-[#252420]">${livePrice.toFixed(2)}</span>
                    ) : p.status === "open" ? (
                      <span className="text-[#C0C0BA]">—</span>
                    ) : (
                      <span className="text-[#C0C0BA]">closed</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1",
                        p.status === "open"
                          ? "bg-amber-50 text-amber-700 ring-amber-200"
                          : p.pnl >= 0
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                          : "bg-red-50 text-red-600 ring-red-200"
                      )}
                    >
                      {p.status === "open" ? "open" : p.pnl >= 0 ? "win" : "loss"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-[#8B8B85]">{p.buyDate}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => onDelete(p.ticker, p.week)}
                      className="text-[#C0C0BA] hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-5 py-8 text-center text-sm text-[#8B8B85]">
                  No positions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
