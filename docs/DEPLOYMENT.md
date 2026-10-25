# Need A Help Deployment Guide

This guide describes how to deploy Need A Help as a single web service.

---

## 1. Push Repository to GitHub

Initialize git if not already initialized:
```bash
git init
git add .
git commit -m "Initial commit: Need A Help AI Assistant"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/need-a-help.git
git push -u origin main
```

---

## 2. Deploying on Render

### Using Blueprint (render.yaml)
1. In the [Render Dashboard](https://dashboard.render.com), click **New +** -> **Blueprint**.
2. Connect your GitHub repository.
3. Render will read `render.yaml` automatically.
4. Set your private environment variables:
   - `GEMINI_API_KEY`: Your Google Gemini API key.
   - `BACKBOARD_API_KEY`: (Optional secondary fallback)
   - `OPENROUTER_API_KEY`: (Optional tertiary fallback)

### Manual Web Service Setup
- **Environment**: Node
- **Build Command**: `npm --prefix backend install && npm --prefix frontend install && npm --prefix frontend run build`
- **Start Command**: `npm --prefix backend start`
- **Health Check Path**: `/api/health`

---

## 3. Verifying Deployment

Once deployed:
1. `GET https://your-app.onrender.com/api/health` should return `{"status":"ok","service":"Need A Help API"}`.
2. Opening `https://your-app.onrender.com/` in your browser will display the full ChatGPT-style chat interface.
3. Test a message in **Online** mode to verify your Gemini API key.
