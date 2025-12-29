
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
=======
# inbox-analyzer
Spec-driven inbox analysis prototype
>>>>>>> 9731fa27041347fbd69a256579b9ceb529a476af
=======

# Inbox Analyzer
Spec-driven inbox analysis prototype

## Overview

Inbox Analyzer is a small, offline application designed to help users
understand and reduce email overload.

The project focuses on identifying common email-related problems
(such as spam, promotions, or unnecessary notifications) based on
user-provided notes and suggesting simple actions to improve inbox management.

This project was developed using a **spec-driven development approach**,
where planning and clarity come before implementation.


## Problem Statement

Many users feel overwhelmed by emails but are unsure why.
Important messages get buried under promotions, notifications, and spam.

Inbox Analyzer aims to:
- Identify recurring inbox issues
- Group similar problems
- Suggest practical, easy-to-follow actions


## Development Approach

This project follows a structured, spec-driven process:

1. Define project rules (constitution)
2. Clearly specify what the system should do
3. Plan how it will be built
4. Implement the solution

This approach helped keep the project simple, focused, and easy to maintain.


## What the Application Does

- Accepts notes or observations related to email usage
- Identifies common inbox problems using simple keyword matching
- Groups similar issues together
- Suggests actions such as:
  - Unsubscribing from newsletters
  - Using email filters
  - Reducing notification settings
- Stores data locally and works offline


## Technology Used

- HTML (structure)
- CSS (basic styling)
- JavaScript (logic and data handling)
- Browser localStorage for offline data storage


## Key Design Decisions

- No AI or external services
- Offline-first design
- Simple and explainable logic
- Focus on real user problems
- Lightweight and easy to extend


## Why Spec-Driven Development Helped

By planning the system before coding:

- The scope remained clear
- Features stayed focused on the problem
- Implementation decisions became easier
- The final solution was simpler and cleaner


## Learning Outcomes

- Practical experience with spec-driven development
- Improved planning and design thinking
- Clear separation of problem understanding and coding
- Confidence in structured development approaches


## Status

Academic / learning project  
Offline prototype  
Focused on clarity and usability

