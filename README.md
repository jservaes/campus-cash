# Campus Cash 💸 — college student budgeting PWA

A playful React + TypeScript budgeting app with college-specific spending categories, configurable meal plan, two or more accounts, weekly category budgets, income and expenses, and recurring schedules.

## Start in VS Code

1. Install Node.js (v22 recommended), Git, and VS Code.
2. Open this folder in VS Code: **File → Open Folder**.
3. In **Terminal → New Terminal** run:

```bash
npm install
npm run dev
```

4. Open the URL shown in the terminal (usually http://localhost:5173).

## Connect VS Code to GitHub

1. Sign in to GitHub in VS Code, if prompted.
2. In the left sidebar, open **Source Control** and select **Publish to GitHub**. Create a repository called **campus-cash** (or another name), and choose **Private** initially if you prefer.
3. Commit and push your changes. The included GitHub Actions workflow builds and publishes the site.
4. In the GitHub repository open **Settings → Pages**, set **Source = GitHub Actions**. Push a commit if necessary and check the **Actions** tab for the deployment URL.
5. Your URL will normally be `https://YOUR_USERNAME.github.io/campus-cash/` if the repository is named `campus-cash`.

If deploying from the command line instead, initialize Git, add the files, create a repo on GitHub, and push your main branch. The workflow's base path automatically matches the repository name.

## Install on your iPhone

Open the deployed URL in **Safari** → **Share** → **Add to Home Screen** → **Add**. The app runs like a home-screen app.

## How recurring works

- Add a schedule in the **Repeat** section with a start date, optional end date, and weekly/biweekly/monthly/yearly frequency.
- Due occurrences are **calculated** at display time through today, so missing a day or refreshing never double-adds them.
- A monthly item on day 31 uses the last day in shorter months and returns to day 31 in longer months.
- Editing a recurring schedule is not yet available: delete the schedule and create a replacement.
- Entries are bookkeeping records only; **no bank transactions or background payments occur**.
- All app information lives in **this browser on this device** via localStorage. There is no account, sync, or server. Export backups regularly from **Settings**. Removing Safari data or switching devices without importing a backup can erase history.
- This starter doesn't perform transfers between accounts or reconcile actual bank feeds.

## Styling

Change `src/styles.css` and the categories in `src/logic.ts`. App interface is in `src/App.tsx`.

## Check production build

```bash
npm run build
npm run preview
```

## Privacy

Don't add real account balances, transactions, or other personal data to tracked source files. They are saved locally when you use the running app, not embedded in the GitHub repository. GitHub Pages websites are public even if a repository is private, so treat the deployed interface as public.
