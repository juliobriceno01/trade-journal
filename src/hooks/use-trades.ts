"use client"

import { useState, useCallback, useEffect } from "react"
import { Trade } from "@/components/journal/types"

const ADDITIONS_KEY = "trade-journal-additions-v1"

export function useTrades() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/data/trades.json")
      .then(r => r.json())
      .then((data: { trades: Trade[] }) => {
        try {
          const stored = localStorage.getItem(ADDITIONS_KEY)
          const additions: Trade[] = stored ? JSON.parse(stored) : []
          setTrades([...data.trades, ...additions])
        } catch {
          setTrades(data.trades)
        }
      })
      .catch(() => setTrades([]))
      .finally(() => setLoading(false))
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
      try {
        const stored = localStorage.getItem(ADDITIONS_KEY)
        const additions: Trade[] = stored ? JSON.parse(stored) : []
        localStorage.setItem(ADDITIONS_KEY, JSON.stringify([...additions, newTrade]))
      } catch { /* ignore */ }
      return updated
    })
  }, [])

  const deleteTrade = useCallback((ticker: string, week: string) => {
    setTrades(prev => {
      const updated = prev.filter(t => !(t.ticker === ticker && t.week === week))
      try {
        const stored = localStorage.getItem(ADDITIONS_KEY)
        const additions: Trade[] = stored ? JSON.parse(stored) : []
        localStorage.setItem(
          ADDITIONS_KEY,
          JSON.stringify(additions.filter(t => !(t.ticker === ticker && t.week === week)))
        )
      } catch { /* ignore */ }
      return updated
    })
  }, [])

  return { trades, loading, addTrade, deleteTrade }
}
