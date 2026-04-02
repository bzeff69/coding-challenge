# Streak — Feature Showcase

> **A gamified habit tracker that roasts you when you fail and celebrates you (sarcastically) when you succeed.**

Streak turns daily habit tracking into a game — with streaks, stats, confetti, and a personality that won't let you off easy. Miss a day? *"Your streak died alone. No funeral will be held."* Hit your target? *"Screenshot this before the motivation wears off."* Complete everything? Confetti explosion.

Built with React 19 + TypeScript on the frontend and ASP.NET Core 8 + SQLite on the backend, fully containerized with Docker Compose, and designed to feel fast, fun, and impossible to ignore.

---

## What It Does

**Create habits** with custom names, daily targets (1-10x), and colors. Tap to log progress each day. Build streaks. Watch your stats climb. Get judged by the app every step of the way.

**Track history** with a 7-day rolling strip and a full 90-day calendar grid — tap any day to edit past counts. See your completion rate, best streak, and total days at a glance.

**Open the dashboard** for the big picture: aggregate stats, a 30-day heatmap, per-habit breakdowns, and a one-click PDF export.

**Dark mode**, **keyboard shortcuts**, **confetti**, **skeleton loading**, **glow effects**, and a **sarcastic AI personality** with 70+ unique messages — because habit tracking should be fun.

---

## Complete Feature List

### Habit Management
1. Create habits with custom name, daily target (1-10), and color
2. Edit habit name, daily target, and color at any time
3. Soft-delete habits (move to trash) with two-step inline confirmation
4. Restore soft-deleted habits from the trash
5. Permanently delete habits from the trash with confirmation prompt
6. View deleted habits list with all stats preserved
7. 8 color options: Indigo, Violet, Rose, Pink, Orange, Amber, Teal, Cyan
8. Color picker with hover scale animation and ring-outline selection indicator
9. Form validation with inline error messages
10. Auto-focus on name input when creating or editing

### Daily Tracking
11. Tap to increment today's count toward daily target
12. Undo button to subtract from today's count
13. Progress bar with smooth 300ms animated fill
14. Live counter showing current count vs. daily target (e.g. "3 / 5")
15. "Done" badge when daily target is reached
16. Increment button auto-disables when target is complete
17. Undo button auto-disables when count is 0

### Streaks & Statistics
18. Current streak tracking (consecutive completed days)
19. Best streak tracking (all-time longest)
20. Total completed days counter
21. Success rate percentage
22. Automatic missed-day detection on app load
23. Streak auto-resets when a day is missed
24. Stats recalculate in real time after every action

### History
25. 7-day rolling history strip on each habit card
26. Week-by-week navigation with arrow buttons
27. Date range label (e.g. "Mar 27 — Apr 2")
28. Day cells color-coded: green checkmark (complete), tilde (in-progress), red X (missed), dashed border (today/empty)
29. Inline day editor: tap any day cell to set count with number buttons
30. "View full history" link opens extended view
31. Full 90-day history modal (13 weeks x 7 days grid)
32. Full history uses same inline editor and color coding
33. Legend explaining each status icon

### Humor & Messages
34. Context-aware funny messages on every action
35. 4 message categories: progress, completion, undo, missed day
36. 16 unique messages per category (64 base messages)
37. Messages dynamically reference habit state (streak length, count, target)
38. Flash animation: message background flashes bright for 2.5s then fades
39. Flash deduplication via timestamp tracking
40. Sarcastic roast-style tone throughout

### Streak Milestones
41. Special milestone messages at 7-day streaks ("A WHOLE WEEK?! Who ARE you?!")
42. 14-day milestone ("You're scaring the other habits.")
43. 21-day milestone ("Scientists say it's a habit now. The app says prove it.")
44. 30-day milestone ("That's not discipline, that's an obsession. Respect.")
45. 50-day milestone ("You're no longer a person, you're a machine.")
46. 100-day milestone ("Legend. Icon. Possibly unhinged. We salute you.")
47. 365-day milestone ("A FULL YEAR. The app is not worthy. We bow.")

