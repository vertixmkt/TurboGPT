/**
 * Traduz todos os skills de marketing para PT-BR usando a API da Anthropic.
 *
 * Uso:
 *   ANTHROPIC_API_KEY=sk-ant-... node scripts/translate-skills-ptbr.mjs
 *
 * O script salva o progresso incrementalmente — se for interrompido,
 * pode ser rodado novamente e vai pular os que já foram traduzidos.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA_FILE = join(ROOT, 'skills-data.js');
const PROGRESS_FILE = join(ROOT, 'scripts', '.translate-progress.json');
const ENV_FILE = join(ROOT, '.env');

function readEnvApiKey() {
  if (!existsSync(ENV_FILE)) return '';
  const env = readFileSync(ENV_FILE, 'utf8');
  const line = env.split(/\r?\n/).find(entry => entry.trim().startsWith('ANTHROPIC_API_KEY='));
  if (!line) return '';
  return line.split('=').slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
}

const apiKey = process.env.ANTHROPIC_API_KEY || readEnvApiKey();
if (!apiKey) {
  console.error('Defina ANTHROPIC_API_KEY no ambiente ou em .env antes de rodar o script.');
  process.exit(1);
}

const client = new Anthropic({ apiKey });

// Carrega os skills
const rawData = readFileSync(DATA_FILE, 'utf8');
const match = rawData.match(/window\.SKILLS_DATA\s*=\s*(\[[\s\S]*\]);/);
if (!match) { console.error('skills-data.js com formato inesperado'); process.exit(1); }
const skills = JSON.parse(match[1]);

// Carrega progresso salvo
let progress = {};
if (existsSync(PROGRESS_FILE)) {
  progress = JSON.parse(readFileSync(PROGRESS_FILE, 'utf8'));
  console.log(`Progresso carregado: ${Object.keys(progress).length} skills já traduzidas.`);
}

async function translateSkill(skill) {
  if (progress[skill.id]) {
    console.log(`⏭ ${skill.id} — já traduzido, pulando`);
    return progress[skill.id];
  }

  console.log(`🔄 Traduzindo: ${skill.id} — ${skill.name}`);

  const prompt = `Traduza o seguinte skill de IA para Português Brasileiro (PT-BR) de forma completa e fiel.

REGRAS:
- Mantenha toda a estrutura markdown (cabeçalhos, listas, negrito, código)
- Mantenha o frontmatter YAML intacto (--- no início e fim), mas traduza os valores de "name", "description" e os termos dentro de "description"
- Traduza o texto técnico de forma natural — não literal demais, mas precisa
- Mantenha termos técnicos amplamente usados em inglês (ex: "copywriting", "hook", "VSL", "CTA", "avatar", "framework", "META Ads")
- NÃO adicione explicações ou comentários — retorne APENAS o conteúdo traduzido

CONTEÚDO A TRADUZIR:
${skill.content}`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8096,
    messages: [{ role: 'user', content: prompt }],
  });

  const translated = message.content[0].text;

  // Salva progresso
  progress[skill.id] = { ...skill, content: translated };
  writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));

  return progress[skill.id];
}

async function main() {
  const translated = [];

  for (const skill of skills) {
    try {
      const result = await translateSkill(skill);
      translated.push(result);
    } catch (err) {
      console.error(`❌ Erro em ${skill.id}: ${err.message}`);
      // Mantém o original se falhar
      translated.push(skill);
    }

    // Pequena pausa para evitar rate limit
    await new Promise(r => setTimeout(r, 500));
  }

  // Salva o arquivo final
  const output = `// ── Skills Data (PT-BR) ─────────────────────────────────────────────────
window.SKILLS_DATA = ${JSON.stringify(translated, null, 2)};
`;
  writeFileSync(DATA_FILE, output);
  console.log(`\n✅ Concluído! ${translated.length} skills salvas em skills-data.js`);

  // Remove arquivo de progresso
  if (existsSync(PROGRESS_FILE)) {
    import('fs').then(({ unlinkSync }) => { try { unlinkSync(PROGRESS_FILE); } catch {} });
  }
}

main().catch(console.error);
