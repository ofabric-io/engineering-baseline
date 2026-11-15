// The bootstrap's decisions, shared by scripts/recommend.mjs and scripts/apply-answers.mjs.
//
// A decision is one of:
//   question  a headline question in bootstrap/questionnaire.md (tables whose first column is `Id`)
//   param     an open `[[...]]` parameter in a `## Parameters` table that no question names
//   open      an unticked bullet in a document's `## Open decisions` (not the "Ratify this
//             document" bullet, and not one already queued with "→ DECISION-QUEUE")
// A parameter or bullet belongs to the question whose "Writes to" cell names it, else to the last
// question that offers its document. Ids: `<question>`, `<question>/<doc>/<param>`,
// `<question>/<doc>/open-<n>` (n counts the section's bullets, ticked or not, from 1, skipping the
// "Ratify" bullet, so it is stable when bullets are ticked or queued).
import { ROOT, walk, rel, read, frontmatter, parameterRows, isTemplatePath, linesWithContext, parseList, ruleBlocks, projectKinds, COMPONENT_KINDS } from './lib.mjs';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

export const QUESTIONNAIRE = 'bootstrap/questionnaire.md';
export const ANSWERS = '.baseline/answers.yaml';
export const SHEET = '.baseline/recommendations.md';
export const QUEUE = 'docs/DECISION-QUEUE.md';
export const SOURCES = ['brief', 'derived', 'default', 'ask', 'n/a', 'user'];
export const PHASES = [
  ['0', 'Phase 0 — Intake'], ['1', 'Phase 1 — Business'], ['2', 'Phase 2 — Domain'],
  ['3', 'Phase 3 — Architecture'], ['P', 'Phase 4P — Packs'], ['4', 'Phase 4 — Platform defaults'],
  ['5', 'Phase 5 — Technology'], ['6', 'Phase 6 — Process'],
];
// A default that is not a value: the project must supply it (from the brief, or by being asked).
const NO_DEFAULT = /— \(required\)|must be answered|listed by the bootstrap|listed by the project|seeded by the bootstrap|illustrative only/i;
const DERIVED = /^(from \d|derived from)/i;
const RATIFY_BULLET = /^Ratify this document\b/i;
export const QUEUED = /→\s*DECISION-QUEUE\.?$/;

/** Splits a table line on unescaped pipes, so a value may contain `\|`. */
export const cells = (line) => {
  const t = line.trim();
  if (!t.startsWith('|')) return null;
  return t.slice(1, t.endsWith('|') && !t.endsWith('\\|') ? -1 : undefined).split(/(?<!\\)\|/).map((c) => c.trim());
};
export const esc = (s) => String(s ?? '').replace(/\r?\n/g, ' ').replace(/(?<!\\)\|/g, '\\|');
export const phaseOf = (id) => (id.startsWith('P.') ? 'P' : id.split(/[./]/)[0]);

/** Bullets of a document's `## Open decisions` section: [{ n, text, ticked, queued, start, end }]. */
export function openBullets(text) {
  const out = [];
  let cur = null;
  let n = 0;
  for (const { line, n: lineNo, section, fenced } of linesWithContext(text)) {
    const bullet = !fenced && section === 'Open decisions' && line.match(/^[-*]\s+\[([ xX])\]\s+(.*)$/);
    if (bullet) {
      cur = { text: bullet[2].trim(), ticked: bullet[1] !== ' ', start: lineNo, end: lineNo };
      if (RATIFY_BULLET.test(cur.text)) { cur = null; continue; }
      cur.n = ++n;
      out.push(cur);
    } else if (cur && section === 'Open decisions' && /^\s+\S/.test(line)) {
      cur.text += ` ${line.trim()}`;
      cur.end = lineNo;
    } else {
      cur = null;
    }
  }
  for (const b of out) b.queued = QUEUED.test(b.text);
  return out;
}

