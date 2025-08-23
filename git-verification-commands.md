# Git Verification Commands for 'The DAS Board' - 500 Error Prevention

This document provides comprehensive git verification commands to ensure your code changes are properly pushed and synchronized, preventing production 500 errors due to configuration mismatches.

## 🔍 Quick Status Check Commands

### 1. Verify Current Status
```bash
# Check current branch and status
git status

# Check if there are unpushed commits
git log --oneline --graph --decorate --all -10

# Check if local branch is ahead/behind origin
git status -sb
```

### 2. Check for Unpushed Changes
```bash
# Compare local branch with origin
git diff origin/main

# Check if local commits exist that aren't pushed
git log origin/main..HEAD --oneline

# Show commits that exist locally but not on origin
git cherry -v origin/main
```

### 3. Verify Remote Configuration
```bash
# Check remote URLs
git remote -v

# Verify you're tracking the correct remote branch
git branch -vv

# Check if remote branch exists
git ls-remote --heads origin main
```

## 🚀 Push Verification Commands

### 1. Safe Push Verification
```bash
# Fetch latest changes without merging
git fetch origin

# Check what will be pushed
git diff --stat origin/main

# Check commits that will be pushed
git log origin/main..HEAD --oneline

# Push with verification
git push origin main
```

### 2. Force Push Safety (When Necessary)
```bash
# ONLY use if you're sure about force pushing
# First check what you're overwriting
git log --oneline --graph origin/main..HEAD

# Safer force push with lease (prevents overwriting others' work)
git push --force-with-lease origin main

# Alternative: create backup branch first
git branch backup-$(date +%Y%m%d-%H%M%S)
git push --force-with-lease origin main
```

### 3. Environment File Verification
```bash
# Ensure .env files are NOT committed
git ls-files | grep -E "\.env$|\.env\."

# If .env files are tracked, remove them:
git rm --cached .env*
echo ".env*" >> .gitignore
git add .gitignore
git commit -m "Remove .env files from tracking"
git push origin main
```

## 🔄 Branch Synchronization

### 1. Sync with Remote Main
```bash
# Fetch all remote changes
git fetch origin

# Check if main branch needs updates
git log HEAD..origin/main --oneline

# Update local main (if you're on main)
git pull origin main

# If you're on a feature branch, merge main
git checkout main
git pull origin main
git checkout your-feature-branch
git merge main
```

### 2. Verify Branch Push Status
```bash
# Check all branches and their push status
git for-each-ref --format='%(refname:short) %(push:track)' refs/heads

# Show tracking branches
git branch -r

# Check if current branch is pushed
git rev-list --count --left-right HEAD...@{upstream}
```

## 📊 Deployment Verification Commands

### 1. Pre-Deployment Checks
```bash
# Verify all changes are committed
git status --porcelain

# Check if working directory is clean
git diff-index --quiet HEAD --

# Verify production environment variables are not committed
grep -r "VITE_SUPABASE" .env* 2>/dev/null || echo "✅ No .env files in repo"

# Check for sensitive data in commits
git log --all --full-history -- .env*
```

### 2. Production Config Verification
```bash
# Check that .env.example is up to date
diff <(grep "^VITE_" .env.example | cut -d'=' -f1 | sort) <(printenv | grep "^VITE_" | cut -d'=' -f1 | sort)

# Verify gitignore contains .env files
grep -q "\.env" .gitignore && echo "✅ .env in .gitignore" || echo "❌ Add .env to .gitignore"

# Check for any uncommitted config changes
git diff --name-only | grep -E "(config|env)" || echo "✅ No uncommitted config changes"
```

### 3. Build Verification
```bash
# Test build with current code
npm run build

# Check if build directory is ignored
grep -q "dist\|build" .gitignore && echo "✅ Build directory ignored" || echo "⚠️ Add build directory to .gitignore"

# Verify build files are not committed
git ls-files | grep -E "^(dist|build)/" || echo "✅ No build files committed"
```

## 🐛 Troubleshooting Git Issues

### 1. Common Git Problems
```bash
# Problem: "Your branch is ahead of origin/main"
# Solution: Push your changes
git push origin main

# Problem: "Your branch is behind origin/main"
# Solution: Pull latest changes
git pull origin main

# Problem: "Diverged branches"
# Solution: Rebase or merge
git pull --rebase origin main
# OR
git merge origin/main
```

### 2. Reset to Remote State (Emergency)
```bash
# WARNING: This will lose local changes!
# Create backup first:
git stash push -m "backup-before-reset-$(date +%Y%m%d-%H%M%S)"

# Reset to match remote exactly
git fetch origin
git reset --hard origin/main

# Verify you match remote
git diff origin/main
```

### 3. Fix Environment Variable Leaks
```bash
# If you accidentally committed .env files:

# Remove from current index
git rm --cached .env .env.local .env.production

# Add to .gitignore
echo ".env*" >> .gitignore
echo "!.env.example" >> .gitignore

# Commit the fix
git add .gitignore
git commit -m "Fix: Remove .env files from tracking"

# Push the fix
git push origin main

# Remove from history (optional, destructive)
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch .env*' --prune-empty --tag-name-filter cat -- --all
git push --force-with-lease origin main
```

## 🏗️ Deployment Platform Specific Commands

### Netlify
```bash
# Check if Netlify deployment will use latest code
git log --oneline -5

# Verify Netlify build settings match package.json
grep -A 2 -B 2 "build\|start" package.json

# Check netlify.toml if it exists
cat netlify.toml 2>/dev/null || echo "No netlify.toml found"

# Trigger deployment after push
git commit --allow-empty -m "trigger: Deploy latest changes"
git push origin main
```

