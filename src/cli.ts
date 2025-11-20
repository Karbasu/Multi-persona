/**
 * CLI Interface for Multi-Persona Council
 */

import { council } from './api/council.js';
import { Persona } from './types.js';

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  try {
    switch (command) {
      case 'ask':
        await handleAsk(args.slice(1));
        break;

      case 'personas':
        await handlePersonas(args.slice(1));
        break;

      case 'history':
        await handleHistory(args.slice(1));
        break;

      case 'help':
      default:
        showHelp();
        break;
    }
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

async function handleAsk(args: string[]) {
  const question = args.join(' ');

  if (!question) {
    console.error('❌ Please provide a question');
    console.log('Usage: npm run dev ask "Your question here"');
    process.exit(1);
  }

  const result = await council.ask(question);

  console.log('═'.repeat(80));
  console.log('🎭 MULTI-PERSONA DEBATE COUNCIL');
  console.log('═'.repeat(80));
  console.log();

  // Display each persona's response
  for (const persona of result.personas) {
    console.log('─'.repeat(80));
    console.log(`\n🗣️  ${persona.name}\n`);
    console.log(persona.response);
    console.log();
  }

  // Display moderator summary
  console.log('═'.repeat(80));
  console.log('🎯 MODERATOR SYNTHESIS');
  console.log('═'.repeat(80));
  console.log();
  console.log(result.moderator_summary);
  console.log();
  console.log('═'.repeat(80));
}

async function handlePersonas(args: string[]) {
  const subcommand = args[0];

  switch (subcommand) {
    case 'list':
      await listPersonas();
      break;

    case 'show':
      await showPersona(args[1]);
      break;

    case 'create':
      console.log('Create persona functionality - requires interactive input or JSON file');
      break;

    default:
      await listPersonas();
      break;
  }
}

async function listPersonas() {
  const personas = await council.listPersonas();

  console.log('\n📋 Available Personas:\n');

  for (const persona of personas) {
    const status = persona.is_active !== false ? '✓' : '✗';
    const type = persona.is_builtin ? 'built-in' : 'custom';
    console.log(`${status} ${persona.avatar} ${persona.name} (${type})`);
    console.log(`   ID: ${persona.id}`);
    console.log(`   Temperature: ${persona.temperature}`);
    console.log();
  }
}

async function showPersona(id: string) {
  if (!id) {
    console.error('❌ Please provide a persona ID');
    process.exit(1);
  }

  const persona = await council.getPersona(id);

  if (!persona) {
    console.error(`❌ Persona '${id}' not found`);
    process.exit(1);
  }

  console.log('\n' + '─'.repeat(80));
  console.log(`${persona.avatar} ${persona.name}`);
  console.log('─'.repeat(80));
  console.log(`ID: ${persona.id}`);
  console.log(`Type: ${persona.is_builtin ? 'Built-in' : 'Custom'}`);
  console.log(`Status: ${persona.is_active !== false ? 'Active' : 'Inactive'}`);
  console.log(`Temperature: ${persona.temperature}`);
  console.log(`Model: ${persona.model || 'default'}`);
  console.log();
  console.log('System Prompt:');
  console.log(persona.system_prompt);
  console.log();
  console.log('Speaking Style:');
  console.log(persona.speaking_style);
  console.log('─'.repeat(80) + '\n');
}

async function handleHistory(args: string[]) {
  const subcommand = args[0];

  switch (subcommand) {
    case 'list':
      await listHistory(parseInt(args[1]) || 10);
      break;

    case 'show':
      await showDebateSession(args[1]);
      break;

    case 'clear':
      await clearHistory();
      break;

    default:
      await listHistory(10);
      break;
  }
}

async function listHistory(limit: number) {
  const history = await council.getDebateHistory(limit);

  if (history.length === 0) {
    console.log('\n📚 No debate history found\n');
    return;
  }

  console.log(`\n📚 Recent Debates (showing ${Math.min(limit, history.length)} of ${history.length}):\n`);

  for (const session of history) {
    const date = new Date(session.timestamp);
    console.log(`ID: ${session.id}`);
    console.log(`Date: ${date.toLocaleString()}`);
    console.log(`Question: ${session.question}`);
    console.log(`Personas: ${session.active_personas.length}`);
    console.log();
  }
}

async function showDebateSession(id: string) {
  if (!id) {
    console.error('❌ Please provide a debate session ID');
    process.exit(1);
  }

  const session = await council.getDebateSession(id);

  if (!session) {
    console.error(`❌ Debate session '${id}' not found`);
    process.exit(1);
  }

  console.log('\n' + '═'.repeat(80));
  console.log(`🎭 DEBATE SESSION: ${session.id}`);
  console.log('═'.repeat(80));
  console.log(`Date: ${new Date(session.timestamp).toLocaleString()}`);
  console.log(`Question: ${session.question}`);
  console.log();

  for (const response of session.persona_responses) {
    console.log('─'.repeat(80));
    console.log(`\n🗣️  ${response.name}\n`);
    console.log(response.response);
    console.log();
  }

  console.log('═'.repeat(80));
  console.log('🎯 MODERATOR SYNTHESIS');
  console.log('═'.repeat(80));
  console.log();
  console.log(session.moderator_summary.full_text);
  console.log();
  console.log('═'.repeat(80) + '\n');
}

async function clearHistory() {
  await council.clearDebateHistory();
  console.log('✓ Debate history cleared\n');
}

function showHelp() {
  console.log(`
🎭 Multi-Persona Brainstorm Council CLI

USAGE:
  npm run dev <command> [arguments]

COMMANDS:
  ask <question>              Ask the council a question and run a debate
  personas [list|show]        Manage personas
  history [list|show|clear]   View or manage debate history
  help                        Show this help message

EXAMPLES:
  npm run dev ask "What is the meaning of life?"
  npm run dev personas list
  npm run dev personas show skeptic
  npm run dev history list
  npm run dev history show 1234567890
  npm run dev history clear

For more information, see the README.md file.
`);
}

main();
