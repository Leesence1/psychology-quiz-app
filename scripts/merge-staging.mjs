#!/usr/bin/env node
/**
 * Merge authored fragments from content/staging/ into public/questions.json.
 *
 * Authoring runs in parallel (several agents, one per chapter), so the fragments
 * are the concurrency boundary: agents never touch the live bank, and this script
 * is the single writer. It is idempotent — a chapter whose id already exists is
 * replaced, not appended twice — so a partial or repeated run is safe.
 *
 * Fragments are deleted afterwards on purpose: leaving them would create a second
 * source of truth that silently drifts from the bank.
 *
 * Usage: npm run merge:questions
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, unlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BANK = join(ROOT, 'public', 'questions.json');
const STAGING = join(ROOT, 'content', 'staging');

// Block order for newly added chapters; anything unlisted is appended afterwards.
const BLOCK_ORDER = [
  'guide1', 'guide2', 'guide3', 'guide7', 'guide8', 'guide9', 'guide10', 'guide11',
  'stat1', 'stat2', 'stat3', 'stat4', 'stat5', 'stat6', 'stat7',
  'meas1', 'meas2', 'meas3', 'meas4', 'meas5', 'meas6',
];

if (!existsSync(STAGING)) {
  console.error(`✗ no staging directory at ${STAGING}`);
  process.exit(1);
}

const files = readdirSync(STAGING).filter(f => f.endsWith('.json'));
if (files.length === 0) {
  console.error(`✗ no fragments in ${STAGING} — nothing to merge`);
  process.exit(1);
}

const bank = JSON.parse(readFileSync(BANK, 'utf8'));
if (!Array.isArray(bank)) {
  console.error('✗ public/questions.json is not an array');
  process.exit(1);
}

const byId = new Map(bank.map((c, i) => [c.id, i]));
const report = [];

for (const file of files.sort()) {
  const path = join(STAGING, file);
  let chapter;
  try {
    chapter = JSON.parse(readFileSync(path, 'utf8'));
  } catch (err) {
    console.error(`✗ ${file}: not valid JSON — ${err.message}`);
    process.exit(1);
  }
  if (!chapter || typeof chapter.id !== 'string' || !Array.isArray(chapter.questions)) {
    console.error(`✗ ${file}: expected {id, title, questions[]}`);
    process.exit(1);
  }
  if (chapter.questions.length === 0) {
    console.error(`✗ ${file}: has no questions`);
    process.exit(1);
  }

  // Guard against an author reusing an id and silently clobbering an existing block.
  const existingIdx = byId.get(chapter.id);
  if (existingIdx !== undefined && !/^(guide|stat|meas)\d+$/.test(chapter.id)) {
    console.error(`✗ ${file}: id "${chapter.id}" collides with an existing chapter`);
    process.exit(1);
  }

  if (existingIdx !== undefined) {
    report.push(`  replaced ${chapter.id} (${bank[existingIdx].questions.length} -> ${chapter.questions.length})`);
    bank[existingIdx] = chapter;
  } else {
    byId.set(chapter.id, bank.length);
    bank.push(chapter);
    report.push(`  added    ${chapter.id} (${chapter.questions.length} questions)`);
  }
}

// Group the newly appended chapters by block so the dashboard reads coherently.
const orderOf = (id) => {
  const i = BLOCK_ORDER.indexOf(id);
  return i === -1 ? BLOCK_ORDER.length + 100 : i;
};
const isNew = (c) => /^(guide|stat|meas)\d+$/.test(c.id);
const kept = bank.filter(c => !isNew(c));
const added = bank.filter(isNew).sort((a, b) => orderOf(a.id) - orderOf(b.id));
const merged = [...kept, ...added];

writeFileSync(BANK, JSON.stringify(merged, null, 2) + '\n', 'utf8');

// Fragments are spent: the merged bank is now the single source of truth.
for (const file of files) unlinkSync(join(STAGING, file));

const total = merged.reduce((n, c) => n + c.questions.length, 0);
const counts = { single: 0, multi: 0, subjective: 0 };
for (const c of merged) for (const q of c.questions) counts[q.type] = (counts[q.type] ?? 0) + 1;

console.log(`merged ${files.length} fragment(s):`);
report.forEach(l => console.log(l));
console.log(`\nbank now: ${merged.length} chapters, ${total} questions`);
console.log(`  single=${counts.single}  multi=${counts.multi}  subjective=${counts.subjective}`);
console.log('\nnext: npm run validate:questions && npm run build');
