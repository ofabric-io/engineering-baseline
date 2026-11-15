#!/usr/bin/env node
// Lists every unanswered `[[...]]` in the documents (Parameters tables and anywhere else), grouped
// by document, and fails when a parameter name is defined in more than one Parameters table.
//   node scripts/params.mjs                    all documents under docs/
//   node scripts/params.mjs docs/06-security   only documents under a path
//   node scripts/params.mjs --json             machine-readable output
//   node scripts/params.mjs --duplicates       only the duplicate-name check; one "path: message" per line
// Exit 1 when a parameter name is defined twice. A Parameters row whose Answer is `default`
// (or any value) is answered; only `[[...]]` is open.
import { ROOT, walk, rel, read, frontmatter, linesWithContext, tableCells, parameterRows, isTemplatePath } from './lib.mjs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const asJson = args.includes('--json');
const dupOnly = args.includes('--duplicates');
const roots = args.filter((a) => !a.startsWith('--'));
const bases = (roots.length ? roots : ['docs']).map((r) => join(ROOT, r));

const allDocs = walk(join(ROOT, 'docs'), (p) => p.endsWith('.md') && !isTemplatePath(rel(p))).sort();

// Duplicate parameter names across the whole project (names are unique across core and packs).
const defined = new Map();
for (const abs of allDocs) {
  const fm = frontmatter(read(abs));
  if (fm?.status === 'not-applicable') continue;
  for (const p of parameterRows(read(abs))) {
    if (!defined.has(p.name)) defined.set(p.name, []);
    defined.get(p.name).push(`${rel(abs)}:${p.line}`);
  }
}
const duplicates = [...defined].filter(([, where]) => where.length > 1);
const dupMessage = ([name, where]) =>
  `parameter "${name}" is defined more than once (${where.join(' and ')}); parameter names are unique across the project, so prefix one by its topic (e.g. audit_${name}) and update its references`;

if (dupOnly) {
  for (const d of duplicates) console.log(`${d[1][0].split(':')[0]}: ${dupMessage(d)}`);
  process.exit(duplicates.length ? 1 : 0);
}

const files = bases.flatMap((b) => walk(b, (p) => p.endsWith('.md'))).filter((p) => !isTemplatePath(rel(p))).sort();

const out = [];
for (const abs of files) {
  const text = read(abs);
  const fm = frontmatter(text);
  if (!fm || fm.status === 'ratified' || fm.status === 'not-applicable') continue;
  const params = [];
  const other = [];
  for (const { line, n, section, fenced } of linesWithContext(text)) {
    if (fenced) continue;
    const prose = line.replace(/`[^`\n]*`/g, ''); // inline code is syntax, not a marker
    const markers = [...prose.matchAll(/\[\[([^\]\n]+)\]\]/g)].map((m) => m[0]);
    if (!markers.length) continue;
    const cells = section === 'Parameters' ? tableCells(line) : null;
    const name = cells?.[0]?.match(/^`([\w-]+)`$/);
    if (name && /\[\[[^\]]+\]\]/.test(cells[1] ?? '')) {
      params.push({ name: name[1], default: cells[2] ?? '', tradeoff: cells[3] ?? '', line: n });
    } else {
      for (const m of markers) other.push({ marker: m, line: n, section: section ?? '' });
    }
  }
  if (params.length || other.length) out.push({ file: rel(abs), status: fm.status, params, other });
}

if (asJson) {
  console.log(JSON.stringify(out, null, 2));
} else {
  let n = 0;
  for (const doc of out) {
    console.log(`\n${doc.file} (${doc.status})`);
    for (const p of doc.params) {
      n++;
      console.log(`  ${p.name}: ${p.default}${p.tradeoff && p.tradeoff !== '—' ? `  — ${p.tradeoff}` : ''}`);
    }
    for (const o of doc.other) {
      n++;
      console.log(`  ${o.marker} (line ${o.line}${o.section ? `, ${o.section}` : ''}): fill in the table or text where it stands`);
    }
  }
  console.log(`\n${n} open marker(s) in ${out.length} document(s).`);
}
if (duplicates.length) {
  for (const d of duplicates) console.error(`params: ${dupMessage(d)}`);
  process.exit(1);
}
