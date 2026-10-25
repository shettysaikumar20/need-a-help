# Need A Help — AI Assistant 🤖

A clean, modern, and distraction-free AI conversational web application modeled after ChatGPT, featuring seamless switching between **Online Cloud AI** and **Offline Local AI**.

---

## ✨ Features

- 💬 **ChatGPT-Style Interface**: Clean, minimalist UI focused on pure conversation, smooth message streaming, multi-turn dialogue, and chat session history.
- 🔄 **One-Click Engine Toggle**: Effortlessly toggle between **Online** ☁️ and **Offline** 💻 models with a single button.
- ⚡ **Online Multi-Tier AI Cascade**:
  1. **Primary**: **Google Gemini API** (`gemini-2.5-flash` and `gemma` models) for high-speed, accurate reasoning.
  2. **Secondary Fallback**: **Backboard API** (automatically activates if Gemini credits end or errors occur).
  3. **Tertiary Fallback**: **OpenRouter API** (resilient failover ensures the app never stops answering).
- 💻 **Offline Local AI**:
  - Powered by **Gemma 3 270M** running locally on your machine via [Ollama](https://ollama.ai).
  - 100% private, zero internet connection required, zero cloud API costs.
- 📋 **Syntax-Highlighted Code Blocks**: Formatted code rendering with language detection and a 1-click **Copy code** button.
- 📐 **LaTeX Math Support**: Mathematical equations rendered with KaTeX.
- 🎙️ **Voice Speech-to-Text**: Built-in voice input for speaking questions directly.
- 🌓 **Dark & Light Mode**: Seamless theme switching with system preferences.
- 🚀 **Full-Stack Deployment Ready**: Express backend serves the optimized React production build under a single unified origin on Render, Railway, or VPS.

---

## 🏗️ Architecture

```
                       +---------------------------------------+
                       |        Need A Help Web App            |
                       |       (React + Vite + KaTeX)          |
                       +---------------------------------------+
                                           |
                                  [ Engine Toggle ]
                                           |
            +------------------------------+------------------------------+
            |                                                             |
    [ Online Mode ] ☁️                                            [ Offline Mode ] 💻
            |                                                             |
            v                                                             v
+------------------------+                                   +-------------------------+
| Need A Help Backend    |                                   | Need A Help Backend     |
| (Express API Gateway)  |                                   | (Ollama Connector)      |
+------------------------+                                   +-------------------------+
            |                                                             |
    [ Resilience Cascade ]                                                v
            |                                                +-------------------------+
    1. Google Gemini API                                     | Local Ollama Server     |
       (gemini-2.5-flash / gemma)                            | (http://127.0.0.1:11434)|
            | (failover)                                     | Model: gemma3:270m      |
    2. Backboard AI                                          +-------------------------+
            | (failover)                                                  |
    3. OpenRouter API                                              [ 100% On-Device, ]
                                                                   [ Fully Offline   ]
```

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Lucide Icons, React Markdown, KaTeX, Remark GFM, Remark Math
- **Backend**: Node.js, Express, CORS, Dotenv
- **AI Engines**:
  - Google Gemini API (`gemini-2.5-flash`, Google AI Studio)
  - Backboard AI
  - OpenRouter API
  - Ollama (Local open-weight `gemma3:270m`)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 20+ installed
- [Ollama](https://ollama.ai) installed (for Offline Local AI)

### 2. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/need-a-help.git
cd need-a-help
```

### 3. Setup Environment Variables
Copy `.env.example` in `backend/` to `backend/.env`:
```bash
cp backend/.env.example backend/.env
```

Configure your API keys in `backend/.env`:
```env
# Primary Online AI
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# Fallback Online AI Providers
BACKBOARD_API_KEY=your_backboard_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Local Offline AI
OLLAMA_URL=http://127.0.0.1:11434
OLLAMA_MODEL=gemma3:270m

PORT=5000
NODE_ENV=development
```

### 4. Setup Local Offline AI (Optional for Offline Mode)
Download and run `gemma3:270m` in Ollama:
```bash
ollama run gemma3:270m
```

### 5. Install Dependencies & Run Locally

#### Run Backend:
```bash
cd backend
npm install
npm run dev
```

#### Run Frontend:
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📦 Production Build & Hosting

### Option A: Unified Service (Render / Railway / VPS)
The backend is pre-configured to automatically serve the production frontend build.

1. Build frontend:
   ```bash
   cd frontend
   npm install
   npm run build
   ```
2. Start backend in production:
   ```bash
   cd ../backend
   npm install
   NODE_ENV=production npm start
   ```
3. Open `http://localhost:5000` — the complete application is live on a single port!

### Option B: Deploying on Render
1. Push this repository to your GitHub account.
2. In Render, select **New Web Service** and link your repository.
3. Use the included `render.yaml` or set:
   - **Build Command**: `npm --prefix backend install && npm --prefix frontend install && npm --prefix frontend run build`
   - **Start Command**: `npm --prefix backend start`
   - **Health Check Path**: `/api/health`
4. Add your environment variables in the Render dashboard:
   - `GEMINI_API_KEY`: Your Gemini API key
   - `BACKBOARD_API_KEY`: (Optional fallback)
   - `OPENROUTER_API_KEY`: (Optional fallback)

---

## 🔒 Security & Privacy

- **API Keys are Server-Side Only**: Your Gemini, Backboard, and OpenRouter keys are never exposed to the client or browser.
- **Offline Guarantee**: When switched to **Offline** mode, all requests are routed exclusively to your local Ollama instance on `127.0.0.1`. No data leaves your machine.
- **Git Protection**: Sensitive `.env` files and caches are strictly excluded via `.gitignore`.

---

## 📄 License
MIT License. Free to use, modify, and distribute.
