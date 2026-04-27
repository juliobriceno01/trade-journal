"use client"

import { WeekSummary } from "./types"
import { fmtUsd, fmtPct } from "./utils"
import { cn } from "@/lib/utils"

interface WeeklyBreakdownProps {
  weeks: WeekSummary[]
}

export function WeeklyBreakdown({ weeks }: WeeklyBreakdownProps) {
  if (weeks.length === 0) return null

  const totalPnl = weeks.reduce((s, w) => s + w.pnl, 0)

  return (
    <div className="rounded-xl border border-[#E8E8E3] bg-white overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#E8E8E3] px-5 py-3">
        <h2 className="text-sm font-semibold text-[#252420]">Weekly Breakdown</h2>
        <span className={cn("text-sm font-semibold", totalPnl >= 0 ? "text-emerald-600" : "text-red-500")}>
          {fmtUsd(totalPnl)} total realized
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E8E8E3] bg-[#FAFAF8]">
              <th className="px-5 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-[#8B8B85]">Week</th>
              <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide text-[#8B8B85]">Deployed</th>
              <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide text-[#8B8B85]">P&L</th>
              <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide text-[#8B8B85]">Return</th>
              <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide text-[#8B8B85]">W/L</th>
              <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide text-[#8B8B85]">Open</th>
            </tr>
          </thead>
          <tbody>
            {weeks.map((w) => (
              <tr key={w.week} className="border-b border-[#E8E8E3] last:border-0 hover:bg-[#FAFAF8] transition-colors">
                <td className="px-5 py-3 font-medium text-[#252420]">{w.week}</td>
                <td className="px-4 py-3 text-right text-[#252420]">${w.deployed.toFixed(2)}</td>
                <td className={cn("px-4 py-3 text-right font-semibold", w.pnl >= 0 ? "text-emerald-600" : "text-red-500")}>
                  {fmtUsd(w.pnl)}
                </td>
                <td className={cn("px-4 py-3 text-right font-semibold", w.pnlPct >= 0 ? "text-emerald-600" : "text-red-500")}>
                  {fmtPct(w.pnlPct)}
                </td>
                <td className="px-4 py-3 text-right text-[#8B8B85]">
                  <span className="text-emerald-600">{w.wins}W</span>
                  {" / "}
                  <span className="text-red-500">{w.losses}L</span>
                </td>
                <td className="px-4 py-3 text-right text-[#8B8B85]">
                  {w.open > 0 ? (
                    <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
                      {w.open} open
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                      closed
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
