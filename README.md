# Need A Help — Premium AI Cognitive Workspace 🤖⚡

[![Live Demo](https://img.shields.io/badge/Live_Demo-need--a--help.onrender.com-8b5cf6?style=for-the-badge&logo=render&logoColor=white)](https://need-a-help.onrender.com/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-shettysaikumar20%2Fneed--a--help-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/shettysaikumar20/need-a-help)
[![Node.js](https://img.shields.io/badge/Node.js-22_LTS-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Gemini API](https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://aistudio.google.com/)
[![Ollama](https://img.shields.io/badge/Ollama-Offline_Local_AI-000000?style=for-the-badge&logo=ollama&logoColor=white)](https://ollama.ai)

An ultra-modern, frosted-glass AI conversational web application modeled after premium cognitive co-pilots. Features seamless switching between **Online Cloud AI** and **Offline Local AI** with an automatic multi-tier failover cascade.

🌐 **Live Demo**: [https://need-a-help.onrender.com/](https://need-a-help.onrender.com/)  
📂 **Repository**: [https://github.com/shettysaikumar20/need-a-help](https://github.com/shettysaikumar20/need-a-help)

---

## ✨ Features & Highlights

### 🌌 Premium AI Workspace Interface
- **Cosmic Glowing Orb**: Animated central sphere with pulsating violet-magenta atmospheric aura.
- **Glassmorphic Cards**: Frosted glass prompt starters with backdrop blur (`backdrop-filter: blur(20px)`), luminous borders, and smooth lift hover animations.
- **Floating Glassmorphic Composer**: Pill-shaped bottom dock with quick action helper chips (`Code`, `Explain`, `Reasoning`) and a vibrant neon-gradient send button.
- **Collapsible Sidebar**: Clean session history stored in `localStorage`, persistent multi-chat sessions, and one-click session reset.

### 🔄 One-Click Engine Toggle (Online ☁️ vs. Offline 💻)
- Toggle between cloud intelligence and private local inference with zero reload.

### ⚡ Online Multi-Tier AI Cascade
Never experience downtime or quota dropouts:
1. **Primary**: **Google Gemini API** (`gemini-2.5-flash` and `gemma` models) for blazing-fast, high-precision responses.
2. **Secondary Fallback**: **Backboard API** (automatically shifts if Gemini credits expire or errors occur).
3. **Tertiary Fallback**: **OpenRouter API** (seamless tertiary safety net).

### 💻 Offline Local AI (`gemma4:e2b` via Ollama)
- Powered by local open-weight models through [Ollama](https://ollama.ai).
- **100% Private**: Runs entirely on your device with zero internet connection required and zero cloud costs.

### 📋 Rich Formatting & Developer Tools
- **Syntax-Highlighted Code Blocks**: With auto-detected language labels and a 1-click **Copy code** button with checkmark feedback.
- **LaTeX Math Rendering**: Equations rendered inline (`$x$`) and block (`$$...$$`) via KaTeX.
- **Microphone Voice Input**: Built-in speech-to-text for hands-free prompt dictation.
- **Dark & Light Modes**: System-aware and manual theme switching.

---

## 🏗️ System Architecture

```
                       +---------------------------------------+
                       |        Need A Help Web App            |
                       |       (React 18 + Vite + KaTeX)       |
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
            | (failover on error/429)                        | Model: gemma4:e2b       |
    2. Backboard AI                                          +-------------------------+
            | (failover)                                                  |
    3. OpenRouter API                                              [ 100% On-Device, ]
                                                                   [ Fully Offline   ]
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Lucide Icons, React Markdown, KaTeX, Remark GFM, Remark Math |
| **Backend** | Node.js (v22 LTS), Express, CORS, Dotenv |
| **Cloud AI** | Google Gemini API, Backboard AI, OpenRouter API |
| **Local AI** | Ollama (`gemma4:e2b` / `gemma3:270m`) |
| **Deployment** | Render (Blueprint `render.yaml`), Railway, Docker/VPS compatible |

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js**: v20 or v22 LTS
- **Ollama** (optional, for local offline inference): [Download Ollama](https://ollama.ai)

### 2. Clone the Repository
```bash
git clone https://github.com/shettysaikumar20/need-a-help.git
cd need-a-help
```

### 3. Configure Environment Variables
Copy the example environment file:
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your API keys:
```env
# Primary Online AI - Google Gemini
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# Fallback Providers
BACKBOARD_API_KEY=your_backboard_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Local AI (Ollama)
OLLAMA_URL=http://127.0.0.1:11434
OLLAMA_MODEL=gemma4:e2b

PORT=5000
NODE_ENV=development
```

### 4. Run Locally

#### Development Mode (Frontend + Backend):
```bash
# Terminal 1: Run Backend API
cd backend
npm install
npm run dev

# Terminal 2: Run Frontend UI
cd frontend
npm install
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

#### Production Build (Unified Single Server):
```bash
# From repository root:
npm install
npm run build
npm start
```
Open **[http://localhost:5000](http://localhost:5000)**.

---

## ☁️ Deployment (Render / Railway / VPS)

This repository includes a pre-configured **`render.yaml`** blueprint for 1-click deployment.

### Deploying on Render:
1. Fork or push this repository to GitHub.
2. In the [Render Dashboard](https://dashboard.render.com), click **New +** → **Blueprint** and select your repository.
3. Add your private environment variables in the dashboard:
   - `GEMINI_API_KEY`: Your Google Gemini API key
   - `BACKBOARD_API_KEY`: (Optional secondary fallback)
   - `OPENROUTER_API_KEY`: (Optional tertiary fallback)
4. Click **Apply** — Render will automatically build the frontend and serve the unified app.

---

## 🔒 Security & Privacy

- **Server-Side API Keys**: API credentials are exclusively loaded in the Node.js backend and are never sent to the browser.
- **Offline Assurance**: In **Offline** mode, network requests are directed solely to `http://127.0.0.1:11434`. Zero data leaves your machine.
- **Repository Safety**: `.env` and runtime data directories are strictly excluded via `.gitignore`.

---

## 📄 License

This project is licensed under the **MIT License**. Free to use, modify, and distribute.
