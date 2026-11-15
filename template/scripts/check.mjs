#!/usr/bin/env node
// Baseline checks: everything CI and the git hooks run on docs, specs, ADRs and adapters.
// Usage: node scripts/check.mjs
import { existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT, walk, rel, read, frontmatter, stripNonProse } from './lib.mjs';

const failures = [];
const fail = (file, msg) => failures.push(`${file}: ${msg}`);

const STANDARD_STATUSES = ['not-started', 'proposed', 'in-progress', 'ratified'];
const ADR_STATUSES = ['proposed', 'accepted', 'rejected', 'superseded'];
const SPEC_STATUSES = ['draft', 'approved', 'implemented', 'superseded', 'abandoned'];

const isTemplateFile = (p) => /(^|\/)_template\.md$|-template\.md$/.test(p);
const MARKER_RE = /\[\[[^\]\n]+\]\]|\[NEEDS CLARIFICATION[^\]]*\]/g;

const mdFiles = walk(ROOT, (p) => p.endsWith('.md')).map((p) => [p, rel(p)]);

// 1. Frontmatter status values, and "binding" documents must be complete.
for (const [abs, file] of mdFiles) {
  if (!file.startsWith('docs/') || isTemplateFile(file)) continue;
  const text = read(abs);
  const fm = frontmatter(text);
  if (!fm || !('status' in fm)) continue;

  let allowed = STANDARD_STATUSES;
  let binding = ['ratified'];
  if (/^docs\/04-adr\/ADR-\d+/.test(file)) { allowed = ADR_STATUSES; binding = ['accepted']; }
  else if ('spec' in fm || 'story' in fm) { allowed = SPEC_STATUSES; binding = ['approved', 'implemented']; }

  if (!allowed.includes(fm.status)) fail(file, `status "${fm.status}" is not one of ${allowed.join(', ')}`);

  if (binding.includes(fm.status)) {
    const markers = stripNonProse(text).match(MARKER_RE);
    if (markers) fail(file, `is ${fm.status} but still has unresolved markers: ${[...new Set(markers)].join(', ')}`);
    if (fm.status === 'ratified') {
      if (!fm.owner || fm.owner === 'TBD') fail(file, 'is ratified but owner is TBD');
      if (!fm['last-reviewed'] || fm['last-reviewed'] === 'never') fail(file, 'is ratified but last-reviewed is never');
    }
  }
}

// 2. Relative Markdown links resolve.
const LINK_RE = /\[[^\]]*\]\(([^)\s]+)\)/g;
for (const [abs, file] of mdFiles) {
  const prose = read(abs).replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
  for (const m of prose.matchAll(LINK_RE)) {
    const target = m[1].split('#')[0];
    if (!target || /^[a-z]+:/i.test(target)) continue;
    if (!existsSync(resolve(dirname(abs), decodeURI(target)))) fail(file, `broken link -> ${m[1]}`);
  }
}

// 3. Core documents never depend on packs.
for (const [abs, file] of mdFiles) {
  if (!/^docs\/\d\d-/.test(file)) continue;
  if (/\(\.\.\/(\.\.\/)?packs\/|docs\/packs\//.test(stripNonProse(read(abs)))) {
    fail(file, 'a core document must not link into docs/packs/ (packs depend on the core, never the reverse)');
  }
}

// 4. Forbidden terms (glossary-forbidden words), if the project has declared any.
const forbiddenFile = join(ROOT, '.baseline', 'forbidden-terms.txt');
if (existsSync(forbiddenFile)) {
  const terms = read(forbiddenFile).split('\n').map((t) => t.trim()).filter((t) => t && !t.startsWith('#'));
  if (terms.length) {
    const re = new RegExp(`\\b(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'i');
    const textFiles = walk(ROOT, (p) => /\.(md|ts|tsx|js|mjs|py|go|rs|java|kt|cs|json|ya?ml|sql|proto)$/.test(p));
    for (const abs of textFiles) {
      const file = rel(abs);
      if (file === 'docs/02-domain/glossary.md' || file.startsWith('.baseline/')) continue;
      const hit = read(abs).match(re);
      if (hit) fail(file, `uses forbidden term "${hit[1]}" (see docs/02-domain/glossary.md)`);
    }
  }
}

// 5. AI-tool adapters are thin and in sync with .agents/.
const sync = spawnSync(process.execPath, [join(ROOT, 'scripts', 'sync-adapters.mjs'), '--check'], { encoding: 'utf8' });
if (sync.status !== 0) failures.push(...(sync.stdout + sync.stderr).trim().split('\n').filter(Boolean));

if (failures.length) {
  console.error(`check: ${failures.length} problem(s)\n`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log('check: ok');
