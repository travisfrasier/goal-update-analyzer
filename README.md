# Goal Update Analyzer (v0)

A tiny local web application for analyzing goal updates using simple deterministic heuristics. Built as a learning project to practice with Cursor and explore the development workflow before potentially integrating with external AI APIs.

## Overview

A personal goal tracking and log application designed for quick capture and review. Input goal updates and receive:
- **Summary**: 2-3 key bullet points extracted from your text
- **Sentiment Analysis**: Classification as Positive, Neutral, or Negative
- **Next Step Suggestion**: Actionable advice based on sentiment

All analysis is performed using simple heuristics (no external API calls), making it perfect for local development and testing. The app supports an inbox/processed workflow to help you organize and review your entries before processing them into more specific systems.

## Features

### Core Analysis
- **Simple Analysis**: Heuristic-based sentiment detection and summary extraction
- **Local Storage**: Automatically saves updates in browser localStorage
- **Read-Only History**: Click any saved update to view full analysis in a modal

### Organization & Filtering
- **Area Classification**: Categorize entries into 10 predefined areas (Running, Fitness/Health, Cubing, Coding/Projects, etc.)
  - Visual area indicators: Each entry shows a colored left border bar unique to its area
  - Area filtering: Filter entries by area in both Log and Week views
- **Tag System**: Add multiple tags to entries for flexible categorization
  - Preset tag chips: Quick selection from common tags (aof5, pb, weekly, milestone, etc.)
  - Click-to-filter: Click any tag pill to toggle it as an active filter
  - Multiple tag filtering: Combine tags with AND logic for precise filtering
  - Active filter display: See and manage active tag filters with removable chips
- **Status Workflow**: Inbox/Processed/Archived workflow for entry management
  - Status filtering: Filter by Inbox, Processed, or view All entries
  - Modal actions: Mark entries as processed, archive them, or restore from archive
  - Visual indicators: Inbox entries show a subtle dot indicator; processed entries have reduced opacity

### Views & Navigation
- **Dual View Modes**: Switch between Log view (all entries) and Week view (last 7 days)
  - **Log View**: Chronological list with area and tag filtering
  - **Week View**: Entries from the last 7 days grouped by area, with summary statistics
- **Collapsible Sidebar**: Toggle sidebar visibility to maximize workspace
- **View Persistence**: Your selected view mode and filters persist across page refreshes

### UI & Design
- **Clean UI**: Modern, responsive design that works on desktop and mobile
- **Soft Glow Dark Theme**: Subtle visual design with muted colors and soft shadows
- **Visual Distinctions**: 
  - Area color bars on the left edge of each entry
  - Faint area labels in the corner (non-clickable metadata)
  - Tag pills for quick filtering
  - Status-based visual cues
- **Mobile-Friendly**: Optimized for screens as narrow as 390px

### Technical
- **No Dependencies**: Minimal setup - just Node.js and Express
- **No Backend Changes Required**: All new features work with existing localStorage structure

## UI

The application features a **soft glow dark theme** with a modern, accessible design:

