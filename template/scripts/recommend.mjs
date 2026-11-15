#!/usr/bin/env node
// Builds the bootstrap's recommendation sheet: one row per open decision, so the brief (0.1) can
// be turned into a recommended answer for each, and the user can accept them all at once.
//   node scripts/recommend.mjs          write or merge .baseline/recommendations.md
//   node scripts/recommend.mjs --check  fail if the sheet is missing rows or a row is incomplete
//   node scripts/recommend.mjs --json   print the expected rows as JSON
// A decision is a headline question in bootstrap/questionnaire.md (tables whose first column is
// `Id`) or an open `[[...]]` parameter in docs/. A parameter belongs to the question whose
// "Writes to" cell names it, else to the last question that offers its document; its id is
// `<question>/<doc path>/<param>`. Questions already answered in .baseline/answers.yaml are left out.
// Re-running keeps every filled row and adds new ones. Exit 1 when the questionnaire names a
// document or parameter that does not exist, or when an open parameter has no owning question.
import { ROOT, walk, rel, read, frontmatter, parameterRows, isTemplatePath } from './lib.mjs';
import { existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';

const QUESTIONNAIRE = 'bootstrap/questionnaire.md';
const ANSWERS = '.baseline/answers.yaml';
const SHEET = '.baseline/recommendations.md';
const SOURCES = ['brief', 'derived', 'default', 'ask', 'n/a'];
const PHASES = [
  ['0', 'Phase 0 — Intake'], ['1', 'Phase 1 — Business'], ['2', 'Phase 2 — Domain'],
  ['3', 'Phase 3 — Architecture'], ['P', 'Phase 4P — Packs'], ['4', 'Phase 4 — Platform defaults'],
  ['5', 'Phase 5 — Technology'], ['6', 'Phase 6 — Process'],
];
// A default that is not a value: the project must supply it (from the brief, or by being asked).
const NO_DEFAULT = /— \(required\)|must be answered|listed by the bootstrap|listed by the project|seeded by the bootstrap|illustrative only/i;
const DERIVED = /^(from \d|derived from)/i;

const args = process.argv.slice(2);
const errors = [];

// ---- cells: split on unescaped pipes, so a value may contain `\|`
const cells = (line) => {
  const t = line.trim();
  if (!t.startsWith('|')) return null;
  return t.slice(1, t.endsWith('|') && !t.endsWith('\\|') ? -1 : undefined).split(/(?<!\\)\|/).map((c) => c.trim());
};
const esc = (s) => String(s ?? '').replace(/\r?\n/g, ' ').replace(/(?<!\\)\|/g, '\\|');

// ---- documents and their parameters
const docsDir = join(ROOT, 'docs');
const docFiles = walk(docsDir, (p) => p.endsWith('.md')).map((p) => rel(p).replace(/^docs\//, '')).filter((p) => !isTemplatePath(p)).sort();
const docInfo = new Map();
for (const d of docFiles) {
  const text = read(join(docsDir, d));
  const fm = frontmatter(text);
  docInfo.set(d, { status: fm?.status, params: parameterRows(text) });
}
const isOpen = (p) => /\[\[[^\]]+\]\]/.test(p.answer);

// ---- questionnaire
if (!existsSync(join(ROOT, QUESTIONNAIRE))) {
  console.error(`recommend: ${QUESTIONNAIRE} not found`);
  process.exit(1);
}
const questions = [];
let header = null;
for (const line of read(join(ROOT, QUESTIONNAIRE)).split(/\r?\n/)) {
  const c = cells(line);
  if (!c) { header = null; continue; }
  if (!header) { header = c.map((h) => h.toLowerCase()); continue; }
  if (/^-+$/.test(c[0].replace(/[: ]/g, ''))) continue;
  if (header[0] !== 'id') continue; // the Brief table (Step) is not part of the sheet
  const col = (name) => header.findIndex((h) => h === name);
  const id = c[0];
  const text = c[1] ?? '';
  const def = col('default') >= 0 ? c[col('default')] : null;
  const writes = col('writes to') >= 0 ? c[col('writes to')] : c[1];
  questions.push({ id, text, def, writes, foundation: text.startsWith('⚑') });
}

// "Writes to": `doc.md` `param` `param`, `dir/*`, `packs/x/`. Params follow the doc they belong to.
const matchDocs = (token) => {
  if (token.endsWith('/*') || token.endsWith('/')) {
    const prefix = token.replace(/\*$/, '');
    return docFiles.filter((d) => d.startsWith(prefix));
  }
  return docInfo.has(token) ? [token] : null;
};
for (const q of questions) {
  q.docs = [];
  q.params = [];
  let last = null;
  for (const [, token] of q.writes.matchAll(/`([^`]+)`/g)) {
    if (/[<>\s]/.test(token)) { last = null; continue; } // a placeholder like `13-technology/<area>.md`
    if (/[./]/.test(token)) {
      const found = matchDocs(token);
      if (found) { q.docs.push(...found); last = found.length === 1 ? found[0] : null; continue; }
      if (token.endsWith('.md') && !existsSync(join(ROOT, token))) errors.push(`${QUESTIONNAIRE}: question ${q.id} names \`${token}\`, which is not a document under docs/`);
      last = null;
      continue;
    }
    if (!last || !/^[a-z][a-z0-9_]*$/.test(token)) continue;
    const info = docInfo.get(last);
    if (!info.params.some((p) => p.name === token)) {
      if (info.status !== 'not-applicable') errors.push(`${QUESTIONNAIRE}: question ${q.id} names parameter \`${token}\`, which is not in the Parameters table of ${last}`);
      continue;
    }
    q.params.push(`${last}#${token}`);
  }
}

