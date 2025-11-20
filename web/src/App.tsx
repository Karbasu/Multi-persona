/**
 * Multi-Persona Council - Main App Component
 */

import { useState, useEffect } from 'react';
import { PersonaCard } from './components/PersonaCard';
import { ModeratorSummary } from './components/ModeratorSummary';
import { api } from './api';
import { Persona, UIReadyOutput } from './types';
import './App.css';

function App() {
  const [question, setQuestion] = useState('');
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uiOutput, setUiOutput] = useState<UIReadyOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load personas on mount
  useEffect(() => {
    loadPersonas();
  }, []);

  const loadPersonas = async () => {
    try {
      const response = await api.getPersonas(true);
      if (response.success && response.data) {
        setPersonas(response.data);
        // Select all personas by default
        setSelectedPersonas(response.data.map(p => p.id));
      }
    } catch (err) {
      console.error('Failed to load personas:', err);
    }
  };

  const handleStartDebate = async () => {
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    setLoading(true);
    setError(null);
    setUiOutput(null);

    try {
      const response = await api.startDebate(
        question,
        selectedPersonas.length > 0 ? selectedPersonas : undefined
      );

      if (response.success && response.data) {
        setUiOutput(response.data.ui);
      } else {
        setError(response.error || 'Failed to start debate');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to start debate');
    } finally {
      setLoading(false);
    }
  };

  const togglePersona = (id: string) => {
    setSelectedPersonas(prev =>
      prev.includes(id)
        ? prev.filter(p => p !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎭 Multi-Persona Brainstorm Council</h1>
        <p className="subtitle">Where diverse AI minds debate your questions</p>
      </header>

      <div className="container">
        {/* Input Section */}
        <div className="input-section">
          <div className="question-input">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask the council a question... (e.g., Should AI be regulated by governments?)"
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="persona-selector">
            <h3>Select Personas:</h3>
            <div className="persona-chips">
              {personas.map(persona => (
                <button
                  key={persona.id}
                  className={`persona-chip ${selectedPersonas.includes(persona.id) ? 'selected' : ''}`}
                  onClick={() => togglePersona(persona.id)}
                  disabled={loading}
                >
                  <span className="chip-avatar">{persona.avatar}</span>
                  <span className="chip-name">{persona.name}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            className="start-button"
            onClick={handleStartDebate}
            disabled={loading || !question.trim() || selectedPersonas.length === 0}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Debating...
              </>
            ) : (
              'Start Debate'
            )}
          </button>

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Debate Output Section */}
        {uiOutput && (
          <div className="debate-output">
            <div className="debate-header">
              <h2>💬 Council Responses</h2>
              <div className="debate-stats">
                <span>{uiOutput.persona_visuals.length} personas</span>
                <span>·</span>
                <span>{(uiOutput.total_duration_estimate / 1000).toFixed(1)}s duration</span>
                <span>·</span>
                <span>{uiOutput.scene_metadata.layout_strategy} layout</span>
              </div>
            </div>

            <div className={`personas-grid layout-${uiOutput.scene_metadata.layout_strategy}`}>
              {uiOutput.persona_visuals.map(persona => (
                <PersonaCard key={persona.id} persona={persona} />
              ))}
            </div>

            <ModeratorSummary
              moderator={uiOutput.moderator_visual}
              delay={uiOutput.persona_visuals[uiOutput.persona_visuals.length - 1]?.delay_before_start + 1000}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
