# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start dev server (http://localhost:3000)
npm run build    # static export to ./out (required before deploy)
npm run lint     # ESLint
```

No test suite exists. There is no `npm test`.

## Architecture

This is a **Next.js 16 static site** (`output: "export"`) deployed to GitHub Pages at `/trade-journal`. Every push to `main` triggers the deploy workflow. The build sets `NEXT_PUBLIC_BASE_PATH=/trade-journal`; all data fetches must prefix paths with `process.env.NEXT_PUBLIC_BASE_PATH || ""`.

### Two independent sections

| Route | Purpose | Data source |
|-------|---------|-------------|
| `/` | Investment report (read-only) | `public/data/report.json` + `report-es.json` |
| `/journal` | Trade journal (interactive) | `public/data/trades.json` |

### Trade Journal data flow

**The authoritative source of truth is `public/data/trades.json`.** To record a trade, edit that file directly — the site fetches it fresh on every load.

`trades.json` → `use-trades.ts` (fetch + merge localStorage additions) → `buildPositions / buildWeeks / buildStats` in `utils.ts` → journal UI components.

#### Critical constraint: sell `week` must match buy `week`

`buildPositions` in `utils.ts` groups trades by the compound key `ticker + "__" + week`. A sell entry whose `week` differs from its buy's `week` will never be matched — the buy position will appear permanently open and the sell will create a ghost entry. **Always set the sell's `week` field to the same value as the corresponding buy's `week`**, even if the actual sale happened in a later calendar week.

#### Trade ID convention

`w{weekNumber}-{ticker-lowercase}-{buy|sell}` — e.g. `w2-oabi-buy`, `w3-oabi-sell`. The week number tracks the batch, not the calendar week of the sell.

#### `use-trades.ts` localStorage behavior

Base trades come from `trades.json` (fetched on mount). Trades added through the UI modal are stored separately under the `trade-journal-additions-v1` localStorage key and merged on top. Updating `trades.json` is immediately reflected for all users without any cache-clearing needed.

### Investment Report data flow

`use-report-data.ts` fetches `report.json` (or `report-es.json` for Spanish, falling back to English if the Spanish file is missing). The report is fully static — all content lives in those JSON files. `src/types/report.ts` defines the full schema.

### Position lifecycle (open vs closed)

A position is **open** when it has buy trades but zero sell trades for that `ticker+week` key. It becomes **closed** the moment any sell is added. Live prices (from Yahoo Finance) are fetched only for open tickers via the "Live Prices" button.

## Trading history context

The owner uses this journal to track short-term trades (typically 1–2 weeks). Trade data summary by week:

- **Week 1 (Mar 30 – Apr 1):** KULR, LODE, GRCE, REPL — all closed
- **Week 2 (Apr 20–24):** PACB, CDXS, OABI, EDIT, ALT — all closed (OABI/EDIT/ALT sold Apr 27)
- **Week 3 (Apr 27 – May 1):** HOVR, CAST, GEVO, CLLS, CDXS — all open as of Apr 29 2026

Ignore VOO and QQQM — those are long-term holdings not tracked in this journal.
