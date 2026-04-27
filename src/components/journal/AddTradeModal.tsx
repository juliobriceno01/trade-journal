"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface AddTradeModalProps {
  open: boolean
  onClose: () => void
  onSave: (trade: {
    ticker: string
    type: "buy" | "sell"
    amount: string
    price: string
    date: string
    week: string
    notes: string
  }) => void
}

export function AddTradeModal({ open, onClose, onSave }: AddTradeModalProps) {
  const today = new Date().toISOString().split("T")[0]
  const [form, setForm] = useState({
    ticker: "",
    type: "buy" as "buy" | "sell",
    amount: "",
    price: "",
    date: today,
    week: "",
    notes: "",
  })

  if (!open) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.ticker || !form.amount) return
    onSave(form)
    setForm({ ticker: "", type: "buy", amount: "", price: "", date: today, week: "", notes: "" })
  }

  const inputClass =
    "w-full rounded-lg border border-[#E8E8E3] bg-white px-3 py-2 text-sm text-[#252420] outline-none focus:border-[#252420] focus:ring-1 focus:ring-[#252420] transition-colors placeholder:text-[#C0C0BA]"

  const labelClass = "block text-xs font-medium text-[#8B8B85] mb-1"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-[#252420]">Log Trade</h2>
          <button onClick={onClose} className="text-[#8B8B85] hover:text-[#252420] transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Ticker *</label>
              <input
                className={cn(inputClass, "uppercase")}
                placeholder="CDXS"
                value={form.ticker}
                onChange={(e) => setForm({ ...form, ticker: e.target.value.toUpperCase() })}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Type</label>
              <div className="flex rounded-lg border border-[#E8E8E3] overflow-hidden">
                {(["buy", "sell"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm({ ...form, type: t })}
                    className={cn(
                      "flex-1 py-2 text-sm font-medium transition-colors",
                      form.type === t
                        ? t === "buy"
                          ? "bg-emerald-600 text-white"
                          : "bg-red-500 text-white"
                        : "bg-white text-[#8B8B85] hover:bg-[#FAFAF8]"
                    )}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Amount ($) *</label>
              <input
                className={inputClass}
                placeholder="30.00"
                type="number"
                step="0.01"
                min="0"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Price per share</label>
              <input
                className={inputClass}
                placeholder="2.60"
                type="number"
                step="0.0001"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Date</label>
              <input
                className={inputClass}
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Week label</label>
              <input
                className={inputClass}
                placeholder="Apr 20-24"
                value={form.week}
                onChange={(e) => setForm({ ...form, week: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Notes</label>
            <input
              className={inputClass}
              placeholder="Earnings catalyst, stop hit, etc."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-[#E8E8E3] py-2 text-sm font-medium text-[#8B8B85] hover:bg-[#FAFAF8] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-[#252420] py-2 text-sm font-medium text-white hover:bg-[#3a3a35] transition-colors"
            >
              Save Trade
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
