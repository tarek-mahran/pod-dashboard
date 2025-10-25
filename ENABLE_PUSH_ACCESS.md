# 🔑 Enable Push Access from Codespaces

## Create a Personal Access Token (PAT)

### Step 1: Generate Token

1. Go to: **https://github.com/settings/tokens**
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name: `Codespaces Push Access`
4. Set expiration: 30 days (or your preference)
5. Select these scopes:
   - ✅ **repo** (Full control of private repositories)
     - This includes: repo:status, repo_deployment, public_repo, repo:invite, security_events
   - ✅ **workflow** (Update GitHub Action workflows)
6. Click **"Generate token"**
7. **COPY THE TOKEN** (you'll only see it once!)

### Step 2: Configure Git in Codespace

Run these commands in your terminal:

```bash
# Store your token (replace YOUR_TOKEN with the actual token)
export GH_TOKEN="YOUR_TOKEN_HERE"

# Update git remote to use your PAT
git remote set-url origin https://$GH_TOKEN@github.com/tarek-mahran/pod-dashboard.git

# Push your code
git push -u origin main
```

### Step 3: Deploy

```bash
npm run deploy
```

---

## 🔒 Security Notes

**⚠️ Important:**
- Never commit your token to the repository
- Never share your token publicly
- Tokens are like passwords - keep them secret!
- You can revoke the token anytime at https://github.com/settings/tokens

---

## Alternative: Use gh auth login with PAT

```bash
# Login with your PAT
gh auth login

# When prompted:
# - Select: GitHub.com
# - Protocol: HTTPS
# - Authenticate: Paste an authentication token
# - Paste your PAT token

# Then configure git
git config --global credential.helper "!gh auth git-credential"

# Now you can push
git push -u origin main
npm run deploy
```

---

## 📋 Complete Commands (Copy-Paste Ready)

After creating your PAT token:

```bash
# Replace YOUR_PAT_TOKEN with your actual token
export GH_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Update remote
git remote set-url origin https://$GH_TOKEN@github.com/tarek-mahran/pod-dashboard.git

# Push code
git push -u origin main

# Deploy to GitHub Pages
npm run deploy
```

---

## ✅ Once Configured

After the initial setup, future deployments are simple:

```bash
git add .
git commit -m "Update dashboard"
git push
npm run deploy
```

---

## 🎯 Quick Test

To verify your token works:

```bash
# This should show your repos
gh repo list

# This should show you're authenticated
gh auth status
```

---

**Choose your method:**
1. ⚡ **Quick**: Create PAT → Use export command → Push (5 minutes)
2. 📦 **Alternative**: Download ZIP → Upload via web (2 minutes)

Both work perfectly! The PAT method is better for ongoing development.