- **Dark Theme**: Very dark charcoal background (#1a1a1f) with slightly lighter card panels (#24242a) for depth
- **Accent Colors**: Muted blue-violet (#7b8dd4) used sparingly for primary buttons and focus states
- **Soft Glow Effects**: Subtle shadows and glow effects on interactive elements for a polished look
- **Typography**: Clear hierarchy with system font stack for optimal readability
- **Layout**: 
  - **Desktop**: Sidebar on the left for recent updates history, main content area on the right with input, analysis results, and suggestions
  - **Mobile**: Stacked vertical layout with collapsible sidebar, optimized for screens as narrow as 390px
- **Interactive Elements**: 
  - Buttons and inputs have smooth hover/focus states with soft glow
  - Sentiment badges use subtle, muted colors (green for positive, gray for neutral, red for negative)
  - Cards and panels have soft borders and shadows
- **Accessibility**: High contrast text, clear focus indicators, and keyboard navigation support

## Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: Vanilla HTML, CSS, and JavaScript
- **Storage**: Browser localStorage (no database required)
- **Analysis**: Custom heuristic algorithms (no external APIs)

## Project Structure

```
goal update analyzer/
├── package.json          # Dependencies and npm scripts
├── server.js             # Express server and API endpoints
├── analyzer.js           # Heuristic analysis logic
├── public/
│   ├── index.html       # Main HTML page
│   ├── style.css        # Stylesheet
│   └── app.js           # Frontend JavaScript
└── README.md            # This file
```

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher recommended)
- npm (comes with Node.js)

### Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```
   Or:
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   Navigate to `http://localhost:3000`

That's it! The app should be running locally.

## Usage

### Creating Entries

1. **Select an Area** from the dropdown (optional, defaults to previously selected area)
2. **Add Tags** (optional): Type comma-separated tags or click preset chips to add/remove them
3. **Enter your goal update** in the textarea (e.g., "Made great progress today! Completed my morning workout and finished the first chapter of my book.")
4. **Click "Analyze"** or press `Ctrl/Cmd + Enter` to analyze your text

### Viewing Results

After analysis, you'll see:
- **Summary**: 2-3 key bullet points at the top
- **Sentiment**: Color-coded badge (green for positive, gray for neutral, red for negative)
- **Suggested Next Step**: Actionable advice at the bottom

The entry is automatically saved with status="inbox" and appears in your sidebar.

### Managing Entries

**Filtering:**
- Use the **Status filter** to view Inbox, Processed, or All entries (default: Inbox)
- Use the **Area filter** to show entries from specific areas
- **Click tag pills** on any entry to filter by that tag (click again to remove filter)
- Multiple filters work together (e.g., "Inbox" + "Cubing" + tag "aof5")

**View Modes:**
- **Log View**: See all entries chronologically (subject to filters)
- **Week View**: See entries from the last 7 days grouped by area with summary stats

**Entry Actions:**
- Click any entry to open a detailed modal view
- **Mark Processed**: Move inbox entries to processed status
- **Archive**: Move entries to archived (hidden by default)
- **Restore**: Move processed/archived entries back to inbox

**Visual Indicators:**
- **Inbox entries**: Show a small blue dot indicator
- **Processed entries**: Appear with reduced opacity (70%)
- **Area identification**: Each entry has a colored left border bar matching its area

## How It Works

### Sentiment Analysis

The sentiment analyzer uses:
- **Keyword matching**: Positive words (e.g., "good", "great", "progress") and negative words (e.g., "failed", "struggled", "difficult")
- **Emoji detection**: Recognizes positive and negative emojis
- **Punctuation patterns**: Exclamation marks boost positive sentiment; multiple question marks indicate concern
- **Scoring system**: Calculates a sentiment score and classifies as Positive, Neutral, or Negative

### Summary Extraction

- Splits text into sentences using punctuation marks
- Filters out very short sentences (< 10 characters)
- Selects 2-3 shortest sentences (most concise) or first 2-3 if all similar length

### Next Step Suggestion

- **Positive sentiment** → "Reinforce this positive habit"
- **Negative sentiment** → "Pick one small task to move forward"
- **Neutral sentiment** → "Define your next concrete action"

## API Endpoint

### POST /analyze

Analyzes goal update text and returns structured results.

**Request:**
```json
{
  "text": "Your goal update text here..."
}
```

**Response:**
```json
{
  "summaryBullets": [
    "First key point",
    "Second key point",
    "Third key point"
  ],
  "sentimentLabel": "Positive",
  "nextStep": "Reinforce this positive habit"
}
```

**Validation:**
- Text is required and must be a non-empty string
- Maximum length: 5000 characters
- Returns 400 error with descriptive message if validation fails

## Data Model

Each entry stored in localStorage includes:
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
  area: string,            // Selected area (e.g., "Cubing", "Work")
  tags: string[],          // Array of normalized, lowercase tags
  status: string           // "inbox" | "processed" | "archived" (default: "inbox")
}
```

**Backward Compatibility:** Entries without `area`, `tags`, or `status` fields are treated as:
- `area: "Misc"`
- `tags: []`
- `status: "inbox"`

## Future Enhancements

This v0 implementation uses simple heuristics. The code is structured to make it easy to:

- **Replace with AI API**: The `analyzer.js` module exports a single `analyzeText()` function. To integrate with Claude or another AI service, simply replace the implementation while keeping the same function signature.

- **Potential additions**:
  - Search functionality
  - Export analysis results
  - Custom area definitions
  - Tag management UI
  - Batch operations
  - Review dashboards
  - Automation rules and pipelines

## Development Notes

- **No authentication**: This is a local-only app with no user accounts
- **No database**: All data is stored in browser localStorage
- **No deployment**: Designed to run locally for testing and learning
- **Well-commented code**: Each file includes comments explaining the logic for easy understanding

## Limitations

- Analysis is deterministic and rule-based (not AI-powered)
- Sentiment detection may not capture nuanced emotions
- Summary extraction is simple and may miss important context
- localStorage is browser-specific (data doesn't sync across devices)
- Maximum 10 saved updates (older ones are automatically removed)
- No tag management UI (preset tags are hardcoded)
- No batch operations (entries must be processed individually)
- No search functionality (filtering only)
- No export functionality

## Troubleshooting

**Port already in use:**
- Change the port by setting the `PORT` environment variable: `PORT=3001 npm start`

**Analysis not working:**
- Check browser console for errors
- Verify server is running: `http://localhost:3000`
- Check network tab for failed requests

**Saved updates not showing:**
- Check browser localStorage (DevTools → Application → Local Storage)
- Clear localStorage if data is corrupted: `localStorage.clear()` in console

## License

ISC

---

**Built as a learning project** to explore Cursor, development workflows, and prepare for future AI API integration.

