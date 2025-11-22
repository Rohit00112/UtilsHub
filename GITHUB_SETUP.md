# GitHub Repository Setup Instructions

## Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository named `UtilsHub` (or your preferred name)
3. **Do NOT** initialize with README, .gitignore, or license (we already have these)
4. Click "Create repository"

## Step 2: Push Code to GitHub

After creating the repository, run these commands in your terminal:

```bash
cd /Users/sujansubedi/Desktop/UtilsHub

# Add the remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/UtilsHub.git

# Push the code
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel (Recommended)

1. Go to [Vercel](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js and configure everything
5. Click "Deploy"

Your site will be live in ~2 minutes at `https://your-project.vercel.app`

## Alternative: Deploy to Netlify

1. Go to [Netlify](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub and select your repository
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Click "Deploy"

## Current Progress

✅ **Completed Tools (8/50+)**:
- Text Case Converter (7 case types)
- Word & Character Counter
- Base64 Encoder/Decoder
- URL Encoder/Decoder
- Password Generator
- QR Code Generator
- BMI Calculator
- Age Calculator

🚧 **Next Steps**:
- Add more PDF tools (merger, splitter, compressor)
- Add image tools (converter, resizer, compressor)
- Add developer tools (JSON formatter, UUID generator)
- Add AI-powered tools (requires API keys)

## Running Locally

```bash
npm run dev
```

Visit http://localhost:3000

## Building for Production

```bash
npm run build
npm start
```