// ---- answered ids
const answered = new Set();
if (existsSync(join(ROOT, ANSWERS))) {
  let inAnswers = false;
  for (const line of read(join(ROOT, ANSWERS)).split(/\r?\n/)) {
    if (/^answers:/.test(line)) { inAnswers = true; continue; }
    if (/^\S/.test(line)) inAnswers = false;
    const m = inAnswers && line.match(/^\s+(?:"([^"]+)"|([\w./-]+))\s*:/);
    if (m) answered.add(m[1] ?? m[2]);
  }
}

// ---- expected rows
const named = new Map();
for (const q of questions) for (const p of q.params) if (!named.has(p)) named.set(p, q);
const owner = (doc) => questions.findLast((q) => q.docs.includes(doc));

const rows = [];
for (const q of questions) {
  if (q.def !== null && !answered.has(q.id)) {
    const noDefault = NO_DEFAULT.test(q.def);
    const derived = DERIVED.test(q.def);
    rows.push({
      id: q.id,
      decision: q.text,
      recommended: noDefault || derived ? '' : q.def,
      source: noDefault || q.foundation ? 'ask' : derived ? 'derived' : 'default',
      why: derived ? q.def : '',
    });
  }
  for (const doc of q.docs) {
    const info = docInfo.get(doc);
    if (info.status === 'ratified' || info.status === 'not-applicable') continue;
    for (const p of info.params) {
      if (!isOpen(p)) continue;
      if (named.has(`${doc}#${p.name}`) || owner(doc) !== q) continue; // a named parameter is its question's answer
      const id = `${q.id}/${doc}/${p.name}`;
      if (answered.has(id) || rows.some((r) => r.id === id)) continue;
      const noDefault = NO_DEFAULT.test(p.default);
      rows.push({
        id,
        decision: `\`${p.name}\` in \`${doc}\``,
        recommended: noDefault ? '' : p.default,
        source: noDefault ? 'ask' : 'default',
        why: '',
      });
    }
  }
}
for (const [doc, info] of docInfo) {
  if (info.status === 'ratified' || info.status === 'not-applicable') continue;
  if (info.params.some(isOpen) && !owner(doc) && ![...named.keys()].some((k) => k.startsWith(`${doc}#`)))
    errors.push(`${QUESTIONNAIRE}: no question offers docs/${doc}, which has open parameters; name it in a question's "Writes to"`);
}

if (errors.length) {
  for (const e of errors) console.error(`recommend: ${e}`);
  process.exit(1);
}

