# MoveWell Fitness Goal Planner

A responsive ReactJS application for defining fitness goals, logging activities, and viewing goal completion progress.

## Features

- Dashboard with active goals, completed goals, average progress, and activity minutes
- Goal CRUD: add, edit, delete, search, filter, mark complete, and reopen
- Activity logging with validation, filtering, and deletion
- Progress calculations and visual progress bars
- Local storage so entries remain after a browser refresh
- Responsive interface for desktop and mobile

## Run locally

1. Install Node.js (LTS) from https://nodejs.org.
2. Open this folder in a terminal.
3. Run `pnpm install` (or `npm install`).
4. Run `pnpm dev` (or `npm run dev`).
5. Open the local address shown in the terminal.

## GitHub publishing

```bash
git init
git add .
git commit -m "Initial Fitness Goal Planner"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/fitness-goal-planner.git
git push -u origin main
```

Create the empty GitHub repository first; do not add a README or .gitignore there, because this project already includes them.
