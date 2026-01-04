# Goal Update Analyzer (v0)

A tiny local web application for analyzing goal updates using simple deterministic heuristics. Built as a learning project to practice with Cursor and explore the development workflow before potentially integrating with external AI APIs.

## Overview

This application allows you to input goal updates and receive:
- **Summary**: 2-3 key bullet points extracted from your text
- **Sentiment Analysis**: Classification as Positive, Neutral, or Negative
- **Next Step Suggestion**: Actionable advice based on sentiment

All analysis is performed using simple heuristics (no external API calls), making it perfect for local development and testing.

## Features

- **Simple Analysis**: Heuristic-based sentiment detection and summary extraction
- **Local Storage**: Automatically saves the last 10 updates in browser localStorage
- **Read-Only History**: Click any saved update to view full analysis in a modal
- **Collapsible Sidebar**: Toggle sidebar visibility to maximize workspace
- **Clean UI**: Modern, responsive design that works on desktop and mobile
- **No Dependencies**: Minimal setup - just Node.js and Express

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

1. **Enter your goal update** in the textarea (e.g., "Made great progress today! Completed my morning workout and finished the first chapter of my book.")

2. **Click "Analyze"** or press `Ctrl/Cmd + Enter` to analyze your text

3. **View results**:
   - Summary bullets appear at the top
   - Sentiment is color-coded (green for positive, gray for neutral, red for negative)
   - Suggested next step is displayed at the bottom

4. **Access saved updates**:
   - Recent updates appear in the collapsible sidebar
   - Click any saved update to view full analysis in read-only mode
   - The sidebar can be toggled on/off to save space

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

## Future Enhancements

This v0 implementation uses simple heuristics. The code is structured to make it easy to:

- **Replace with AI API**: The `analyzer.js` module exports a single `analyzeText()` function. To integrate with Claude or another AI service, simply replace the implementation while keeping the same function signature.

- **Add more features**: 
  - Export analysis results
  - Search/filter saved updates
  - Custom sentiment keywords
  - Analysis history statistics

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

