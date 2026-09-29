<div align="center">

# NOTRA

**An AI-powered note-taking application with real-time collaboration.**

NOTRA helps users capture, organize, and understand their notes with AI assistance.
Users work in personal or team workspaces, write structured block-based notes,
and interact with an AI assistant that can summarize, rewrite, explain, and
semantically search across their entire knowledge base.

</div>

---

## Key Features

- Create and manage structured notes
- Organize notes using workspaces
- AI-powered assistance
- Semantic search
- Real-time collaboration
- OCR and voice-to-text support
- Secure user authentication

---

## Tech Stack

### Frontend
- React
- Tailwind CSS
- Zustand
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Socket.IO

### AI & Processing
- Gemini
- OpenAI Embeddings
- Tesseract.js
- Whisper


---

## 📁 Project Structure

```
NOTRA/
├── client/                    # React frontend (Vite)
│   ├── public/               
│   └── src/
│       ├── assets/            # Images
│       ├── components/
│       │   ├── ai/            # AIChatPanel, VoiceRecorder
│       │   ├── editor/        # NoteEditor, EditorBlock, SlashCommand
│       │   ├── layout/        # MainLayout, Navbar, Sidebar, RightPanel
│       │   └── ui/            
│       ├── hooks/             # useDebounce, useLocalStorage, useSocket
│       ├── pages/             # LandingPage, LoginPage, DashboardPage, WorkspacePage
│       ├── services/          # api.js (Axios), aiService, authService, notesService, workspaceService
│       ├── stores/            
│       └── utils/             
│
├── server/                    # Node.js + Express backend
│   ├── config/                # db.js (MongoDB connection)
│   ├── controllers/           # authController, notesController, workspaceController, aiController
│   ├── middleware/            # authMiddleware (JWT), errorHandler, multer
│   ├── models/                # User, Note, Workspace, ChatHistory (Mongoose schemas)
│   ├── routes/                # authRoutes, notesRoutes, workspaceRoutes, aiRoutes
│   ├── services/              # openaiService (Gemini), embeddingService, ocrService, voiceService
│   ├── sockets/               # collaborationSocket.js (Socket.IO rooms + cursors)
│   ├── utils/                 
│   ├── app.js                 # Express app setup + route registration
│   └── server.js              # HTTP server entry point + Socket.IO init
│
├── shared/                    
│
├── .env.example               
├── .gitignore
└── package.json               # Root scripts: dev, server, client, install-all
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- A **MongoDB** instance (MongoDB Atlas free tier works)
- A **Google Gemini API key**  - optional, app runs in demo mode without it
- An **OpenAI API key** - optional; required only for Whisper voice transcription and OpenAI-based embeddings

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/AI-powered-Note-Taking-Application.git
cd AI-powered-Note-Taking-Application

# 2. Install all dependencies (root + server + client)
npm run install-all
```

### Environment Variables

```bash
# Copy the template
cp .env.example .env

# Fill in your values in .env

```


### Running the Application

```bash
# Run backend + frontend concurrently (recommended)
npm run dev

# Or run separately:
npm run server   # Express server on :5000
npm run client   # Vite dev server on :5173
```