if (args.includes('--json')) {
  console.log(JSON.stringify(rows, null, 2));
  process.exit(0);
}

// ---- read the existing sheet
const phaseOf = (id) => (id.startsWith('P.') ? 'P' : id.split(/[./]/)[0]);
const existing = new Map();
const sheetPath = join(ROOT, SHEET);
if (existsSync(sheetPath)) {
  for (const line of read(sheetPath).split(/\r?\n/)) {
    const c = cells(line);
    if (!c || c.length < 5 || c[0] === 'Id' || /^-+$/.test(c[0])) continue;
    existing.set(c[0], { id: c[0], decision: c[1], recommended: c[2], source: c[3], why: c[4] });
  }
}

if (args.includes('--check')) {
  const problems = [];
  if (!existsSync(sheetPath)) problems.push(`${SHEET} does not exist; run node scripts/recommend.mjs`);
  for (const r of rows) {
    const s = existing.get(r.id);
    if (!s) { if (existsSync(sheetPath)) problems.push(`${r.id}: missing from the sheet; run node scripts/recommend.mjs to add it`); continue; }
    if (!SOURCES.includes(s.source)) problems.push(`${r.id}: Source "${s.source}" is not one of ${SOURCES.join(', ')}`);
    if (['brief', 'derived', 'default'].includes(s.source) && !s.recommended) problems.push(`${r.id}: Source is ${s.source} but Recommended is empty`);
    if (['brief', 'derived', 'n/a'].includes(s.source) && !s.why) problems.push(`${r.id}: Source is ${s.source} but Why is empty; quote the brief or name the answer it follows from`);
  }
  for (const p of problems) console.error(`recommend: ${p}`);
  const asks = rows.filter((r) => existing.get(r.id)?.source === 'ask').length;
  if (!problems.length) console.log(`recommend: ok — ${rows.length} decision(s), ${asks} to ask`);
  process.exit(problems.length ? 1 : 0);
}

// ---- write, keeping filled rows
const merged = rows.map((r) => {
  const s = existing.get(r.id);
  return s && (s.recommended || s.source !== r.source || s.why) ? { ...r, recommended: s.recommended, source: s.source, why: s.why } : r;
});
const dropped = [...existing.keys()].filter((id) => !rows.some((r) => r.id === id));

const out = [
  '# Recommendation sheet',
  '',
  'Generated by `node scripts/recommend.mjs` from `bootstrap/questionnaire.md` and every open',
  'parameter in `docs/`. The bootstrap fills in **Recommended**, **Source** and **Why** from the',
  'brief (0.1), then asks once whether to accept every recommendation (0.6). Re-running the script',
  'keeps filled rows and adds new ones; `--check` fails while a row is incomplete.',
  '',
  'Source: `brief` — the brief settles it, and Why quotes the brief · `derived` — it follows from',
  'another answer, and Why names it · `default` — the baseline default; the brief says nothing',
  'against it · `ask` — there is no default, or the brief is silent on a ⚑ question; it is asked',
  'whatever mode is chosen · `n/a` — the component kinds make it moot, and Why says which.',
  '',
];
for (const [key, title] of PHASES) {
  const part = merged.filter((r) => phaseOf(r.id) === key);
  if (!part.length) continue;
  out.push(`## ${title}`, '', '| Id | Decision | Recommended | Source | Why |', '| --- | --- | --- | --- | --- |');
  for (const r of part) out.push(`| ${esc(r.id)} | ${esc(r.decision)} | ${esc(r.recommended)} | ${esc(r.source)} | ${esc(r.why)} |`);
  out.push('');
}
mkdirSync(dirname(sheetPath), { recursive: true });
writeFileSync(sheetPath, out.join('\n'));
const count = (s) => merged.filter((r) => r.source === s).length;
console.log(`recommend: wrote ${SHEET} — ${merged.length} decision(s): ${SOURCES.map((s) => `${count(s)} ${s}`).join(', ')}`);
if (dropped.length) console.log(`recommend: dropped rows no longer open: ${dropped.join(', ')}`);