### Confetti & Celebrations
48. Confetti explosion animation when a habit hits its daily target
49. 35 randomized colored particles with fall, spin, and drift physics
50. Confetti auto-cleans up after 1.8 seconds
51. "All Done Today" celebration banner when every habit is completed
52. Gradient celebration banner (emerald to teal to cyan) with pulse animation
53. 5 rotating celebratory messages

### Dashboard & Analytics
54. Full-screen dashboard modal with aggregate analytics
55. 4 gradient stat cards: Today's Progress, Total Completions, Best Streak, Avg Success Rate
56. 30-day activity heatmap with 4 intensity levels
57. Heatmap cell tooltips showing date and completion percentage
58. Heatmap legend (Less to More)
59. Total actions tracked counter (large prominent display)
60. Per-habit breakdown: color dot, name, progress bar, completion %, days completed, best streak
61. Show/hide deleted habits toggle in dashboard
62. Deleted habit rows at 50% opacity with "deleted" badge

### PDF Export
63. One-click dashboard export as PDF via browser print dialog
64. Automatically forces light-mode colors when printing from dark mode
65. Dark mode restored after print dialog closes
66. Print-specific header with title and export date
67. Print-specific footer with app attribution
68. Hides all non-dashboard content during print
69. Forces exact color reproduction for gradients and heatmap

### Dark Mode
70. Toggle between light and dark themes
71. Auto-detects system preference on first visit
72. Persists theme choice in localStorage
73. Sun/moon icon toggle in header
74. Full dark palette across all components, modals, and overlays
75. Dark-optimized heatmap color palette
76. Smooth transition between themes

### Keyboard Shortcuts
77. `N` key opens new habit form
78. `D` key opens dashboard
79. `T` key toggles dark/light mode
80. `Escape` closes any open modal, form, or menu
81. Shortcuts auto-disabled when typing in input fields

### Dynamic Page Title
82. Browser tab shows live completion progress (e.g. "2/3 done | Streak")
83. Updates in real time as habits are completed
84. Resets to "Streak" when no habits exist

### Responsive Design
85. Mobile-first layout with adaptive breakpoints
86. Sticky header on all screen sizes
87. Desktop: inline toolbar buttons
88. Mobile: three-dot menu with dropdown
89. Dropdown closes on outside click or action selection
90. Stat card grid: 2 columns on mobile, 4 on desktop
91. All modals and forms fit within viewport with scroll

### Animations & Visual Polish
92. Skeleton loading screen with shimmer animation (3 placeholder cards)
93. Shimmer adapts to dark mode with darker gradient tones
94. Staggered card entrance: fade + slide up with 60ms delay per card
95. Green glow pulse aura on completed habit cards
96. Custom flame logo SVG: multi-layer gradient, glow filter, inner flame, bright core, spark accents
97. Matching flame favicon in browser tab
98. Smooth transitions on all buttons, progress bars, and message banners
99. Hover and active states on every interactive element
100. Disabled states with greyed-out visual feedback
101. Tooltips on all icon-only buttons
102. Modal overlays with semi-transparent backdrop
103. Collapsible habit cards (click to expand/collapse)
104. Collapsed view: color dot, name, count/target, mini progress bar, checkmark
105. Empty state: tilde icon with "No habits yet. Chaos remains undefeated."
106. Empty trash state: trash icon with message

### Backend & Persistence
107. ASP.NET Core 8 Minimal API with 9 REST endpoints
108. SQLite database with JSON blob storage
109. Thread-safe database access with lock-based concurrency
110. Full business logic port from TypeScript to C#
111. Server-side missed-day processing on every state load
112. CORS enabled for cross-origin development

### Infrastructure
113. Docker Compose with two services (API + frontend)
114. Named Docker volume for persistent SQLite storage
115. Multi-stage Docker builds for minimal image sizes
116. nginx reverse proxy with SPA fallback and API proxying
117. Vite dev server with hot reload and API proxy
118. Production-ready containerized deployment

---

## Total: 118 Features

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS v4 |
| Backend | ASP.NET Core 8 Minimal API, SQLite |
| Infrastructure | Docker Compose, nginx, multi-stage builds |
| Design | Custom SVG assets, CSS animations, responsive mobile-first |
