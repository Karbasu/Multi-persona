/**
 * Test script for Multi-Persona Council
 * Run with: npm run test
 */

import { council } from './api/council.js';

async function runTests() {
  console.log('🧪 Testing Multi-Persona Brainstorm Council\n');

  try {
    // Test 1: List personas
    console.log('Test 1: List available personas');
    console.log('─'.repeat(60));
    const personas = await council.listActivePersonas();
    console.log(`Found ${personas.length} active personas:`);
    personas.forEach(p => {
      console.log(`  ${p.avatar} ${p.name} (${p.id})`);
    });
    console.log('✅ Test 1 passed\n');

    // Test 2: Create a custom persona
    console.log('Test 2: Create a custom persona');
    console.log('─'.repeat(60));
    try {
      const customPersona = await council.createPersona({
        id: 'test-philosopher',
        name: 'The Philosopher',
        system_prompt: 'You are a deep philosophical thinker who contemplates existence, meaning, and fundamental questions.',
        speaking_style: 'contemplative, profound, questioning. Use phrases like "Consider this...", "One might ask...", "The deeper question is..."',
        temperature: 0.8,
        avatar: '🤔',
        is_active: true
      });
      console.log(`Created custom persona: ${customPersona.name}`);
      console.log('✅ Test 2 passed\n');
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        console.log('Custom persona already exists, skipping creation');
        console.log('✅ Test 2 passed (skipped)\n');
      } else {
        throw error;
      }
    }

    // Test 3: Run a simple debate (mock mode if no API key)
    console.log('Test 3: Run a debate on a philosophical question');
    console.log('─'.repeat(60));

    const question = "Is it better to optimize for individual happiness or collective well-being?";
    console.log(`Question: ${question}\n`);

    if (!process.env.ANTHROPIC_API_KEY) {
      console.log('⚠️  No ANTHROPIC_API_KEY found - running in mock mode');
      console.log('   Set ANTHROPIC_API_KEY environment variable for real responses\n');
    }

    const result = await council.ask(question, {
      personaIds: ['skeptic', 'optimist', 'ethicist'], // Use subset for faster testing
      saveToHistory: true
    });

    console.log(`Received ${result.personas.length} persona responses`);
    console.log(`Moderator synthesis: ${result.moderator_summary.substring(0, 100)}...`);
    console.log('✅ Test 3 passed\n');

    // Test 4: Check debate history
    console.log('Test 4: Check debate history');
    console.log('─'.repeat(60));
    const history = await council.getDebateHistory(5);
    console.log(`Found ${history.length} debates in history`);
    if (history.length > 0) {
      const latest = history[0];
      console.log(`Latest debate: "${latest.question}" (${new Date(latest.timestamp).toLocaleString()})`);
    }
    console.log('✅ Test 4 passed\n');

    console.log('═'.repeat(60));
    console.log('✅ All tests passed!');
    console.log('═'.repeat(60));

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    throw error;
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}

export { runTests };
