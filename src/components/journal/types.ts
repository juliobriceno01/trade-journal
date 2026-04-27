export interface Trade {
  id: string
  ticker: string
  type: "buy" | "sell"
  amount: number
  price: number
  date: string
  week: string
  notes: string
}

export interface Position {
  ticker: string
  week: string
  invested: number
  received: number
  pnl: number
  pnlPct: number
  status: "open" | "closed"
  buyDate: string
  sellDate?: string
  currentPrice?: number
  currentValue?: number
  unrealizedPnl?: number
  unrealizedPct?: number
  shares: number
}

export interface WeekSummary {
  week: string
  deployed: number
  returned: number
  pnl: number
  pnlPct: number
  wins: number
  losses: number
  open: number
  trades: Position[]
}

export interface JournalStats {
  totalDeployed: number
  totalPnl: number
  totalPnlPct: number
  winRate: number
  wins: number
  losses: number
  openPositions: number
  avgWin: number
  avgLoss: number
  bestTrade: Position | null
  worstTrade: Position | null
}
