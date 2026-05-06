import { readdirSync, readFileSync, existsSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

const SKILLS_DIR = '/Users/matheuspinheiro/Documents/AGENTES/SKILLS';
const OUTPUT = '/Users/matheuspinheiro/Documents/AGENTES/Turbo GPT/skills-data.js';

const folders = readdirSync(SKILLS_DIR).filter(f => f.startsWith('marketing.'));

const skills = [];

for (const folder of folders) {
  const folderPath = join(SKILLS_DIR, folder);
  const skillFile = join(folderPath, 'SKILL.skill');
  const descFile = join(folderPath, 'descricao.txt');

  const mdFile = join(folderPath, 'SKILL.md');
  const hasZip = existsSync(skillFile);
  const hasMd = existsSync(mdFile);
  if (!hasZip && !hasMd) continue;

  // Read short description
  const shortDesc = existsSync(descFile)
    ? readFileSync(descFile, 'utf8').trim()
    : '';

  // Extract content — ZIP or plain MD
  let content = '';
  let name = '';
  let description = shortDesc;

  try {
    let raw = '';
    if (hasZip) {
      raw = execSync(`unzip -p "${skillFile}" 2>/dev/null`, { maxBuffer: 10 * 1024 * 1024 }).toString();
    } else {
      raw = readFileSync(mdFile, 'utf8');
    }
    content = raw;

    // Parse YAML frontmatter for name
    const nameMatch = raw.match(/^name:\s*(.+)$/m);
    if (nameMatch) name = nameMatch[1].trim();

    // Parse h1 as display name if no frontmatter name
    const h1Match = raw.match(/^# (.+)$/m);
    if (h1Match && !name) name = h1Match[1].trim();
    if (h1Match) name = h1Match[1].trim(); // prefer h1 as display name

    // Parse description from frontmatter (first sentence before triggers)
    const descMatch = raw.match(/description:\s*\|?\s*\n\s+\*\*([^*]+)\*\*/);
    if (descMatch) description = descMatch[1].trim();
    else if (shortDesc) description = shortDesc;

  } catch (e) {
    console.warn(`Failed to extract ${folder}: ${e.message}`);
    continue;
  }

  if (!name) {
    // Derive from folder name
    name = folder
      .replace('marketing.', '')
      .replace('.skill.md', '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  // Generate slug id
  const id = folder.replace('marketing.', '').replace('.skill.md', '');

  skills.push({ id, name, description, content });
  console.log(`✓ ${id} — ${name}`);
}

console.log(`\nTotal: ${skills.length} skills`);

const output = `// ── Skills Data ──────────────────────────────────────────────────────────
window.SKILLS_DATA = ${JSON.stringify(skills, null, 2)};
`;

writeFileSync(OUTPUT, output);
console.log(`\nSaved to ${OUTPUT}`);
