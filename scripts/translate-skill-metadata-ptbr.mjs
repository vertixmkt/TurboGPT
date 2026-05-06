/**
 * Traduz apenas os campos externos name e description de skills-data.js.
 * O content markdown permanece intacto.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA_FILE = join(ROOT, 'skills-data.js');
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

const rawData = readFileSync(DATA_FILE, 'utf8');
const match = rawData.match(/window\.SKILLS_DATA\s*=\s*(\[[\s\S]*\]);/);
if (!match) {
  console.error('skills-data.js com formato inesperado');
  process.exit(1);
}

const skills = JSON.parse(match[1]);
const metadata = skills.map(({ id, name, description }) => ({ id, name, description }));

const client = new Anthropic({ apiKey });

const prompt = `Traduza para Português Brasileiro (PT-BR) os campos "name" e "description" do JSON abaixo.

REGRAS:
- Preserve exatamente cada "id".
- Retorne APENAS um JSON array válido.
- Não use markdown, comentários ou explicações.
- Mantenha em inglês estes termos técnicos quando fizer sentido: copywriting, hook, VSL, CTA, avatar, framework, META Ads, Google Ads, landing page.
- Traduza nomes de skills para títulos naturais em PT-BR, sem alterar marcas, linguagens, bibliotecas ou tecnologias.

JSON:
${JSON.stringify(metadata, null, 2)}`;

const message = await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 12000,
  messages: [{ role: 'user', content: prompt }],
});

const text = message.content[0].text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
const translated = JSON.parse(text);
const byId = new Map(translated.map(item => [item.id, item]));

const updated = skills.map(skill => {
  const item = byId.get(skill.id);
  if (!item) return skill;
  return {
    ...skill,
    name: item.name || skill.name,
    description: item.description || skill.description,
  };
});

const output = `// ── Skills Data (PT-BR) ─────────────────────────────────────────────────
window.SKILLS_DATA = ${JSON.stringify(updated, null, 2)};
`;
writeFileSync(DATA_FILE, output);

const usage = message.usage || {};
console.log(`Metadados traduzidos: ${updated.length}`);
console.log(`Tokens input: ${usage.input_tokens ?? 'n/d'}`);
console.log(`Tokens output: ${usage.output_tokens ?? 'n/d'}`);
