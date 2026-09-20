#!/usr/bin/env node
/**
 * Validate the question bank before it reaches users.
 *
 * The bank is this project's main asset and its main contribution surface, but
 * nothing checked it: a malformed question (answer index out of range, a `multi`
 * answer that is not an array, a subjective question with no answer) would ship
 * silently and only surface as a broken quiz screen.
 *
 * Runs with no dependencies so it works in CI and locally alike.
 * Usage: npm run validate:questions
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BANK = join(ROOT, 'public', 'questions.json');
const TYPES = new Set(['single', 'multi', 'subjective']);

const errors = [];
const warnings = [];
const fail = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);

let raw;
try {
  raw = readFileSync(BANK, 'utf8');
} catch (err) {
  console.error(`✗ cannot read ${BANK}\n  ${err.message}`);
  process.exit(1);
}

let chapters;
try {
  chapters = JSON.parse(raw);
} catch (err) {
  console.error(`✗ questions.json is not valid JSON: ${err.message}`);
  process.exit(1);
}

if (!Array.isArray(chapters)) {
  console.error('✗ questions.json must be a top-level array of chapters');
  process.exit(1);
}

const stats = { chapters: chapters.length, single: 0, multi: 0, subjective: 0 };

chapters.forEach((ch, ci) => {
  const cw = `chapter[${ci}]`;
  if (typeof ch?.id !== 'string' || ch.id.trim() === '') fail(cw, 'missing string id');
  if (typeof ch?.title !== 'string' || ch.title.trim() === '') fail(cw, 'missing string title');
  if (!Array.isArray(ch?.questions)) {
    fail(cw, 'missing questions array');
    return;
  }
  const chId = ch.id ?? cw;
  if (ch.questions.length === 0) warn(chId, 'has no questions');

  const seen = new Set();
  ch.questions.forEach((q, qi) => {
    const where = `${chId}/q[${qi}]`;
    if (typeof q?.id !== 'number' || !Number.isInteger(q.id)) {
      fail(where, 'id must be an integer');
    } else if (seen.has(q.id)) {
      fail(where, `duplicate id ${q.id} within chapter`);
    } else {
      seen.add(q.id);
    }

    if (!TYPES.has(q?.type)) {
      fail(where, `type must be one of single|multi|subjective, got ${JSON.stringify(q?.type)}`);
      return;
    }
    stats[q.type] += 1;

    if (typeof q.q !== 'string' || q.q.trim() === '') fail(where, 'question text (q) is empty');

    if (q.type === 'subjective') {
      if (typeof q.answer !== 'string' || q.answer.trim() === '') {
        fail(where, 'subjective question needs a non-empty string answer (答案要点)');
      }
      if (q.options !== undefined) warn(where, 'subjective question should not have options');
      return;
    }

    // single / multi
    if (!Array.isArray(q.options) || q.options.length < 2) {
      fail(where, 'options must be an array with at least 2 entries');
    } else if (q.options.some(o => typeof o !== 'string' || o.trim() === '')) {
      warn(where, 'has an empty option');
    }
    const optCount = Array.isArray(q.options) ? q.options.length : 0;

    if (typeof q.explain !== 'string' || q.explain.trim() === '') {
      warn(where, 'missing explain (解析) — required by the project conventions');
    }

    if (q.type === 'single') {
      if (!Number.isInteger(q.answer)) {
        fail(where, `single answer must be an integer index, got ${JSON.stringify(q.answer)}`);
      } else if (q.answer < 0 || q.answer >= optCount) {
        fail(where, `single answer ${q.answer} out of range (0..${optCount - 1})`);
      }
    }

    if (q.type === 'multi') {
      if (!Array.isArray(q.answer)) {
        fail(where, `multi answer must be an array of indexes, got ${JSON.stringify(q.answer)}`);
      } else {
        if (q.answer.length === 0) fail(where, 'multi answer is empty');
        if (new Set(q.answer).size !== q.answer.length) fail(where, 'multi answer has duplicate indexes');
        q.answer.forEach(a => {
          if (!Number.isInteger(a)) fail(where, `multi answer index ${JSON.stringify(a)} is not an integer`);
          else if (a < 0 || a >= optCount) fail(where, `multi answer index ${a} out of range (0..${optCount - 1})`);
        });
        if (q.answer.length === 1) warn(where, 'multi question has exactly one correct option — should it be type "single"?');
      }
    }

    if (optCount > 4) warn(where, `${optCount} options — unusual for 347 (单选题 is normally A–D); confirm this is intentional`);
  });
});

const total = stats.single + stats.multi + stats.subjective;
console.log(`question bank: ${stats.chapters} chapters, ${total} questions`);
console.log(`  single=${stats.single}  multi=${stats.multi}  subjective=${stats.subjective}`);

if (warnings.length) {
  console.log(`\n${warnings.length} warning(s):`);
  warnings.forEach(w => console.log(`  ⚠ ${w}`));
}
if (errors.length) {
  console.error(`\n✗ ${errors.length} error(s):`);
  errors.forEach(e => console.error(`  ✗ ${e}`));
  process.exit(1);
}
console.log('\n✓ questions.json is valid');
