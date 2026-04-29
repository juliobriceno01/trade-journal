"use client"

import { useState, useCallback, useEffect } from "react"
import { Trade } from "@/components/journal/types"

const STORAGE_KEY = "trade-journal-v1"

const SEED_TRADES: Trade[] = [
  { id: "w1-kulr-buy", ticker: "KULR", type: "buy", amount: 16.50, price: 0.55, date: "2026-03-30", week: "Mar 30 - Apr 1", notes: "Thermal management catalyst" },
  { id: "w1-kulr-sell", ticker: "KULR", type: "sell", amount: 17.40, price: 0.58, date: "2026-04-01", week: "Mar 30 - Apr 1", notes: "" },
  { id: "w1-lode-buy", ticker: "LODE", type: "buy", amount: 16.50, price: 0.33, date: "2026-03-30", week: "Mar 30 - Apr 1", notes: "" },
  { id: "w1-lode-sell", ticker: "LODE", type: "sell", amount: 17.20, price: 0.344, date: "2026-04-01", week: "Mar 30 - Apr 1", notes: "" },
  { id: "w1-grce-buy", ticker: "GRCE", type: "buy", amount: 16.50, price: 1.10, date: "2026-03-30", week: "Mar 30 - Apr 1", notes: "" },
  { id: "w1-grce-sell", ticker: "GRCE", type: "sell", amount: 17.50, price: 1.17, date: "2026-04-01", week: "Mar 30 - Apr 1", notes: "" },
  { id: "w1-repl-buy", ticker: "REPL", type: "buy", amount: 16.50, price: 2.20, date: "2026-03-30", week: "Mar 30 - Apr 1", notes: "" },
  { id: "w1-repl-sell", ticker: "REPL", type: "sell", amount: 17.30, price: 2.31, date: "2026-04-01", week: "Mar 30 - Apr 1", notes: "" },
  { id: "w2-pacb-buy", ticker: "PACB", type: "buy", amount: 30.00, price: 1.63, date: "2026-04-20", week: "Apr 20-24", notes: "Genomics momentum" },
  { id: "w2-pacb-sell", ticker: "PACB", type: "sell", amount: 31.34, price: 1.70, date: "2026-04-22", week: "Apr 20-24", notes: "+4.47%" },
  { id: "w2-cdxs-buy", ticker: "CDXS", type: "buy", amount: 30.00, price: 2.60, date: "2026-04-20", week: "Apr 20-24", notes: "April 30 earnings catalyst" },
  { id: "w2-cdxs-sell", ticker: "CDXS", type: "sell", amount: 30.35, price: 2.63, date: "2026-04-24", week: "Apr 20-24", notes: "+1.17%" },
  { id: "w2-oabi-buy", ticker: "OABI", type: "buy", amount: 30.00, price: 1.62, date: "2026-04-20", week: "Apr 20-24", notes: "Antibody discovery pipeline" },
  { id: "w3-oabi-sell", ticker: "OABI", type: "sell", amount: 26.93, price: 1.45, date: "2026-04-27", week: "Apr 27-May 1", notes: "-10.23%" },
  { id: "w2-edit-buy", ticker: "EDIT", type: "buy", amount: 30.00, price: 3.44, date: "2026-04-20", week: "Apr 20-24", notes: "Gene editing sector play" },
  { id: "w3-edit-sell", ticker: "EDIT", type: "sell", amount: 24.43, price: 2.80, date: "2026-04-27", week: "Apr 27-May 1", notes: "-18.57%" },
  { id: "w2-alt-buy", ticker: "ALT", type: "buy", amount: 30.00, price: 3.54, date: "2026-04-20", week: "Apr 20-24", notes: "MASH Phase 3 catalyst" },
  { id: "w3-alt-sell", ticker: "ALT", type: "sell", amount: 24.76, price: 2.92, date: "2026-04-27", week: "Apr 27-May 1", notes: "-17.47%" },
  { id: "w3-hovr-buy", ticker: "HOVR", type: "buy", amount: 25.00, price: 2.12, date: "2026-04-27", week: "Apr 27-May 1", notes: "New Horizon Aircraft" },
  { id: "w3-cast-buy", ticker: "CAST", type: "buy", amount: 20.00, price: 2.94, date: "2026-04-27", week: "Apr 27-May 1", notes: "Freecast media" },
  { id: "w3-gevo-buy", ticker: "GEVO", type: "buy", amount: 25.00, price: 1.84, date: "2026-04-27", week: "Apr 27-May 1", notes: "Sustainable aviation fuel" },
  { id: "w3-clls-buy", ticker: "CLLS", type: "buy", amount: 25.00, price: 3.90, date: "2026-04-27", week: "Apr 27-May 1", notes: "Cellectis gene therapy" },
  { id: "w3-cdxs-buy", ticker: "CDXS", type: "buy", amount: 25.00, price: 2.77, date: "2026-04-27", week: "Apr 27-May 1", notes: "Re-entry ahead of Apr 30 earnings" },
]

export function useTrades() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setTrades(JSON.parse(stored))
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_TRADES))
        setTrades(SEED_TRADES)
      }
    } catch {
      setTrades(SEED_TRADES)
    }
    setLoading(false)
  }, [])

  const addTrade = useCallback((form: {
    ticker: string
    type: "buy" | "sell"
    amount: string
    price: string
    date: string
    week: string
    notes: string
  }) => {
    const newTrade: Trade = {
      id: `trade-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      ticker: form.ticker.toUpperCase(),
      type: form.type,
      amount: parseFloat(form.amount),
      price: parseFloat(form.price) || 0,
      date: form.date,
      week: form.week || "",
      notes: form.notes || "",
    }
    setTrades(prev => {
      const updated = [...prev, newTrade]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const deleteTrade = useCallback((ticker: string, week: string) => {
    setTrades(prev => {
      const updated = prev.filter(t => !(t.ticker === ticker && t.week === week))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  return { trades, loading, addTrade, deleteTrade }
}