/**
 * Entries of .baseline/answers.yaml `answers:` — one line per entry:
 *   "<id>": { answer: <value or "quoted value">, source: <s>, decided: <date>, adr: <id or null> }
 */
export function readAnswers() {
  const map = new Map();
  const p = join(ROOT, ANSWERS);
  if (!existsSync(p)) return map;
  let inAnswers = false;
  for (const line of read(p).split(/\r?\n/)) {
    if (/^answers:/.test(line)) { inAnswers = true; continue; }
    if (/^\S/.test(line)) inAnswers = false;
    const m = inAnswers && line.match(/^\s+(?:"([^"]+)"|([\w./-]+))\s*:\s*(.*)$/);
    if (!m) continue;
    const body = m[3];
    const field = (name) => {
      const f = body.match(new RegExp(`\\b${name}:\\s*(?:"((?:[^"\\\\]|\\\\.)*)"|'((?:[^']|'')*)'|([^,}]*))`));
      if (!f) return null;
      if (f[1] !== undefined) return f[1].replace(/\\(.)/g, '$1');
      if (f[2] !== undefined) return f[2].replace(/''/g, "'");
      return f[3].trim();
    };
    map.set(m[1] ?? m[2], { answer: field('answer'), source: field('source'), adr: field('adr') });
  }
  return map;
}

/**
 * Every decision, with errors when the questionnaire and the documents disagree.
 * `kinds`: component kinds known from elsewhere (e.g. `recommend.mjs --kinds cli,library`). With the
 * Components table, the `component_kinds` answer and the answer to 0.5, they decide which
 * parameters and open decisions are `n/a`: those of a document whose `applies-to` names none of
 * the project's kinds, and a parameter whose every citing rule is scoped to absent kinds.
 */
