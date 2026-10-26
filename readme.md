# Orange SR Encyclopedia Deployment Guide

This project is fully optimized and ready for deployment on **Vercel** (or any static hosting service).

## Important Steps Before Deployment

1. **Run the Build Script:** 
   Ensure you run the build script one last time to sync your latest data changes:
   ```bash
   python build.py
   ```

2. **Deploy to Vercel:**
   - **Via Vercel CLI:**
     ```bash
     vercel --prod
     ```
   - **Via Git (GitHub / GitLab / Bitbucket):**
     Just push your commits to your repository linked with Vercel. Vercel will automatically deploy the static site in seconds.

3. **Key Production Files:**
   When uploading, the following core files are included:
   - `index.html`
   - `style.css`
   - `bento.css`
   - `assistant.css`
   - `skiper.css` (Skiper UI Design System)
   - `skiper.js` (Skiper UI Engine)
   - `app.js`
   - `assistant.js`
   - `data.js` (Generated)
   - `hunts.js` (Generated)
   - `emails.js` (Generated)
   - `plans.js` (Generated)
   - `docs.js` (Generated)
   - `freemax.js` (Generated)
   - `manifest.json` & `sw.js` (PWA Offline Engine)
   - `vercel.json` (Vercel Cache & Edge Rules)
   - `asko-logo.png` (Logo Asset)

## Why Was It Not Working on iPhone?

We have addressed the iPhone issues by:
- **Structural Integrity:** Fixing the HTML hierarchical structure (Main/Header tags).
- **Defensive Coding:** Adding "Null Checks" in JavaScript to prevent the app from crashing if an element or script loads slightly slower on mobile networks.
- **Lucide Resilience:** Ensuring icons load safely without blocking the entire app.
- **Relative Pathing:** Ensuring all assets use relative paths compatible with static hosts.

## Developed By
Mohamed Issa 🐺
