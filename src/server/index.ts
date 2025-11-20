/**
 * REST API Server for Multi-Persona Council
 * Exposes HTTP endpoints and WebSocket for real-time streaming
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { council } from '../api/council.js';
import { frontEndOrchestrator } from '../frontend/orchestrator.js';
import { Persona, DebateOutput } from '../types.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ===== Debate Endpoints =====

/**
 * POST /api/debates
 * Start a new debate
 */
app.post('/api/debates', async (req: Request, res: Response) => {
  try {
    const { question, personaIds, context, saveToHistory = true } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    console.log(`🎭 Starting debate: "${question}"`);

    // Run the debate
    const debateOutput = await council.ask(question, {
      personaIds,
      context,
      saveToHistory
    });

    // Orchestrate for UI
    const uiOutput = await frontEndOrchestrator.orchestrate(debateOutput);

    res.json({
      success: true,
      data: {
        debate: debateOutput,
        ui: uiOutput
      }
    });
  } catch (error) {
    console.error('Error in debate:', error);
    res.status(500).json({
      error: 'Failed to run debate',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/debates/history
 * Get debate history
 */
app.get('/api/debates/history', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const history = await council.getDebateHistory(limit);

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch history',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/debates/:id
 * Get specific debate session
 */
app.get('/api/debates/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const session = await council.getDebateSession(id);

    if (!session) {
      return res.status(404).json({ error: 'Debate session not found' });
    }

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch debate',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * DELETE /api/debates/:id
 * Delete a debate session
 */
app.delete('/api/debates/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await council.deleteDebateSession(id);

    res.json({
      success: true,
      message: 'Debate session deleted'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to delete debate',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

// ===== Persona Endpoints =====

/**
 * GET /api/personas
 * List all personas
 */
app.get('/api/personas', async (req: Request, res: Response) => {
  try {
    const activeOnly = req.query.active === 'true';
    const personas = activeOnly
      ? await council.listActivePersonas()
      : await council.listPersonas();

    res.json({
      success: true,
      data: personas
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch personas',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/personas/:id
 * Get specific persona
 */
app.get('/api/personas/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const persona = await council.getPersona(id);

    if (!persona) {
      return res.status(404).json({ error: 'Persona not found' });
    }

    res.json({
      success: true,
      data: persona
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch persona',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * POST /api/personas
 * Create a new custom persona
 */
app.post('/api/personas', async (req: Request, res: Response) => {
  try {
    const personaData = req.body;
    const persona = await council.createPersona(personaData);

    res.status(201).json({
      success: true,
      data: persona
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to create persona',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * PATCH /api/personas/:id
 * Update a persona
 */
app.patch('/api/personas/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const persona = await council.updatePersona(id, updates);

    res.json({
      success: true,
      data: persona
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to update persona',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * DELETE /api/personas/:id
 * Delete a custom persona
 */
app.delete('/api/personas/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await council.deletePersona(id);

    res.json({
      success: true,
      message: 'Persona deleted'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to delete persona',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

// ===== WebSocket for Real-Time Streaming =====

const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws: WebSocket) => {
  console.log('🔌 WebSocket client connected');

  ws.on('message', async (message: string) => {
    try {
      const data = JSON.parse(message.toString());

      if (data.type === 'start_debate') {
        const { question, personaIds, context } = data;

        ws.send(JSON.stringify({
          type: 'debate_started',
          question
        }));

        // Run debate and stream responses
        // Note: This is a simplified version - real streaming would require
        // modifying the debate engine to emit events
        const debateOutput = await council.ask(question, {
          personaIds,
          context,
          saveToHistory: true
        });

        // Send each persona response
        for (const persona of debateOutput.personas) {
          ws.send(JSON.stringify({
            type: 'persona_response',
            data: persona
          }));
          // Simulate streaming delay
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Send moderator summary
        ws.send(JSON.stringify({
          type: 'moderator_summary',
          data: debateOutput.moderator_summary
        }));

        // Send UI output
        const uiOutput = await frontEndOrchestrator.orchestrate(debateOutput);
        ws.send(JSON.stringify({
          type: 'ui_ready',
          data: uiOutput
        }));

        ws.send(JSON.stringify({
          type: 'debate_complete'
        }));
      }
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        message: error instanceof Error ? error.message : String(error)
      }));
    }
  });

  ws.on('close', () => {
    console.log('🔌 WebSocket client disconnected');
  });
});

// Start server
server.listen(PORT, () => {
  console.log('🎭 Multi-Persona Council Server');
  console.log('═'.repeat(50));
  console.log(`🚀 HTTP Server: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}/ws`);
  console.log('═'.repeat(50));
  console.log('\nAvailable endpoints:');
  console.log('  GET    /health');
  console.log('  POST   /api/debates');
  console.log('  GET    /api/debates/history');
  console.log('  GET    /api/debates/:id');
  console.log('  DELETE /api/debates/:id');
  console.log('  GET    /api/personas');
  console.log('  GET    /api/personas/:id');
  console.log('  POST   /api/personas');
  console.log('  PATCH  /api/personas/:id');
  console.log('  DELETE /api/personas/:id');
  console.log('═'.repeat(50));
});
