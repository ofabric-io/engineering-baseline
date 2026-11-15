#!/usr/bin/env node
// Baseline checks: everything CI and the git hooks run on docs, specs, ADRs and adapters.
// Usage: node scripts/check.mjs
import { existsSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  ROOT, walk, rel, read, frontmatter, stripNonProse, ruleIds, enforcementRows, sections,
  COMPONENT_KINDS, parseList, isTemplatePath, tableCells, linesWithContext,
} from './lib.mjs';

const failures = [];
const fail = (file, msg) => failures.push(`${file}: ${msg}`);

const STANDARD_STATUSES = ['not-started', 'proposed', 'in-progress', 'ratified', 'not-applicable'];
const SCOPE_TAG = /\s_\(applies to: ([^)]*)\)_$/;
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

  const isStandard = allowed === STANDARD_STATUSES;
  if (isStandard) {
    if (fm.status === 'not-applicable' && !fm.reason) {
      fail(file, 'is not-applicable but has no "reason:" line in its frontmatter; add "reason: <one line why no component of this project needs it>"');
    }
    if ('applies-to' in fm) {
      const kinds = parseList(fm['applies-to']);
      const bad = kinds.filter((k) => !COMPONENT_KINDS.includes(k));
      if (!kinds.length || bad.length) {
        fail(file, `frontmatter "applies-to:" ${bad.length ? `names unknown kind(s) ${bad.join(', ')}` : 'is empty'}; use kinds from ${COMPONENT_KINDS.join(', ')}, e.g. "applies-to: [service, daemon]"`);
      }
    }
    // Scope tags: a rule's first line may end with " _(applies to: kind, kind)_".
    for (const { line, n, section, fenced } of linesWithContext(text)) {
      if (fenced || section !== 'Rules' || !/^\s*(?:[-*]|\d+\.)\s+\*\*[RP]\d+\.\*\*/.test(line)) continue;
      if (!/\(applies to:/i.test(line)) continue;
      const m = line.match(SCOPE_TAG);
      if (!m) { fail(`${file}:${n}`, `malformed scope tag; end the rule's first line with exactly " _(applies to: service, daemon)_" (kinds: ${COMPONENT_KINDS.join(', ')})`); continue; }
      const kinds = m[1].split(',').map((k) => k.trim());
      const bad = kinds.filter((k) => !COMPONENT_KINDS.includes(k));
      if (bad.length) fail(`${file}:${n}`, `scope tag names unknown kind(s) ${bad.join(', ')}; the kinds are ${COMPONENT_KINDS.join(', ')}`);
    }
  }

  if (binding.includes(fm.status)) {
    const markers = stripNonProse(text).match(MARKER_RE);
    if (markers) fail(file, `is ${fm.status} but still has unresolved markers: ${[...new Set(markers)].join(', ')}`);
    if (fm.status === 'ratified') {
      if (!fm.owner || fm.owner === 'TBD') fail(file, 'is ratified but owner is TBD');
      if (!fm['last-reviewed'] || fm['last-reviewed'] === 'never') fail(file, 'is ratified but last-reviewed is never');
      // Open decisions: an unchecked bullet must be queued ("→ DECISION-QUEUE") or resolved.
      let bullet = null;
      const flush = () => {
        if (bullet && !/→\s*DECISION-QUEUE\.?$/.test(bullet.text.trim())) {
          fail(`${file}:${bullet.n}`, `is ratified but has an open decision not in the queue ("${bullet.text.trim().slice(0, 60)}…"); resolve it (tick the box), or end the bullet with "→ DECISION-QUEUE" and add it to docs/DECISION-QUEUE.md`);
        }
        bullet = null;
      };
      for (const { line, n, fenced } of linesWithContext(text.replace(/<!--[\s\S]*?-->/g, (c) => c.replace(/[^\n]/g, '')))) {
        if (fenced) continue;
        if (/^\s*[-*]\s+\[ \]/.test(line)) { flush(); bullet = { n, text: line }; }
        else if (bullet && /^\s+\S/.test(line)) bullet.text += ` ${line.trim()}`;
        else flush();
      }
      flush();
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
    // A term inside a hyphen- or underscore-joined compound is a different word: not matched.
    const re = new RegExp(`(?<![\\w-])(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})(?![\\w-])`, 'i');
    // Baseline machinery and templates are not project prose.
    const SKIPPED = [
      /^\.agents\//, /^bootstrap\//, /^\.baseline\//, /^BASELINE\.md$/, /^\.copier-answers\.yml$/,
      /^docs\/packs\/[^/]+\/PACK\.md$/, /^docs\/04-adr\/ADR-001-/, /^docs\/02-domain\/glossary\.md$/,
      /(^|\/)_template\.md$/, /-template\.md/,
      /^scripts\//, /^\.githooks\//, /^\.claude\//, /^\.cursor\//, /^\.github\//, /^\.gitlab\//, /^\.tmp\//,
    ];
    const allowFile = join(ROOT, '.baseline', 'forbidden-allow.txt');
    const allow = existsSync(allowFile)
      ? read(allowFile).split('\n').map((t) => t.trim()).filter((t) => t && !t.startsWith('#'))
      : [];
    const allowedPath = (file) => allow.some((a) => !a.startsWith('match:') && (a.endsWith('/*') ? file.startsWith(a.slice(0, -1)) : a === file));
    const allowedMatch = allow.filter((a) => a.startsWith('match:')).map((a) => a.slice(6));
    const hint = 'to allow it, add the path, "dir/*" or "match:<text of the line>" to .baseline/forbidden-allow.txt, or reword';
    const textFiles = walk(ROOT, (p) => /\.(md|ts|tsx|js|mjs|py|go|rs|java|kt|cs|json|ya?ml|sql|proto)$/.test(p));
    for (const abs of textFiles) {
      const file = rel(abs);
      if (SKIPPED.some((s) => s.test(file)) || allowedPath(file)) continue;
      const text = read(abs);
      const ctx = file.endsWith('.md') ? linesWithContext(text) : text.split('\n').map((line, i) => ({ line, n: i + 1, section: null, fenced: false }));
      for (const { line, n, section, fenced } of ctx) {
        let scan = line;
        // A Parameters table's Default and Trade-off columns describe the baseline, not the project.
        if (!fenced && section === 'Parameters') { const c = tableCells(line); if (c) scan = c.slice(0, 2).join(' | '); }
        const hit = scan.match(re);
        if (!hit || allowedMatch.some((a) => line.includes(a))) continue;
        fail(`${file}:${n}`, `uses forbidden term "${hit[1]}" (see docs/02-domain/glossary.md); ${hint}`);
      }
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
const byBase = new Map();
for (const [abs, file] of mdFiles) {
  if (isTemplateFile(file) || !(file.startsWith('docs/') || !file.includes('/'))) continue; // the project's documents only
  const b = file.split('/').pop();
  byBase.set(b, [...(byBase.get(b) ?? []), abs]);
}
for (const [abs, file] of mdFiles) {
  if (isTemplateFile(file)) continue;
  const prose = read(abs).replace(/```[\s\S]*?```/g, '').replace(/<!--[\s\S]*?-->/g, '');
  for (const m of prose.matchAll(XREF_RE)) {
    const p = m[1].replace(/^\.\//, '');
    let target;
    if (p.includes('/')) target = [join(ROOT, 'docs', p), join(ROOT, p), resolve(dirname(abs), p)].find((c) => existsSync(c));
    else {
      // A bare file name resolves only when exactly one document in the project has that name.
      const same = byBase.get(p) ?? [];
      if (same.length > 1) {
        fail(file, `reference "${m[1]} ${m[2]}" is ambiguous: ${same.length} documents are named ${p}; use the path relative to docs/ (${same.map((s) => `\`${rel(s).replace(/^docs\//, '')}\``).join(' or ')})`);
        continue;
      }
      target = same[0];
    }
    if (!target) { fail(file, `reference "${m[1]} ${m[2]}" points to a document that does not exist (write the path relative to docs/, e.g. \`08-reliability/timeouts-retries.md\` R3)`); continue; }
    const have = new Set(rulesOf(target));
    for (const r of m[2].matchAll(/[RP]\d+/g)) {
      if (!have.has(r[0])) fail(file, `reference "${m[1]} ${r[0]}" names a rule that does not exist in ${rel(target)}`);
    }
  }
}

// 7b. ADRs: the index lists every ADR file and nothing else; an accepted ADR is complete.
const adrDir = join(ROOT, 'docs', '04-adr');
if (existsSync(join(adrDir, 'README.md'))) {
  const adrFiles = readdirSync(adrDir).filter((n) => /^ADR-\d+.*\.md$/.test(n));
  const indexText = sections(read(join(adrDir, 'README.md'))).Index ?? '';
  const indexed = new Set([...indexText.matchAll(/\]\(([^)\s#]+\.md)(?:#[^)]*)?\)/g)].map((m) => m[1].split('/').pop()).filter((n) => /^ADR-\d+/.test(n)));
  for (const n of adrFiles) {
    if (!indexed.has(n)) fail('docs/04-adr/README.md', `the index does not list ${n}; add a row "| [ADR-NNN](${n}) | <title> | <status> | <date> |" to "## Index"`);
  }
  for (const n of indexed) {
    if (!adrFiles.includes(n)) fail('docs/04-adr/README.md', `the index lists ${n}, but docs/04-adr/${n} does not exist; remove the row or restore the file`);
  }
  for (const n of adrFiles) {
    const text = read(join(adrDir, n));
    const fm = frontmatter(text);
    if (fm?.status !== 'accepted') continue;
    const file = `docs/04-adr/${n}`;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fm.date ?? '')) fail(file, `is accepted but its date is "${fm.date ?? ''}"; set "date:" to the decision date as YYYY-MM-DD`);
    if (!parseList(fm.deciders).length) fail(file, 'is accepted but "deciders:" is empty; name who decided, e.g. "deciders: [Ada Lovelace]"');
    const secs = sections(text);
    for (const s of ['Context', 'Decision', 'Alternatives considered', 'Consequences', 'Compliance']) {
      if (!(s in secs) || !secs[s].trim()) fail(file, `is accepted but its "## ${s}" section is missing or empty`);
    }
  }
}

// 7c. Parameter names are unique across the project (delegated to params.mjs).
{
  const r = spawnSync(process.execPath, [join(ROOT, 'scripts', 'params.mjs'), '--duplicates'], { cwd: ROOT, encoding: 'utf8' });
  if (r.status !== 0) failures.push(...(r.stdout ?? '').split('\n').map((l) => l.trim()).filter(Boolean));
}

// 7d. The enforcement-debt table in docs/DECISION-QUEUE.md is generated; it must not be stale.
const queueFile = join(ROOT, 'docs', 'DECISION-QUEUE.md');
if (existsSync(queueFile) && read(queueFile).includes('<!-- debt:start -->')) {
  const r = spawnSync(process.execPath, [join(ROOT, 'scripts', 'queue.mjs'), '--check'], { cwd: ROOT, encoding: 'utf8' });
  if (r.status !== 0) failures.push(...(r.stdout + r.stderr).split('\n').map((l) => l.trim()).filter(Boolean));
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
