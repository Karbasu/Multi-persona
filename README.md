# 🎭 Multi-Persona Brainstorm Council

A sophisticated AI system where multiple distinct personas debate and discuss questions, providing diverse perspectives synthesized by a neutral moderator.

## Overview

The Multi-Persona Brainstorm Council is an orchestration engine that brings together multiple AI personas, each with unique viewpoints, speaking styles, and cognitive approaches. When you ask a question, each active persona provides their perspective, and a moderator synthesizes all viewpoints into a coherent, balanced recommendation.

### Key Features

- **🎨 Multiple Built-in Personas**: Six diverse personas including The Skeptic, The Optimist, The Pragmatist, The Creative, The Analyst, and The Ethicist
- **✨ Custom Personas**: Create and manage your own custom personas with unique characteristics
- **🎯 Moderator Synthesis**: Intelligent synthesis that identifies agreements, contradictions, and key insights
- **💾 WAL Storage**: Persistent storage for personas and debate history using Write-Ahead Log
- **🔧 Flexible API**: Both programmatic and CLI interfaces
- **📚 Debate History**: Save and retrieve past debates for reference

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Question                         │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────▼───────────┐
        │  Debate Orchestrator   │
        └────────────┬───────────┘
                     │
     ┌───────────────┼───────────────┐
     │               │               │
┌────▼────┐    ┌────▼────┐    ┌────▼────┐
│Persona 1│    │Persona 2│    │Persona N│
│Response │    │Response │    │Response │
└────┬────┘    └────┬────┘    └────┬────┘
     │               │               │
     └───────────────┼───────────────┘
                     │
          ┌──────────▼──────────┐
          │  Moderator          │
          │  Synthesis          │
          └──────────┬──────────┘
                     │
        ┌────────────▼───────────┐
        │    Final Output        │
        │  - Persona Responses   │
        │  - Moderator Summary   │
        └────────────────────────┘
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Multi-persona
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment:
```bash
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

4. Build the project:
```bash
npm run build
```

## Usage

### CLI Interface

Ask the council a question:
```bash
npm run dev ask "Should we prioritize speed or quality in software development?"
```

List available personas:
```bash
npm run dev personas list
```

View a specific persona:
```bash
npm run dev personas show skeptic
```

View debate history:
```bash
npm run dev history list
npm run dev history show <debate-id>
```

### Programmatic API

```typescript
import { council } from './api/council.js';

// Ask a question
const result = await council.ask(
  "What makes a good leader?",
  {
    personaIds: ['skeptic', 'optimist', 'ethicist'], // Optional: specific personas
    context: "In the context of startup companies",  // Optional: additional context
    saveToHistory: true                               // Optional: save to history
  }
);

// Access responses
result.personas.forEach(persona => {
  console.log(`${persona.name}: ${persona.response}`);
});

console.log(`Moderator: ${result.moderator_summary}`);

// Manage personas
const personas = await council.listActivePersonas();
const newPersona = await council.createPersona({
  id: 'historian',
  name: 'The Historian',
  system_prompt: 'You analyze questions through the lens of history...',
  speaking_style: 'reflective, contextual, historically-grounded',
  temperature: 0.7,
  avatar: '📜'
});

// Access debate history
const history = await council.getDebateHistory(10);
```

## Built-in Personas

### 🔍 The Skeptic
- **Role**: Critical thinker who questions assumptions
- **Focus**: Identifying risks, flaws, and potential problems
- **Temperature**: 0.7

### ✨ The Optimist
- **Role**: Visionary who sees possibilities
- **Focus**: Opportunities, benefits, and positive outcomes
- **Temperature**: 0.8

### ⚙️ The Pragmatist
- **Role**: Results-oriented practical thinker
- **Focus**: Implementation, concrete steps, what actually works
- **Temperature**: 0.6

### 🎨 The Creative
- **Role**: Imaginative lateral thinker
- **Focus**: Novel ideas, unexpected connections, fresh perspectives
- **Temperature**: 0.9

### 📊 The Analyst
- **Role**: Data-driven systematic thinker
- **Focus**: Evidence, patterns, structured analysis
- **Temperature**: 0.5

### ⚖️ The Ethicist
- **Role**: Principled thinker considering moral implications
- **Focus**: Ethics, fairness, stakeholder impact
- **Temperature**: 0.7

## Data Structures

### Persona
```typescript
interface Persona {
  id: string;
  name: string;
  system_prompt: string;      // Core instructions for the persona
  speaking_style: string;      // How the persona expresses itself
  temperature: number;         // AI temperature (0.0-1.0)
  model?: string;             // Optional: specific model to use
  avatar: string;             // Emoji or icon
  metadata?: Record<string, any>;
  is_builtin?: boolean;       // True for built-in personas
  is_active?: boolean;        // False to exclude from debates
}
```

### Debate Output
```typescript
interface DebateOutput {
  personas: PersonaResponse[];
  moderator_summary: string;
}

