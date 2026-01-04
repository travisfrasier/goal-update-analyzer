Build a tiny local web app called “Goal Update Analyzer (v0)” with NO external AI API calls.

Constraints:
- Must run locally with a single command.
- No auth, no database, no deployment.
- Minimal dependencies.
- I want to fully understand each step.

Tech:
- Use Node.js + Express.
- Serve a single HTML page at / with:
  - a textarea for “today’s update”
  - an Analyze button
  - an output area that shows:
    - Summary (2–3 bullet points)
    - Sentiment label (Positive / Neutral / Negative)
    - Suggested next step (1 bullet)
  - Save the last 10 updates in localStorage and show them in a sidebar list (click to reload).

Backend:
- Implement POST /analyze that takes { text } and returns { summaryBullets, sentimentLabel, nextStep }.
- For v0, implement analysis with simple deterministic heuristics:
  - sentiment: based on a small list of positive/negative keywords + punctuation/emojis
  - summary: split into sentences and pick top 2–3 shortest non-empty sentences (or similar simple logic)
  - next step: if sentiment negative -> suggest “pick one small task”; if positive -> “reinforce habit”; else -> “define next action”
- Add basic validation (empty text, max length).
- Add clear comments so I can understand.

Deliverables:
- Working code with files:
  - package.json
  - server.js (or index.js)
  - public/index.html (and minimal JS/CSS)
- Provide exact run instructions:
  - npm install
  - npm run dev (or start)
- Keep UI clean and modern (simple CSS is fine).
