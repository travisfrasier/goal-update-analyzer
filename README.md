# Goal Update Analyzer

A local web application for analyzing and organizing personal goal updates using simple deterministic heuristics. Designed for quick capture and review with area categorization, tagging, and an inbox/processed workflow. All data is stored locally in browser localStorage.

## App Overview

A personal goal tracking and log application that analyzes text input using heuristic-based sentiment detection and summary extraction. Supports organization through areas (10 predefined categories), tags (with preset chips), and status workflow (inbox/processed/archived). Features dual view modes (Log and Week views) with filtering capabilities. Built as a learning project with no external APIs or databases required.

## Features

- Heuristic-based sentiment analysis (Positive/Neutral/Negative)
- Summary extraction (2-3 bullet points)
- Next step suggestions based on sentiment
- Area categorization (10 predefined areas with visual color bars)
- Tag system with preset chips and click-to-filter
- Status workflow (inbox/processed/archived)
- Dual view modes: Log (chronological) and Week (last 7 days grouped by area)
- Multiple filtering: status, area, and tags (AND logic)
- Visual indicators: area color bars, inbox dots, processed opacity
- Local storage: all data persisted in browser localStorage
- Responsive dark theme UI optimized for desktop and mobile
- Modal actions: mark processed, archive, restore entries

## Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: Vanilla HTML, CSS, JavaScript (no frameworks)
- **Storage**: Browser localStorage
- **Analysis**: Custom heuristic algorithms (no external APIs)
- **Dependencies**: Express only

## Repo Structure

```
goal-update-analyzer/
├── server.js          # Express server and POST /analyze endpoint
├── analyzer.js        # Heuristic analysis logic (sentiment, summary, next step)
├── package.json       # Dependencies and npm scripts
├── public/            # Static frontend files
│   ├── index.html    # Main HTML page
│   ├── app.js        # Frontend JavaScript (UI, localStorage, filtering)
│   └── style.css     # Stylesheet (dark theme, responsive)
└── README.md         # This file
```

## Quick Start

```bash
npm install
npm start
```

Open `http://localhost:3000` in your browser.

**Alternative command:**
```bash
npm run dev
```
(Currently same as `npm start` - both run `node server.js`)

## Environment Variables

| Name | Required? | Example | Purpose |
|------|-----------|---------|---------|
| PORT | No | `3000` | Server port (defaults to 3000 if not set) |

## Data & Storage

**Storage Location**: Browser localStorage (client-side only)

**Storage Key**: `goalUpdates` (JSON array)

**Entry Schema:**
```javascript
{
  id: number,              // Timestamp-based unique ID
  timestamp: string,       // ISO 8601 timestamp
  text: string,            // Original entry text
  analysis: {              // Analysis results
    summaryBullets: string[],
    sentimentLabel: string, // "Positive" | "Neutral" | "Negative"
    nextStep: string
  },
  area: string,            // Selected area (e.g., "Cubing", "Work", "Misc")
  tags: string[],          // Array of normalized, lowercase tags
  status: string           // "inbox" | "processed" | "archived" (default: "inbox")
}
```

**Backward Compatibility**: Entries without `area`, `tags`, or `status` fields default to:
- `area: "Misc"`
- `tags: []`
- `status: "inbox"`

**Other localStorage Keys**:
- `goalUpdateLastArea`: Last selected area for new entries
- `goalUpdateAreaFilter`: Active area filter selection
- `goalUpdateViewMode`: Current view mode ("log" or "week")
- `goalUpdateTagFilters`: Active tag filters (JSON array)
- `goalUpdateStatusFilter`: Active status filter ("inbox", "processed", "all")

**Limitations**:
- Data is browser-specific (doesn't sync across devices)
- Maximum 10 saved updates (older ones automatically removed)
- Data persists only within the same browser/profile

## Deployment

TODO: No deployment configured. Currently designed for local development only. To deploy:
- Check deployment target (Vercel, Netlify, Railway, etc.)
- Verify static file serving for `/public` directory
- Ensure Node.js runtime available
- Set PORT environment variable if needed

## Maintenance Notes

**Common Issues:**

- **Port already in use**: Set `PORT` environment variable: `PORT=3001 npm start`
- **Data not persisting**: Check browser localStorage (DevTools → Application → Local Storage)
- **Corrupted data**: Clear localStorage: `localStorage.clear()` in browser console
- **Analysis not working**: Verify server is running on correct port, check browser console for errors

**Code Organization:**
- Analysis logic is isolated in `analyzer.js` - easy to replace with AI API
- Frontend logic in `public/app.js` - well-commented for understanding
- No build step required - edit files directly
- Changes to static files (HTML/CSS/JS) require page refresh
- Server changes require restart (`Ctrl+C` then `npm start`)

**Icons/Favicon:**
- Favicon located at `public/favicon.ico`
- Replace file to update icon (may require browser cache clear)

## Roadmap

1. Replace heuristic analysis with AI API integration (analyzer.js is structured for easy replacement)
2. Add search functionality for text content
3. Export analysis results (JSON/CSV)
4. Tag management UI (add/remove/edit preset tags)
5. Custom area definitions (user-defined areas)

## Registry Summary

```yaml
name: goal-update-analyzer
purpose: Personal goal tracking and log application with heuristic-based analysis
origin: Manual
stack: Node.js, Express, Vanilla JavaScript/HTML/CSS
repo_status: active
data_store: localStorage
hosting: local
local_run: npm start
env_required: no
primary_owner: Travis Frasier
```
