# 🎭 Multi-Persona Council - Full-Stack Application

A complete full-stack AI debate system where multiple personas discuss questions and a moderator synthesizes their perspectives. Features REST API, WebSocket support, and a beautiful React frontend with animations.

## 🏗️ Architecture

```
┌──────────────────────────────────────────┐
│           React Frontend (web/)           │
│  - Animated persona cards                 │
│  - Real-time debate visualization         │
│  - Persona selection                      │
│  - Framer Motion animations               │
└────────────────┬─────────────────────────┘
                 │ HTTP/WebSocket
┌────────────────▼─────────────────────────┐
│       Express API Server (src/server/)    │
│  - REST API endpoints                     │
│  - WebSocket for streaming                │
│  - CORS enabled                           │
└────────────────┬─────────────────────────┘
                 │
┌────────────────▼─────────────────────────┐
│         Backend Engine (src/)             │
│  - Debate orchestration                   │
│  - Frontend orchestrator                  │
│  - Persona management                     │
│  - WAL storage                            │
│  - Anthropic Claude integration           │
└──────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Anthropic API key (get at https://console.anthropic.com/)

### 1. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd web
npm install
cd ..
```

### 2. Configure Environment

```bash
# Backend configuration
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Frontend configuration (already set)
# web/.env contains: VITE_API_BASE=http://localhost:3001
```

### 3. Start the Application

**Option A: Development Mode (Recommended)**

```bash
# Terminal 1: Start API server
npm run dev:server

# Terminal 2: Start React frontend
cd web
npm run dev
```

**Option B: Production Build**

```bash
# Build everything
npm run build:all

# Start server
npm start

# Serve frontend (use any static server)
cd web/dist
python -m http.server 5173
```

### 4. Open in Browser

Visit http://localhost:5173 and start debating!

## 📁 Project Structure

```
Multi-persona/
├── src/
│   ├── api/              # Council API
│   ├── engine/           # Debate engine & AI client
│   ├── frontend/         # Frontend orchestrator
│   ├── personas/         # Persona definitions
│   ├── server/           # Express API server
│   ├── storage/          # WAL storage
│   └── types.ts          # TypeScript types
├── web/                  # React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── App.tsx       # Main app
│   │   ├── api.ts        # API client
│   │   └── types.ts      # Frontend types
│   └── package.json
├── package.json
└── README.md
```

## 🌐 API Endpoints

### Debates

- `POST /api/debates` - Start a new debate
  ```json
  {
    "question": "Your question here",
    "personaIds": ["skeptic", "optimist"], // optional
    "context": "Additional context"         // optional
  }
  ```

- `GET /api/debates/history?limit=10` - Get debate history
- `GET /api/debates/:id` - Get specific debate
- `DELETE /api/debates/:id` - Delete debate

### Personas

- `GET /api/personas?active=true` - List personas
- `GET /api/personas/:id` - Get persona details
- `POST /api/personas` - Create custom persona
- `PATCH /api/personas/:id` - Update persona
- `DELETE /api/personas/:id` - Delete persona

### WebSocket

Connect to `ws://localhost:3001/ws` for real-time streaming:

```javascript
const ws = new WebSocket('ws://localhost:3001/ws');

ws.send(JSON.stringify({
  type: 'start_debate',
  question: 'Your question',
  personaIds: ['skeptic', 'optimist']
}));

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle: debate_started, persona_response, moderator_summary, ui_ready, debate_complete
};
```

## 🎨 Frontend Features

### Components

1. **PersonaCard** - Animated persona response cards
   - Framer Motion animations (fade, pop, bounce, drift, pulse)
   - Emotion-based styling
   - Color-coded borders
   - Responsive design

2. **ModeratorSummary** - Synthesis display
   - Center-glow animation
   - Gradient background
   - Pulsing effects

3. **App** - Main application
   - Question input
   - Persona selector chips
   - Real-time debate display
   - Error handling

### Animations

The frontend uses the orchestrator's metadata to animate each persona:

- **Animation types**: fade_in, pop, bounce, drift, pulse, slide
- **Staggered delays**: Sequential entrance animations
- **Position-based layout**: Adaptive grid/circle layouts
- **Emotion-driven styling**: Color themes per persona

## 🧪 Testing

### Backend Tests

```bash
# Run test suite
npm run test

# Test API endpoints
curl http://localhost:3001/health
curl http://localhost:3001/api/personas
```

### Frontend Demo

```bash
# Frontend orchestrator demo
npm run demo:frontend
```

### Manual E2E Test

1. Start server: `npm run dev:server`
2. Start frontend: `cd web && npm run dev`
3. Open browser: http://localhost:5173
4. Enter question: "Should AI be regulated?"
5. Select personas
6. Click "Start Debate"
7. Watch animated responses appear!

## 🎭 Built-in Personas

| Persona | Emoji | Style | Temperature |
|---------|-------|-------|-------------|
| The Skeptic | 🔍 | Cautious, questioning | 0.7 |
| The Optimist | ✨ | Enthusiastic, hopeful | 0.8 |
| The Pragmatist | ⚙️ | Practical, action-oriented | 0.6 |
| The Creative | 🎨 | Imaginative, unconventional | 0.9 |
| The Analyst | 📊 | Systematic, evidence-based | 0.5 |
| The Ethicist | ⚖️ | Principled, empathetic | 0.7 |

## 🔧 Configuration

### Backend (.env)

```bash
ANTHROPIC_API_KEY=your_key_here
PORT=3001                    # Optional, defaults to 3001
STORAGE_DIR=./wal-storage   # Optional
```

### Frontend (web/.env)

```bash
VITE_API_BASE=http://localhost:3001
```

## 🚢 Deployment

### Backend (API Server)

Deploy to any Node.js hosting:
- Heroku, Railway, Render, Fly.io
- Set `ANTHROPIC_API_KEY` environment variable
- Set `PORT` (provider-specific)

### Frontend (React App)

```bash
cd web
npm run build
# Deploy dist/ folder to:
# - Vercel, Netlify, Cloudflare Pages
# - Any static hosting
# Update VITE_API_BASE to production API URL
```

## 📊 Performance

- **Debate Duration**: ~5-10 seconds (depends on persona count)
- **Animation Duration**: Calculated automatically
- **API Response Time**: ~1-3 seconds per persona
- **Frontend Load**: <1 second

## 🐛 Troubleshooting

### Server won't start
- Check `ANTHROPIC_API_KEY` is set
- Ensure port 3001 is available
- Run `npm install` in root directory

### Frontend can't connect to API
- Verify server is running on port 3001
- Check `web/.env` has correct API URL
- Check browser console for CORS errors

### Animations not working
- Ensure framer-motion is installed: `cd web && npm install framer-motion`
- Check browser console for errors
- Try refreshing the page

### Mock responses instead of real AI
- Verify `ANTHROPIC_API_KEY` is set in backend `.env`
- Restart the server after adding the key

## 📝 Scripts Reference

### Backend

```bash
npm run dev:server    # Start API server (development)
npm run test          # Run backend tests
npm run build         # Build TypeScript
npm start             # Start compiled server
```

### Frontend

```bash
cd web
npm run dev           # Start Vite dev server
npm run build         # Build for production
npm run preview       # Preview production build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test both backend and frontend
5. Submit a pull request

## 📄 License

MIT

## 🙏 Acknowledgments

- **Anthropic Claude** for AI responses
- **Framer Motion** for animations
- **React + Vite** for frontend
- **Express** for API server

---

**Built with ❤️ for thoughtful AI debates**
