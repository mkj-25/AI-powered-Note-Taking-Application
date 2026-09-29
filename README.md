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

## Project Structure

```
NOTRA/
├── client/                   
│   ├── public/               
│   └── src/
│       ├── assets/            
│       ├── components/
│       │   ├── ai/            
│       │   ├── editor/       
│       │   ├── layout/        
│       │   └── ui/            
│       ├── hooks/            
│       ├── pages/            
│       ├── services/          
│       ├── stores/            
│       └── utils/             
│
├── server/                    
│   ├── config/                
│   ├── controllers/           
│   ├── middleware/           
│   ├── models/               
│   ├── routes/               
│   ├── services/              
│   ├── sockets/               
│   ├── utils/                 
│   ├── app.js                 
│   └── server.js              
│
├── shared/                    
│
├── .env.example               
├── .gitignore
└── package.json               
```

---

## Getting Started

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



