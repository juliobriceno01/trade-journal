import { Trade, Position, WeekSummary, JournalStats } from "./types"

export function buildPositions(trades: Trade[]): Position[] {
  const byKey: Record<string, { buys: Trade[]; sells: Trade[] }> = {}

  for (const t of trades) {
    const key = `${t.ticker}__${t.week}`
    if (!byKey[key]) byKey[key] = { buys: [], sells: [] }
    if (t.type === "buy") byKey[key].buys.push(t)
    else byKey[key].sells.push(t)
  }

  return Object.entries(byKey).map(([key, { buys, sells }]) => {
    const [ticker, week] = key.split("__")
    const invested = buys.reduce((s, t) => s + t.amount, 0)
    const received = sells.reduce((s, t) => s + t.amount, 0)
    const pnl = received - invested
    const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0
    const status = sells.length === 0 ? "open" : "closed"
    const totalShares = invested / (buys[0]?.price || 1)
    const buyDate = buys.map((b) => b.date).sort()[0] || ""
    const sellDate = sells.map((s) => s.date).sort().reverse()[0]

    return {
      ticker,
      week,
      invested,
      received,
      pnl,
      pnlPct,
      status,
      buyDate,
      sellDate,
      shares: totalShares,
    }
  })
}

export function buildWeeks(positions: Position[]): WeekSummary[] {
  const byWeek: Record<string, Position[]> = {}
  for (const p of positions) {
    if (!byWeek[p.week]) byWeek[p.week] = []
    byWeek[p.week].push(p)
  }

  return Object.entries(byWeek)
    .map(([week, trades]) => {
      const closed = trades.filter((t) => t.status === "closed")
      const open = trades.filter((t) => t.status === "open")
      const deployed = trades.reduce((s, t) => s + t.invested, 0)
      const returned = closed.reduce((s, t) => s + t.received, 0)
      const realizedPnl = closed.reduce((s, t) => s + t.pnl, 0)
      const wins = closed.filter((t) => t.pnl >= 0).length
      const losses = closed.filter((t) => t.pnl < 0).length
      return {
        week,
        deployed,
        returned,
        pnl: realizedPnl,
        pnlPct: deployed > 0 ? (realizedPnl / deployed) * 100 : 0,
        wins,
        losses,
        open: open.length,
        trades,
      }
    })
    .sort((a, b) => {
      const dateA = a.trades[0]?.buyDate || ""
      const dateB = b.trades[0]?.buyDate || ""
      return dateA.localeCompare(dateB)
    })
}

export function buildStats(positions: Position[]): JournalStats {
  const closed = positions.filter((p) => p.status === "closed")
  const open = positions.filter((p) => p.status === "open")
  const wins = closed.filter((p) => p.pnl >= 0)
  const losses = closed.filter((p) => p.pnl < 0)
  const totalDeployed = positions.reduce((s, p) => s + p.invested, 0)
  const totalPnl = closed.reduce((s, p) => s + p.pnl, 0)

  const sortedByPnl = [...closed].sort((a, b) => b.pnlPct - a.pnlPct)

  return {
    totalDeployed,
    totalPnl,
    totalPnlPct: totalDeployed > 0 ? (totalPnl / totalDeployed) * 100 : 0,
    winRate: closed.length > 0 ? (wins.length / closed.length) * 100 : 0,
    wins: wins.length,
    losses: losses.length,
    openPositions: open.length,
    avgWin: wins.length > 0 ? wins.reduce((s, p) => s + p.pnlPct, 0) / wins.length : 0,
    avgLoss: losses.length > 0 ? losses.reduce((s, p) => s + p.pnlPct, 0) / losses.length : 0,
    bestTrade: sortedByPnl[0] || null,
    worstTrade: sortedByPnl[sortedByPnl.length - 1] || null,
  }
}

export function fmt(n: number, decimals = 2) {
  return n.toFixed(decimals)
}

export function fmtUsd(n: number) {
  const abs = Math.abs(n)
  const str = abs.toFixed(2)
  return `${n < 0 ? "-" : "+"}$${str}`
}

export function fmtPct(n: number) {
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`
}