interface PersonaResponse {
  id: string;
  name: string;
  response: string;
  timestamp?: number;
}
```

### Debate Session
```typescript
interface DebateSession {
  id: string;
  timestamp: number;
  question: string;
  persona_responses: PersonaResponse[];
  moderator_summary: ModeratorSummary;
  active_personas: string[];
  metadata?: Record<string, any>;
}
```

## WAL Storage

The system uses a Write-Ahead Log (WAL) storage pattern for persistence:

- **Persona Storage**: `persona::<id>` - Custom persona definitions
- **Debate Storage**: `debate::<timestamp>` - Debate session history
- **Storage Location**: `./wal-storage/` (configurable)
- **Format**: JSON files with atomic write operations

## Testing

Run the test suite:
```bash
npm run test
```

The test suite will:
1. List available personas
2. Create a custom test persona
3. Run a sample debate (in mock mode if no API key)
4. Check debate history

## Development

### Project Structure

```
Multi-persona/
├── src/
│   ├── api/
│   │   └── council.ts         # Main API interface
│   ├── engine/
│   │   ├── ai-client.ts       # AI provider integration
│   │   └── debate.ts          # Debate orchestration
│   ├── personas/
│   │   ├── builtin.ts         # Built-in persona definitions
│   │   └── manager.ts         # Persona CRUD operations
│   ├── storage/
│   │   └── wal.ts             # WAL storage implementation
│   ├── types.ts               # TypeScript type definitions
│   ├── cli.ts                 # CLI interface
│   ├── index.ts               # Main entry point
│   └── test.ts                # Test suite
├── package.json
├── tsconfig.json
└── README.md
```

### Adding a New Persona

```typescript
import { council } from './api/council.js';

await council.createPersona({
  id: 'futurist',
  name: 'The Futurist',
  system_prompt: `You are a futurist who thinks about long-term trends,
    emerging technologies, and how the future might unfold.`,
  speaking_style: 'forward-thinking, speculative, trend-focused',
  temperature: 0.85,
  avatar: '🔮',
  is_active: true
});
```

### Extending the System

The system is designed to be extensible:

- **Custom AI Providers**: Extend `AIClient` to support other providers (OpenAI, etc.)
- **Storage Backends**: Implement `WALStorage` interface for different storage systems
- **Persona Types**: Add new built-in personas in `personas/builtin.ts`
- **Synthesis Strategies**: Customize moderator logic in `engine/debate.ts`

## Response Format

All debate outputs follow this format:

```json
{
  "personas": [
    {
      "id": "skeptic",
      "name": "The Skeptic",
      "response": "I see several potential issues with this approach..."
    },
    {
      "id": "optimist",
      "name": "The Optimist",
      "response": "This presents an exciting opportunity to..."
    }
  ],
  "moderator_summary": "The council presents diverse perspectives. Key agreements include...\nContradictions emerge around...\nMost valuable insights: ...\nUnified recommendation: ..."
}
```

## Configuration

Environment variables:

- `ANTHROPIC_API_KEY`: Required for AI responses (get at https://console.anthropic.com/)
- `STORAGE_DIR`: Optional storage directory path (default: `./wal-storage`)

## Examples

### Example 1: Strategic Decision

```bash
npm run dev ask "Should our startup focus on B2B or B2C markets?"
```

Personas will provide:
- **Skeptic**: Risks and challenges in each market
- **Analyst**: Data-driven market analysis
- **Pragmatist**: Implementation considerations
- **Creative**: Innovative market positioning ideas
- **Optimist**: Growth opportunities in each direction
- **Ethicist**: Stakeholder and social impact considerations

### Example 2: Technical Architecture

```bash
npm run dev ask "Microservices vs Monolith: which is better for our product?"
```

### Example 3: Philosophical Question

```bash
npm run dev ask "Is free will an illusion?"
```

## Troubleshooting

**No API responses**: Ensure `ANTHROPIC_API_KEY` is set in `.env`

**Mock responses**: Without an API key, the system runs in mock mode for testing

**Storage errors**: Check that the storage directory is writable

**TypeScript errors**: Run `npm run build` to compile

## License

MIT

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## Future Enhancements

- [ ] Web UI interface
- [ ] Real-time streaming responses
- [ ] Persona personality customization
- [ ] Multi-language support
- [ ] Integration with other AI providers
- [ ] Advanced moderator strategies
- [ ] Debate visualization tools
- [ ] Export debates to various formats