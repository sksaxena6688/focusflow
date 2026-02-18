# FocusFlow — Student Productivity Dashboard

A minimal, distraction-free productivity web app for students. Track habits, tasks, study sessions, notes, and resources — all stored locally in your browser.

## Features

| Module | What it does |
|--------|-------------|
| **Dashboard** | Today's summary — habits, tasks, study time, quick stats |
| **Habits** | Create habits, daily check-ins, 7-day grid, streak tracking |
| **Tasks** | Task CRUD with priority, due dates, filtering & sorting |
| **Study Tracker** | Manual session logging + live timer, per-subject breakdown |
| **Analytics** | Weekly/monthly charts (Chart.js) — study hours, habit rates, tasks |
| **Notes** | Fast note-taking with tags and full-text search |
| **Resources** | Track PDFs, courses, books with progress bars and hours |

## Use Case
FocusFlow is designed for personal productivity management. It allows users to monitor habits, tasks, and study effort without requiring any backend or account system. The goal is simplicity, speed, and distraction-free tracking.

## Tech Stack

- **React 18** + **Vite** — fast dev server
- **Tailwind CSS v4** — utility-first styling
- **Chart.js** + **react-chartjs-2** — analytics charts
- **Lucide React** — icons
- **localStorage** — zero-backend data persistence

## Project Structure

```
src/
├── components/
│   ├── ui/           # Button, Modal, Badge, Input, Card, StatCard, ProgressBar, EmptyState
│   └── Sidebar.jsx
├── hooks/
│   ├── useLocalStorage.js
│   └── useTimer.js
├── pages/
│   ├── Dashboard.jsx
│   ├── Habits.jsx
│   ├── Tasks.jsx
│   ├── StudyTracker.jsx
│   ├── Analytics.jsx
│   ├── Notes.jsx
│   └── Resources.jsx
├── utils/
│   ├── storage.js      # localStorage CRUD helpers
│   └── dateHelpers.js  # date formatting, streak calc
├── App.jsx
├── main.jsx
└── index.css           # Tailwind + custom theme
```

## Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
# → http://localhost:5173

# 3. Build for production
npm run build

# 4. Preview production build
npm run preview
```

## Git Setup & GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# First commit
git commit -m "feat: initial FocusFlow app"

# Add your GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/focusflow.git

# Push
git push -u origin main
```

## Data & Privacy

All data is stored in your browser's `localStorage`. Nothing is sent to any server. To back up your data, open DevTools → Application → Local Storage and export the keys prefixed with `ff_`.

## Design Principles

- Desktop-first layout (220px sidebar + main content)
- Calm academic palette: warm off-white, deep blue, sage green
- No neon, no purple, no flashy animations
- Inter font for clean readability
