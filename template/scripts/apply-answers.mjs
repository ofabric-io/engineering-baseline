#!/usr/bin/env node
// Writes the answers recorded in .baseline/answers.yaml into the documents, so nobody fills
// `[[...]]` cells or queues open decisions by hand.
//   node scripts/apply-answers.mjs             apply every recorded answer that is not yet applied
//   node scripts/apply-answers.mjs --dry-run   print what would change, change nothing
//
// For each answered decision (scripts/decisions.mjs):
//   param                 the Answer cell becomes the answer (`default` stays the word `default`)
//   question with named   `default` / `n/a` fills every parameter it names; any other value fills
//   parameters            its parameter when it names exactly one, else it is reported for a
//                         person to write
//   open decision         `later` appends "→ DECISION-QUEUE" to the bullet; any other answer ticks
//                         it and appends "— decided: <answer>"
// Every `later` gets a row in docs/DECISION-QUEUE.md "Deferred decisions" (D1, D2, … — the next
// free number) unless a row already cites the decision's id. Rules, Enforcement and ADRs are not
// written here: that stays with the bootstrap and ratify-standard skills.
import { ROOT, read } from './lib.mjs';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadDecisions, openBullets, cells, esc, QUEUE } from './decisions.mjs';

const dryRun = process.argv.includes('--dry-run');
const { rows, errors } = loadDecisions();
if (errors.length) {
  for (const e of errors) console.error(`apply-answers: ${e}`);
  process.exit(1);
}

const files = new Map(); // docs-relative path -> text
const text = (doc) => {
  if (!files.has(doc)) files.set(doc, read(join(ROOT, 'docs', doc)));
  return files.get(doc);
};
const changes = [];
const manual = [];
const deferred = [];

function setParam(doc, param, value, id) {
  const lines = text(doc).split('\n');
  const i = lines.findIndex((l) => cells(l)?.[0] === `\`${param}\``);
  if (i < 0) { manual.push(`${id}: no row for \`${param}\` in docs/${doc}`); return; }
  const c = cells(lines[i]);
  if (!/\[\[[^\]]+\]\]/.test(c[1])) return; // already answered
  c[1] = esc(value);
  lines[i] = `| ${c.join(' | ')} |`;
  files.set(doc, lines.join('\n'));
  changes.push(`docs/${doc}: ${param} = ${value}`);
}

function closeBullet(doc, n, answer, id, question) {
  const b = openBullets(text(doc)).find((x) => x.n === n);
  if (!b || b.ticked || b.queued) return;
  const lines = text(doc).split('\n');
  if (answer === 'later') {
    lines[b.end - 1] = `${lines[b.end - 1].replace(/\s+$/, '')} → DECISION-QUEUE`;
    deferred.push({ id, question, doc });
    changes.push(`docs/${doc}: open decision ${n} queued`);
  } else {
    lines[b.start - 1] = lines[b.start - 1].replace(/\[ \]/, '[x]');
    lines[b.end - 1] = `${lines[b.end - 1].replace(/\s+$/, '')} — decided: ${answer}`;
    changes.push(`docs/${doc}: open decision ${n} decided`);
  }
  files.set(doc, lines.join('\n'));
}

for (const r of rows) {
  if (!r.answered) continue;
  const a = r.answer.trim();
  const later = /^later$/i.test(a);
  if (r.kind === 'param') {
    if (later) deferred.push({ id: r.id, question: `\`${r.param}\``, doc: r.doc });
    else setParam(r.doc, r.param, a, r.id);
  } else if (r.kind === 'open') {
    closeBullet(r.doc, r.bullet, later ? 'later' : a, r.id, r.decision.replace(/^Open decision in `[^`]+`: /, ''));
  } else if (r.params.length) {
    if (later) { deferred.push({ id: r.id, question: `${r.params.map((p) => `\`${p.param}\``).join(', ')}: ${r.decision}`, doc: r.params[0].doc }); continue; }
    if (/^(default|n\/a)$/i.test(a) || r.params.length === 1) for (const p of r.params) setParam(p.doc, p.param, a, r.id);
    else manual.push(`${r.id}: write "${a}" into ${r.params.map((p) => `\`${p.param}\` (docs/${p.doc})`).join(', ')}`);
  }
}

// Deferred decisions table.
if (deferred.length) {
  const q = 'DECISION-QUEUE.md';
  const lines = text(q).split('\n');
  const head = lines.findIndex((l) => /^## Deferred decisions/.test(l));
  let tableEnd = -1;
  let numbers = [0];
  for (let i = head + 1; head >= 0 && i < lines.length && !/^## /.test(lines[i]); i++) {
    const c = cells(lines[i]);
    if (!c) { if (tableEnd >= 0) break; continue; }
    tableEnd = i;
    const m = c[0].match(/^D(\d+)$/);
    if (m) numbers.push(Number(m[1]));
  }
  if (head < 0 || tableEnd < 0) {
    manual.push(`${QUEUE}: no "Deferred decisions" table found; add these rows by hand: ${deferred.map((d) => d.id).join(', ')}`);
  } else {
    const today = new Date().toISOString().slice(0, 10);
    let next = Math.max(...numbers) + 1;
    const add = [];
    for (const d of deferred) {
      if (lines.some((l) => l.includes(`(${d.id})`)) || add.some((l) => l.includes(`(${d.id})`))) continue;
      add.push(`| D${next++} | ${esc(d.question)} | \`${d.doc}\` (${d.id}) | no | ${today} |`);
    }
    if (add.length) {
      lines.splice(tableEnd + 1, 0, ...add);
      files.set(q, lines.join('\n'));
      changes.push(`${QUEUE}: ${add.length} deferred decision(s) added`);
    }
  }
}

for (const c of changes) console.log(`${dryRun ? 'would change' : 'changed'} ${c}`);
for (const m of manual) console.log(`by hand: ${m}`);
if (!dryRun) for (const [doc, t] of files) writeFileSync(join(ROOT, 'docs', doc), t);
console.log(`apply-answers: ${changes.length} change(s)${dryRun ? ' (dry run)' : ''}, ${manual.length} to write by hand`);
