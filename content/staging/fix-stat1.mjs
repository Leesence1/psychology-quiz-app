#!/usr/bin/env node
/**
 * One-off repair: the parallel merge (scripts/merge-staging.mjs) ran while stat1
 * was still being rebalanced, so the bank captured a 14-question stat1 (8 single).
 * stat2/stat3 in the bank already match their final form.
 *
 * This script re-emits the three statistics chapters as staging fragments so the
 * merge can be re-run idempotently. stat1 is trimmed to the SPEC quota
 * (6 single / 2 multi / 4 subjective) by dropping the two redundant偏态/标准分数
 * single-choice items and renumbering ids contiguously.
 *
 * Usage: node content/staging/fix-stat1.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const bank = JSON.parse(readFileSync(join(ROOT, 'public', 'questions.json'), 'utf8'));

const DROP_STAT1_QTEXT = [
  '在偏态分布中，平均数、中数与众数三者的关系是',
  '某次测验中，甲、乙两名学生来自不同班级',
];

const stat1 = bank.find(c => c.id === 'stat1');
if (!stat1) throw new Error('stat1 not found in bank');

const kept = stat1.questions.filter(
  q => !DROP_STAT1_QTEXT.some(t => q.q.startsWith(t))
);
if (kept.length !== 12) throw new Error(`expected 12 kept questions, got ${kept.length}`);
kept.forEach((q, i) => { q.id = i + 1; });

const out = { id: 'stat1', title: stat1.title, questions: kept };
writeFileSync(join(HERE, 'stat1.json'), JSON.stringify(out, null, 2) + '\n', 'utf8');

for (const id of ['stat2', 'stat3']) {
  const ch = bank.find(c => c.id === id);
  if (!ch) throw new Error(`${id} not found in bank`);
  ch.questions.forEach((q, i) => {
    if (q.id !== i + 1) throw new Error(`${id} q[${i}] has non-contiguous id ${q.id}`);
  });
  writeFileSync(join(HERE, `${id}.json`), JSON.stringify(ch, null, 2) + '\n', 'utf8');
}

for (const id of ['stat1', 'stat2', 'stat3']) {
  const ch = JSON.parse(readFileSync(join(HERE, `${id}.json`), 'utf8'));
  const k = { single: 0, multi: 0, subjective: 0 };
  ch.questions.forEach(q => k[q.type]++);
  console.log(
    `${id}: ${ch.questions.length} questions  single=${k.single} multi=${k.multi} subjective=${k.subjective}`
  );
}