export function loadDecisions({ kinds: extraKinds = [] } = {}) {
  const errors = [];
  const docsDir = join(ROOT, 'docs');
  const docFiles = walk(docsDir, (p) => p.endsWith('.md')).map((p) => rel(p).replace(/^docs\//, '')).filter((p) => !isTemplatePath(p)).sort();
  const docInfo = new Map();
  for (const d of docFiles) {
    const text = read(join(docsDir, d));
    const fm = frontmatter(text);
    docInfo.set(d, {
      status: fm?.status,
      appliesTo: fm && 'applies-to' in fm ? parseList(fm['applies-to']) : null,
      params: parameterRows(text),
      bullets: openBullets(text),
      rules: ruleBlocks(text),
    });
  }
  const isOpen = (p) => /\[\[[^\]]+\]\]/.test(p.answer);
  const closed = (info) => info.status === 'ratified' || info.status === 'not-applicable';

  if (!existsSync(join(ROOT, QUESTIONNAIRE))) return { rows: [], errors: [`${QUESTIONNAIRE} not found`], docInfo };
  const questions = [];
  let header = null;
  for (const line of read(join(ROOT, QUESTIONNAIRE)).split(/\r?\n/)) {
    const c = cells(line);
    if (!c) { header = null; continue; }
    if (!header) { header = c.map((h) => h.toLowerCase()); continue; }
    if (/^-+$/.test(c[0].replace(/[: ]/g, ''))) continue;
    if (header[0] !== 'id') continue; // the Brief table (Step) is not part of the sheet
    const col = (name) => header.findIndex((h) => h === name);
    const text = c[1] ?? '';
    questions.push({
      id: c[0],
      text,
      def: col('default') >= 0 ? c[col('default')] : null,
      writes: col('writes to') >= 0 ? c[col('writes to')] : c[1],
      foundation: text.startsWith('⚑'),
    });
  }

  // "Writes to": `doc.md` `param` `param`, `dir/*`, `packs/x/`. Params follow the doc they belong to.
  const matchDocs = (token) => {
    if (token.endsWith('/*') || token.endsWith('/')) return docFiles.filter((d) => d.startsWith(token.replace(/\*$/, '')));
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
      q.params.push({ doc: last, param: token });
    }
  }

  const named = new Set(questions.flatMap((q) => q.params.map((p) => `${p.doc}#${p.param}`)));
  const owner = (doc) => questions.findLast((q) => q.docs.includes(doc));
  const answers = readAnswers();

  const rows = [];
  for (const q of questions) {
    if (q.def !== null) {
      const noDefault = NO_DEFAULT.test(q.def);
      const derived = DERIVED.test(q.def);
      rows.push({
        id: q.id,
        kind: 'question',
        params: q.params,
        decision: q.text,
        recommended: noDefault || derived ? '' : q.def,
        source: noDefault || q.foundation ? 'ask' : derived ? 'derived' : 'default',
        why: derived ? q.def : '',
      });
    }
    for (const doc of [...new Set(q.docs)]) {
      const info = docInfo.get(doc);
      if (closed(info) || owner(doc) !== q) continue;
      for (const p of info.params) {
        if (!isOpen(p) || named.has(`${doc}#${p.name}`)) continue; // a named parameter is its question's answer
        const noDefault = NO_DEFAULT.test(p.default);
        rows.push({
          id: `${q.id}/${doc}/${p.name}`,
          kind: 'param',
          doc,
          param: p.name,
          decision: `\`${p.name}\` in \`${doc}\``,
          recommended: noDefault ? '' : p.default,
          source: noDefault ? 'ask' : 'default',
          why: '',
        });
      }
      for (const b of info.bullets) {
        if (b.ticked || b.queued) continue;
        rows.push({
          id: `${q.id}/${doc}/open-${b.n}`,
          kind: 'open',
          doc,
          bullet: b.n,
          decision: `Open decision in \`${doc}\`: ${b.text}`,
          recommended: 'later',
          source: 'default',
          why: '',
        });
      }
    }
  }
  for (const [doc, info] of docInfo) {
    if (closed(info) || owner(doc)) continue;
    const hasNamed = [...named].some((k) => k.startsWith(`${doc}#`));
    if (info.params.some(isOpen) && !hasNamed) errors.push(`${QUESTIONNAIRE}: no question offers docs/${doc}, which has open parameters; name it in a question's "Writes to"`);
    else if (info.bullets.some((b) => !b.ticked && !b.queued)) errors.push(`${QUESTIONNAIRE}: no question offers docs/${doc}, which has open decisions; name it in a question's "Writes to"`);
  }
  // Not applicable, from the project's component kinds.
  const answerKinds = COMPONENT_KINDS.filter((k) => new RegExp(`\\b${k}\\b`).test(answers.get('0.5')?.answer ?? ''));
  const kinds = projectKinds([...extraKinds, ...answerKinds]);
  const absent = (list) => kinds.size > 0 && list.length > 0 && !list.some((k) => kinds.has(k));
  const have = [...kinds].join(', ');
  for (const r of rows) {
    if (!kinds.size || (r.kind !== 'param' && r.kind !== 'open')) continue;
    const info = docInfo.get(r.doc);
    let why = null;
    if (info.appliesTo && absent(info.appliesTo)) why = `the document applies to ${info.appliesTo.join(', ')}; the project has ${have}`;
    else if (r.kind === 'param') {
      const citing = info.rules.filter((rule) => rule.text.includes(`\`${r.param}\``));
      if (citing.length && citing.every((rule) => rule.kinds && absent(rule.kinds))) {
        why = `only ${citing.map((rule) => rule.id).join(', ')} use it, scoped to ${[...new Set(citing.flatMap((rule) => rule.kinds))].join(', ')}; the project has ${have}`;
      }
    }
    if (why) Object.assign(r, { plain: { recommended: r.recommended, source: r.source }, recommended: 'n/a', source: 'n/a', why });
  }
  for (const r of rows) {
    const a = answers.get(r.id);
    r.answered = Boolean(a && a.answer !== null && a.answer !== '');
    if (r.answered) r.answer = a.answer;
  }
  return { rows, errors, docInfo, answers };
}
