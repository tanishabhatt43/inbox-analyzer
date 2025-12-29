Inbox Pattern Finder — Offline single-page app

What it does
- Let users add short notes about email problems (text, optional type, date).
- Groups similar notes into patterns using a simple, explainable rule-based algorithm.
- Shows likely causes and practical suggestions for each pattern.
- Stores everything locally in the browser (offline-first). Export/Import as JSON.

How to use
1. Open `index.html` in a browser (no server required).
2. Add notes describing what went wrong in your inbox.
3. Click "Analyze patterns" to see grouped patterns, explanations, and suggestions.
4. Use Export to back up your notes and Import to restore.

Implementation notes
- The analysis is a small, deterministic algorithm (Jaccard similarity on token sets).
- No external libraries or network access are required.

Files
- `index.html` — UI
- `app.js` — logic, storage, analysis
- `style.css` — styling
- `speckit.specify` — the formal spec used to build the app

If you want me to:
- convert this into a tiny Electron or desktop app for even easier offline use, or
- add simple local tests or a minimal CI check,
say which you'd prefer and I can implement next.
