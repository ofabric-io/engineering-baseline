#!/usr/bin/env node
// Baseline checks: everything CI and the git hooks run on docs, specs, ADRs and adapters.
// Usage: node scripts/check.mjs
import { existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT, walk, rel, read, frontmatter, stripNonProse, ruleIds, enforcementRows } from './lib.mjs';

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

// 6. Standards documents that are proposed, in-progress or ratified carry enforceable rules.
//    Format: `## Rules` lists `- **R<n>.** ...` (or `- **P<n>.**` for prohibitions; ids unique); `## Enforcement` is a table whose
//    first column is `R<n>` and whose last column holds one status: ✅ ◐ ⬜ ❌.
const ENFORCEMENT_STATUSES = '✅ ◐ ⬜ ❌';
const ruleCache = new Map();
const rulesOf = (abs) => {
  if (!ruleCache.has(abs)) ruleCache.set(abs, ruleIds(read(abs)));
  return ruleCache.get(abs);
};
for (const [abs, file] of mdFiles) {
  if (!file.startsWith('docs/') || isTemplateFile(file) || /^docs\/04-adr\/ADR-\d+/.test(file)) continue;
  const text = read(abs);
  const fm = frontmatter(text);
  if (!fm || !['proposed', 'in-progress', 'ratified'].includes(fm.status) || 'spec' in fm || 'story' in fm) continue;

  const ids = rulesOf(abs);
  if (!ids.length) {
    fail(file, `is ${fm.status} but its "## Rules" section has no rules; write each as "- **R1.** MUST ..." (a not-started document is exempt)`);
    continue;
  }
  const seen = new Set();
  for (const n of ids) {
    if (seen.has(n)) fail(file, `rule number ${n} is used more than once in "## Rules"; rule numbers are unique`);
    seen.add(n);
  }
  const rows = enforcementRows(text);
  const covered = new Set();
  for (const row of rows) {
    for (const n of row.ids) {
      covered.add(n);
      if (!seen.has(n)) fail(file, `"## Enforcement" has a row for ${n}, which is not a rule in "## Rules"`);
    }
    if (!row.status) fail(file, `"## Enforcement" row has no status (use one of ${ENFORCEMENT_STATUSES}): ${row.raw}`);
  }
  for (const n of seen) {
    if (!covered.has(n)) fail(file, `${n} has no row in "## Enforcement"; add "| ${n} | <mechanism> | <${ENFORCEMENT_STATUSES.split(' ').join(' | ')}> |"`);
  }
}

// 7. Cross-document rule references: "`path.md` R3" must name a rule that exists in that document.
const XREF_RE = /`?((?:[\w.-]+\/)*[\w.-]+\.md)`?[ \t]+([RP]\d+(?:[ \t]*(?:,|and|&)[ \t]*[RP]\d+)*)/g;
for (const [abs, file] of mdFiles) {
  if (isTemplateFile(file)) continue;
  const prose = read(abs).replace(/```[\s\S]*?```/g, '').replace(/<!--[\s\S]*?-->/g, '');
  for (const m of prose.matchAll(XREF_RE)) {
    const p = m[1].replace(/^\.\//, '');
    const target = [join(ROOT, 'docs', p), join(ROOT, p), resolve(dirname(abs), p)].find((c) => existsSync(c));
    if (!target) { fail(file, `reference "${m[1]} ${m[2]}" points to a document that does not exist (write the path relative to docs/, e.g. \`08-reliability/timeouts-retries.md\` R3)`); continue; }
    const have = new Set(rulesOf(target));
    for (const r of m[2].matchAll(/[RP]\d+/g)) {
      if (!have.has(r[0])) fail(file, `reference "${m[1]} ${r[0]}" names a rule that does not exist in ${rel(target)}`);
    }
  }
}

// 8. Check plugins: every scripts/checks/*.mjs (except *.test.mjs) is run as `node <file>` with the
//    project root as cwd. Exit 0 = pass. Non-zero = fail; each stdout line is one problem ("path: message").
const checksDir = join(ROOT, 'scripts', 'checks');
if (existsSync(checksDir)) {
  const plugins = walk(checksDir, (p) => p.endsWith('.mjs') && !p.endsWith('.test.mjs') && dirname(p) === checksDir).sort();
  for (const plugin of plugins) {
    const r = spawnSync(process.execPath, [plugin], { cwd: ROOT, encoding: 'utf8', timeout: 120000 });
    if (r.status === 0) continue;
    const lines = (r.stdout ?? '').split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length) failures.push(...lines);
    else {
      const why = (r.stderr ?? '').trim().split('\n')[0] || (r.error ? r.error.message : '');
      fail(rel(plugin), `check plugin exited with code ${r.status ?? 'none'} and printed no problems${why ? ` (${why})` : ''}`);
    }
  }
}

if (failures.length) {
  console.error(`check: ${failures.length} problem(s)\n`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log('check: ok');
