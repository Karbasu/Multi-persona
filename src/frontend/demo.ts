/**
 * Frontend Orchestrator Demo
 * Demonstrates transformation of debate output into UI-ready format
 */

import { council } from '../api/council.js';
import { frontEndOrchestrator } from './orchestrator.js';

async function runDemo() {
  console.log('🎬 Frontend Orchestrator Demo\n');
  console.log('═'.repeat(80));

  try {
    // Step 1: Run a debate
    console.log('\n📋 Step 1: Running backend debate...\n');

    const question = "Should AI be regulated by governments?";
    console.log(`Question: "${question}"\n`);

    const debateOutput = await council.ask(question, {
      personaIds: ['skeptic', 'optimist', 'ethicist'],
      saveToHistory: false
    });

    console.log('✅ Debate completed\n');

    // Step 2: Transform to UI-ready format
    console.log('📋 Step 2: Orchestrating UI visuals...\n');

    const uiOutput = await frontEndOrchestrator.orchestrate(debateOutput);

    console.log('✅ UI output generated\n');

    // Step 3: Display the transformed output
    console.log('═'.repeat(80));
    console.log('🎨 UI-READY OUTPUT (for Frontend Rendering)');
    console.log('═'.repeat(80));
    console.log();

    // Display scene metadata
    console.log('📊 Scene Metadata:');
    console.log(`   Persona Count: ${uiOutput.scene_metadata.persona_count}`);
    console.log(`   Layout Strategy: ${uiOutput.scene_metadata.layout_strategy}`);
    console.log(`   Total Duration: ${(uiOutput.total_duration_estimate / 1000).toFixed(1)}s`);
    console.log();

    // Display persona visuals
    console.log('👥 Persona Visuals:\n');

    for (const persona of uiOutput.persona_visuals) {
      console.log(`${persona.avatar} ${persona.name} (Order: ${persona.order})`);
      console.log(`   Animation: ${persona.animation}`);
      console.log(`   Position: ${persona.position}`);
      console.log(`   Emotion Tone: ${persona.emotion_tone}`);
      console.log(`   Color: ${persona.color}`);
      console.log(`   Typing Speed: ${persona.typing_speed}ms/char`);
      console.log(`   Delay: ${persona.delay_before_start}ms`);
      console.log(`   Text Length: ${persona.text.length} chars`);
      console.log();
    }

    // Display moderator visual
    console.log('🎯 Moderator Visual:\n');
    console.log(`   Animation: ${uiOutput.moderator_visual.animation}`);
    console.log(`   Typing Speed: ${uiOutput.moderator_visual.typing_speed}ms/char`);
    console.log(`   Delay: ${uiOutput.moderator_visual.delay_before_start}ms`);
    console.log(`   Text Length: ${uiOutput.moderator_visual.text.length} chars`);
    console.log();

    // Display full JSON output
    console.log('═'.repeat(80));
    console.log('📦 Full JSON Output (for API/Frontend):');
    console.log('═'.repeat(80));
    console.log();
    console.log(JSON.stringify(uiOutput, null, 2));
    console.log();

    console.log('═'.repeat(80));
    console.log('✅ Demo Complete!');
    console.log('═'.repeat(80));

  } catch (error) {
    console.error('❌ Demo failed:', error);
    throw error;
  }
}

// Run demo if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runDemo().catch(error => {
    console.error('Demo failed:', error);
    process.exit(1);
  });
}

export { runDemo };
