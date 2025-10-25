# 🚀 GitHub Pages Deployment Guide

## Step 1: Create GitHub Repository

Since this is a Codespace, you need to create a GitHub repository first:

### Option A: Using GitHub CLI (Recommended)
```bash
# Login to GitHub (if not already logged in)
gh auth login

# Create a new public repository
gh repo create pod-dashboard --public --source=. --remote=origin

# Push your code
git push -u origin main
```

### Option B: Using GitHub Web Interface
1. Go to https://github.com/new
2. Repository name: `pod-dashboard` (or your preferred name)
3. Description: "POD Tickets Dashboard - React Application"
4. Public repository
5. Do NOT initialize with README (we already have one)
6. Click "Create repository"

Then run these commands:
```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/pod-dashboard.git
git branch -M main
git push -u origin main
```

---

## Step 2: Update Vite Configuration

Update the `base` path in `vite.config.js` to match your repository name:

```javascript
export default defineConfig({
  plugins: [react()],
  base: '/pod-dashboard/',  // Change this to match your repo name
  server: {
    port: 3000
  }
})
```

If you named your repository differently, use that name instead:
```javascript
base: '/your-repo-name/',
```

---

## Step 3: Deploy to GitHub Pages

After creating the repository and updating the config:

```bash
# Rebuild with correct base path
npm run build

# Deploy to GitHub Pages
npm run deploy
```

This will:
1. Build the production version
2. Create a `gh-pages` branch
3. Push the built files to that branch

---

## Step 4: Enable GitHub Pages (One-time setup)

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Click **Pages** in the left sidebar
4. Under "Source", select:
   - Branch: `gh-pages`
   - Folder: `/ (root)`
5. Click **Save**

GitHub will provide you with a URL like:
```
https://YOUR_USERNAME.github.io/pod-dashboard/
```

---

## Step 5: Wait for Deployment

- GitHub Pages takes 1-3 minutes to deploy
- You'll see a green checkmark in the Pages settings when ready
- Visit your URL to see your dashboard live!

---

## Future Updates

After the initial setup, deploying updates is simple:

```bash
# Make your changes to the code
# Commit your changes
git add .
git commit -m "Your update message"
git push

# Deploy the new version
npm run deploy
```

---

## Troubleshooting

### Issue: "Failed to get remote.origin.url"
**Solution**: Make sure you've created a GitHub repository and added it as remote (Step 1)

### Issue: 404 Page Not Found
**Solution**: 
1. Check that `base` in `vite.config.js` matches your repo name exactly
2. Ensure GitHub Pages is enabled (Step 4)
3. Wait a few minutes for GitHub Pages to deploy

### Issue: Assets not loading (blank page)
**Solution**: The `base` path in `vite.config.js` must match your repository name exactly, including the leading and trailing slashes

### Issue: White screen after deployment
**Solution**: 
1. Open browser console (F12) to see errors
2. Usually means incorrect `base` path in vite.config.js
3. Rebuild and redeploy after fixing

---

## Alternative: Deploy to Different Service

If you prefer not to use GitHub Pages, you can also deploy to:

### Vercel (Easiest)
```bash
npm i -g vercel
vercel
```

### Netlify
```bash
npm i -g netlify-cli
netlify deploy
```

### Cloudflare Pages
1. Build: `npm run build`
2. Upload `dist` folder to Cloudflare Pages dashboard

---

## Current Status

✅ Git repository initialized
✅ Code committed
⏳ Waiting for GitHub repository creation
⏳ Waiting for deployment

**Next Step**: Create GitHub repository (see Step 1 above)
