# Gym Tracker

A lightweight **Gym Tracker** web app for monitoring workout habits, sleep, and protein goals with a GitHub-style activity heatmap.

## 🚀 Features

- **Weekly habit tracker** with gym, sleep, and protein checkboxes
- **Activity heatmap** showing task intensity per day
- **Dark mode** for low-light viewing
- **LocalStorage persistence** for notes and daily status
- **Export / Import** data as JSON for backup and restore
- **PWA-ready** with service worker caching support
- **GitHub Pages friendly** deployment-ready static site

## 📌 Why Use This App

Gym Tracker is ideal for fitness lovers who want a simple way to:

- track weekly progress
- visualize habit consistency over time
- save workout notes and daily summaries
- keep a clean dashboard without bloat

## 🧭 How It Works

- Check off tasks for each day of the current week
- The heatmap auto-updates based on the number of completed tasks
- The app stores data in the browser using `localStorage`
- Dark mode persists between sessions

## ✅ Project Structure

- `index.html` — main application UI
- `style.css` — responsive styling and heatmap layout
- `app.js` — app logic, heatmap rendering, storage, import/export, dark mode
- `sw.js` — service worker for asset caching
- `manifest.json` — progressive web app metadata

## 💡 Usage

This project is hosted on GitHub Pages at: https://iamrajarj.github.io/gym-tracker/

1. Open the live app at https://iamrajarj.github.io/gym-tracker/
2. Toggle the dark mode button to switch themes
3. Mark daily habits for gym, sleep, and protein
4. Use the heatmap to review activity intensity over the year
5. Export your data to back up notes and status

## 🛠️ Deployment

For GitHub Pages deployment:

1. Push the repo to GitHub
2. Enable GitHub Pages on the `main` branch
3. Visit the published URL like: https://iamrajarj.github.io/gym-tracker/

## 🔧 Local Development

Clone this repository locally and open `index.html` in a browser, or use a simple runner such as Live Server in VS Code.

```bash
git clone https://github.com/iamrajarj/gym-tracker.git
cd gym-tracker
# Open index.html directly, or use Live Server / any static file server
```

If using VS Code, install the Live Server extension, then right-click `index.html` and choose **Open with Live Server**.

## 📈 SEO Keywords

Gym tracker, habit tracker, workout tracker, fitness tracker, heatmap tracker, dark mode PWA, GitHub Pages app, localStorage tracker.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