### Vercel
```bash
# Verify Vercel configuration
cat vercel.json 2>/dev/null || echo "No vercel.json found (uses package.json)"

# Check if build command is correct
grep "build" package.json

# Push and trigger deployment
git push origin main

# Check deployment status (if Vercel CLI is installed)
vercel ls 2>/dev/null || echo "Vercel CLI not installed"
```

### GitHub Actions/CI
```bash
# Check if GitHub Actions workflow exists
ls .github/workflows/ 2>/dev/null || echo "No GitHub Actions workflows"

# Check recent workflow runs (requires gh CLI)
gh run list --limit 5 2>/dev/null || echo "GitHub CLI not installed"

# Trigger workflow manually if needed
gh workflow run deploy 2>/dev/null || echo "No deploy workflow or gh CLI not available"
```

## 🔐 Security Verification Commands

### 1. Secrets and Keys Check
```bash
# Scan for potential secrets in recent commits
git log -p -S "eyJ" --all -- | head -20 || echo "No JWT tokens found in commits"

# Check for API keys in code
grep -r "pk_\|sk_\|eyJ" src/ || echo "✅ No API keys found in source"

# Verify environment variables are not hardcoded
grep -r "https://.*\.supabase\.co" src/ || echo "✅ No hardcoded Supabase URLs"
```

### 2. File Permissions and .gitignore
```bash
# Check .gitignore is comprehensive
cat .gitignore | grep -E "(\.env|node_modules|dist|build)" && echo "✅ Basic ignores present"

# Check for sensitive files that might be tracked
git ls-files | grep -E "(\.env|\.key|\.pem|config\.json)" || echo "✅ No sensitive files tracked"

# Check file permissions
find . -name "*.env*" -exec ls -la {} \; 2>/dev/null || echo "No .env files found"
```

## 🚨 Emergency Recovery Commands

### 1. Lost Work Recovery
```bash
# Find lost commits
git reflog --all --no-merges --date=relative

# Recover specific commit
git checkout -b recovery-branch <commit-hash>

# Recover from stash
git stash list
git stash apply stash@{0}
```

### 2. Repository Health Check
```bash
# Check repository integrity
git fsck --full

# Clean up repository
git gc --prune=now

# Check disk usage
du -sh .git

# Verify remotes are accessible
git ls-remote origin
```

## 📋 Pre-Production Checklist Commands

Run these commands before any production deployment:

```bash
#!/bin/bash
echo "🚀 Pre-Production Deployment Checklist"
echo "======================================"

echo "1. Checking git status..."
git status --porcelain || echo "❌ Uncommitted changes found!"

echo "2. Checking branch is main/master..."
current_branch=$(git branch --show-current)
echo "Current branch: $current_branch"

echo "3. Checking for unpushed commits..."
unpushed=$(git log origin/main..HEAD --oneline | wc -l)
echo "Unpushed commits: $unpushed"

echo "4. Checking for .env files in repo..."
env_files=$(git ls-files | grep -E "\.env$|\.env\." | wc -l)
echo "Tracked .env files: $env_files (should be 0)"

echo "5. Running build test..."
npm run build && echo "✅ Build successful" || echo "❌ Build failed"

echo "6. Checking environment variables..."
node -e "
const missing = [];
if (!process.env.VITE_SUPABASE_URL) missing.push('VITE_SUPABASE_URL');
if (!process.env.VITE_SUPABASE_ANON_KEY) missing.push('VITE_SUPABASE_ANON_KEY');
console.log('Missing env vars:', missing.length === 0 ? 'None ✅' : missing.join(', ') + ' ❌');
"

echo "======================================"
echo "Checklist complete! Review any ❌ items before deploying."
```

## 🔧 Useful Git Aliases

Add these to your `~/.gitconfig` for faster verification:

```ini
[alias]
    # Quick status check
    st = status -sb
    
    # Check what will be pushed
    push-check = log origin/main..HEAD --oneline
    
    # Compare with origin
    diff-origin = diff origin/main
    
    # Show unpushed commits
    unpushed = log @{u}.. --oneline
    
    # Show unmerged commits from origin
    unmerged = log ..@{u} --oneline
    
    # Safe force push
    force-safe = push --force-with-lease
    
    # Show remote branches
    remote-branches = branch -r
    
    # Clean up merged branches
    cleanup = "!git branch --merged | grep -v '\\*\\|main\\|master' | xargs -n 1 git branch -d"
```

## 📞 Support Commands

If you need help from the development team:

```bash
# Generate support info
echo "=== The DAS Board Support Info ===" > support-info.txt
echo "Git Status:" >> support-info.txt
git status >> support-info.txt
echo -e "\nRecent Commits:" >> support-info.txt
git log --oneline -5 >> support-info.txt
echo -e "\nRemote Info:" >> support-info.txt
git remote -v >> support-info.txt
echo -e "\nBranch Info:" >> support-info.txt
git branch -vv >> support-info.txt
echo -e "\nEnvironment Check:" >> support-info.txt
node -e "console.log('Node:', process.version); console.log('NPM:', process.env.npm_version || 'unknown');" >> support-info.txt

echo "Support info saved to support-info.txt"
cat support-info.txt
```

These commands will help ensure your git repository is properly synchronized and prevent the common causes of production 500 errors related to configuration mismatches between local development and deployed environments.