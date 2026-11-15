#!/usr/bin/env node
// Lists every unanswered parameter (`[[name]]` in a `## Parameters` table) with its default and
// trade-off, so the bootstrap can offer the long tail in bulk.
//   node scripts/params.mjs                    all documents under docs/
//   node scripts/params.mjs docs/06-security   only documents under a path
//   node scripts/params.mjs --json             machine-readable output
import { ROOT, walk, rel, read, frontmatter, sections } from './lib.mjs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const asJson = args.includes('--json');
const roots = args.filter((a) => !a.startsWith('--'));
const bases = (roots.length ? roots : ['docs']).map((r) => join(ROOT, r));

const files = bases
  .flatMap((b) => walk(b, (p) => p.endsWith('.md')))
  .filter((p) => !/(^|[\\/])_[^\\/]*\.md$|-template\.md$/.test(p))
  .sort();

const out = [];
for (const abs of files) {
  const text = read(abs);
  const fm = frontmatter(text);
  if (!fm || fm.status === 'ratified') continue;
  const body = sections(text).Parameters ?? '';
  const open = [];
  for (const line of body.split('\n')) {
    const cells = line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
    const name = cells[0]?.match(/^`([\w-]+)`$/);
    if (!name || !/\[\[[^\]]+\]\]/.test(cells[1] ?? '')) continue;
    open.push({ name: name[1], default: cells[2] ?? '', tradeoff: cells[3] ?? '' });
  }
  if (open.length) out.push({ file: rel(abs), status: fm.status, params: open });
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
  }
  console.log(`\n${n} open parameter(s) in ${out.length} document(s).`);
}
