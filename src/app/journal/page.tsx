"use client"

import { useState, useCallback } from "react"
import { Plus, BarChart2, BookOpen, RefreshCw, Download } from "lucide-react"
import Link from "next/link"
import { Position } from "@/components/journal/types"
import { buildPositions, buildWeeks, buildStats } from "@/components/journal/utils"
import { StatsPanel } from "@/components/journal/StatsPanel"
import { WeeklyBreakdown } from "@/components/journal/WeeklyBreakdown"
import { PositionsTable } from "@/components/journal/PositionsTable"
import { AddTradeModal } from "@/components/journal/AddTradeModal"
import { useTrades } from "@/hooks/use-trades"

async function fetchLivePrices(tickers: string[]): Promise<Record<string, number | null>> {
  const results: Record<string, number | null> = {}
  await Promise.all(
    tickers.map(async (ticker) => {
      try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`
        const res = await fetch(url)
        const json = await res.json()
        results[ticker] =
          json?.chart?.result?.[0]?.meta?.regularMarketPrice ??
          json?.chart?.result?.[0]?.meta?.previousClose ??
          null
      } catch {
        results[ticker] = null
      }
    })
  )
  return results
}

function exportCsv(trades: ReturnType<typeof useTrades>["trades"]) {
  const header = "id,ticker,type,amount,price,date,week,notes"
  const rows = trades.map((t) =>
    [t.id, t.ticker, t.type, t.amount, t.price, t.date, `"${t.week}"`, `"${t.notes}"`].join(",")
  )
  const csv = [header, ...rows].join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "trades.csv"
  a.click()
  URL.revokeObjectURL(url)
}

export default function JournalPage() {
  const { trades, loading, addTrade, deleteTrade } = useTrades()
  const [liveprices, setLivePrices] = useState<Record<string, number | null>>({})
  const [refreshing, setRefreshing] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  const positions: Position[] = buildPositions(trades)
  const weeks = buildWeeks(positions)
  const stats = buildStats(positions)

  const openTickers = [...new Set(positions.filter((p) => p.status === "open").map((p) => p.ticker))]

  const refreshPrices = useCallback(async () => {
    if (!openTickers.length) return
    setRefreshing(true)
    try {
      const prices = await fetchLivePrices(openTickers)
      setLivePrices(prices)
    } finally {
      setRefreshing(false)
    }
  }, [openTickers.join(",")])  // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddTrade = useCallback((form: {
    ticker: string
    type: "buy" | "sell"
    amount: string
    price: string
    date: string
    week: string
    notes: string
  }) => {
    addTrade(form)
    setModalOpen(false)
  }, [addTrade])

  const handleDelete = useCallback((ticker: string, week: string) => {
    deleteTrade(ticker, week)
  }, [deleteTrade])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-sm text-[#8B8B85]">Loading journal...</div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-white">
      <div
        className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px]"
        aria-hidden="true"
      />

      <main className="mx-auto max-w-5xl px-4 pb-12 pt-8 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="h-5 w-5 text-[#8B8B85]" />
              <h1 className="text-2xl font-semibold tracking-tight text-[#252420]">Trade Journal</h1>
            </div>
            <p className="text-sm text-[#8B8B85]">
              {trades.length} trades logged · {positions.filter(p => p.status === "open").length} open positions
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-lg border border-[#E8E8E3] px-4 py-2 text-sm font-medium text-[#8B8B85] hover:bg-[#FAFAF8] transition-colors"
            >
              <BarChart2 className="h-3.5 w-3.5" />
              Market Report
            </Link>
            <button
              onClick={() => exportCsv(trades)}
              className="flex items-center gap-1.5 rounded-lg border border-[#E8E8E3] px-4 py-2 text-sm font-medium text-[#8B8B85] hover:bg-[#FAFAF8] transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </button>
            <button
              onClick={refreshPrices}
              disabled={refreshing || !openTickers.length}
              className="flex items-center gap-1.5 rounded-lg border border-[#E8E8E3] px-4 py-2 text-sm font-medium text-[#8B8B85] hover:bg-[#FAFAF8] transition-colors disabled:opacity-40"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Live Prices
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-[#252420] px-4 py-2 text-sm font-medium text-white hover:bg-[#3a3a35] transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Log Trade
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <StatsPanel stats={stats} />
          <WeeklyBreakdown weeks={weeks} />
          <PositionsTable
            positions={positions}
            liveprices={liveprices}
            onRefreshPrices={refreshPrices}
            onDelete={handleDelete}
            refreshing={refreshing}
          />
        </div>
      </main>

      <AddTradeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleAddTrade}
      />
    </div>
  )
}
