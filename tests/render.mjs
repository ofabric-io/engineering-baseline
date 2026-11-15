#!/usr/bin/env node
// Renders sample projects from this template and runs their checks.
//   node tests/render.mjs            run every scenario
//   node tests/render.mjs --keep     keep rendered projects in .tmp/ for inspection
//
// Requires uv (for `uvx copier`) or copier on PATH, and Node 20+.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const TMP = join(ROOT, '.tmp');
const KEEP = process.argv.includes('--keep');
const ALL_PACKS = ['http-api', 'events', 'webhooks', 'money', 'ledger', 'multi-tenant', 'audit-trail', 'user-interface'];

const scenarios = [
  { name: 'minimal', data: { packs: [], tracker: 'none', ci: 'none' } },
  { name: 'defaults', data: {} },
  { name: 'everything', data: { packs: ALL_PACKS, tracker: 'github-issues', ci: 'github-actions' } },
  { name: 'missing-requirement', data: { packs: ['webhooks'] }, expectFailure: /requires the events pack/ },
];

const copier = spawnSync('copier', ['--version'], { shell: true }).status === 0 ? ['copier'] : ['uvx', 'copier'];

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', shell: process.platform === 'win32', ...opts });
  return { ok: r.status === 0, out: `${r.stdout ?? ''}${r.stderr ?? ''}`.trim() };
}

function walk(dir, acc = []) {
  for (const n of readdirSync(dir)) {
    if (n === '.git') continue;
    const p = join(dir, n);
    statSync(p).isDirectory() ? walk(p, acc) : acc.push(p);
  }
  return acc;
}

function leftoverTerms() {
  const files = ['leftover-terms.txt', 'leftover-terms.local.txt'].map((f) => join(ROOT, 'tests', f)).filter(existsSync);
  return files.flatMap((f) => readFileSync(f, 'utf8').split(/\r?\n/)).map((t) => t.trim()).filter((t) => t && !t.startsWith('#'));
}

function leftoverScan(dir, label) {
  const terms = leftoverTerms();
  if (!terms.length) return [];
  const re = new RegExp(`(?<![\\w-])(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})(?![\\w-])`, 'i');
  const hits = [];
  for (const f of walk(dir)) {
    const lines = readFileSync(f, 'utf8').split(/\r?\n/);
    lines.forEach((line, i) => {
      const m = line.match(re);
      if (m) hits.push(`${label}/${relative(dir, f).split(sep).join('/')}:${i + 1} contains "${m[1]}"`);
    });
  }
  return hits;
}

const results = [];
const record = (scenario, ok, detail = '') => results.push({ scenario, ok, detail });

// Self-check: the scan must be able to find something, or a clean result proves nothing.
{
  const probe = join(TMP, 'probe');
  mkdirSync(probe, { recursive: true });
  writeFileSync(join(probe, 'x.md'), `${leftoverTerms()[0] ?? ''}\n`);
  record('leftover-scan detects a known term', leftoverScan(probe, 'probe').length === 1);
  rmSync(probe, { recursive: true, force: true });
}

const templateHits = leftoverScan(join(ROOT, 'template'), 'template');
record('template/ has no leftover terms', templateHits.length === 0, templateHits.join('\n'));

for (const s of scenarios) {
  const dst = join(TMP, s.name);
  rmSync(dst, { recursive: true, force: true });
  const data = { project_name: `Sample ${s.name}`, project_description: 'A sample project rendered by the baseline tests.', ...s.data };
  // HEAD includes uncommitted changes (Copier copies a dirty local template as-is).
  const hasCommit = run('git', ['rev-parse', '--verify', 'HEAD'], { cwd: ROOT }).ok;
  const args = ['copy', '--defaults', '--overwrite', '--quiet', ...(hasCommit ? ['--vcs-ref', 'HEAD'] : [])];
  for (const [k, v] of Object.entries(data)) args.push('--data', `${k}=${JSON.stringify(v)}`);
  args.push(ROOT, dst);
  const r = run(copier[0], [...copier.slice(1), ...args]);

  if (s.expectFailure) {
    record(`${s.name}: rejected`, !r.ok && s.expectFailure.test(r.out), r.ok ? 'rendered, but should have been rejected' : r.out.split('\n').slice(-3).join('\n'));
    continue;
  }
  if (!r.ok) { record(`${s.name}: renders`, false, r.out); continue; }
  record(`${s.name}: renders`, true);

  const packs = data.packs ?? [];
  for (const p of ALL_PACKS) {
    const present = existsSync(join(dst, 'docs', 'packs', p, 'PACK.md'));
    if (present !== packs.includes(p)) record(`${s.name}: pack ${p} ${packs.includes(p) ? 'present' : 'absent'}`, false);
  }
  for (const f of ['CLAUDE.md', 'GEMINI.md', '.github/copilot-instructions.md', '.cursor/rules/agents.mdc']) {
    if (!existsSync(join(dst, f))) record(`${s.name}: adapter ${f} present`, false);
  }
  const unrendered = walk(dst).filter((f) => /\{%|\{\{/.test(relative(dst, f)));
  record(`${s.name}: no unrendered file names`, unrendered.length === 0, unrendered.join('\n'));

  const sync = run('node', ['scripts/sync-adapters.mjs'], { cwd: dst });
  record(`${s.name}: sync-adapters`, sync.ok, sync.out);
  const check = run('node', ['scripts/check.mjs'], { cwd: dst });
  record(`${s.name}: check.mjs passes`, check.ok, check.out);

  const msgFile = join(dst, '.tmp-msg');
  writeFileSync(msgFile, 'feat(docs): add the first standard\n');
  record(`${s.name}: commit-msg accepts a good subject`, run('node', ['.githooks/commit-msg.mjs', msgFile], { cwd: dst }).ok);
  writeFileSync(msgFile, 'added stuff\n');
  record(`${s.name}: commit-msg rejects a bad subject`, !run('node', ['.githooks/commit-msg.mjs', msgFile], { cwd: dst }).ok);
  rmSync(msgFile);

  const hits = leftoverScan(dst, s.name);
  record(`${s.name}: no leftover terms`, hits.length === 0, hits.join('\n'));

  if (s.name === 'everything') negativeChecks(dst);
}

// Each check must be seen to fail on a known-bad input; a check that never fails proves nothing.
function negativeChecks(dst) {
  const cases = [
    ['ratified document with an unresolved parameter', 'docs/02-domain/time.md',
      (t) => t.replace('status: not-started', 'status: ratified').replace('owner: TBD', 'owner: someone').replace('last-reviewed: never', 'last-reviewed: 2026-01-01'),
      /unresolved markers/],
    ['ratified document with owner TBD', 'docs/10-patterns/patterns.md',
      (t) => t.replace('status: not-started', 'status: ratified').replace('last-reviewed: never', 'last-reviewed: 2026-01-01'),
      /owner is TBD/],
    ['unknown status value', 'docs/14-git/git.md', (t) => t.replace('status: not-started', 'status: done'), /is not one of/],
    ['broken relative link', 'docs/README.md', (t) => `${t}\n[gone](./does-not-exist.md)\n`, /broken link/],
    ['core document linking into a pack', 'docs/09-errors/taxonomy.md', (t) => `${t}\nSee [errors](../packs/http-api/responses-and-errors.md).\n`, /must not link into docs\/packs/],
    ['adapter holding rules', 'CLAUDE.md', (t) => `${t}${'- a rule that belongs in AGENTS.md\n'.repeat(20)}`, /holds at most/],
    ['adapter pointer deleted', 'GEMINI.md', null, /adapter is missing/],
    ['edited canonical skill without sync', '.agents/skills/new-adr/SKILL.md', (t) => t.replace('description: Write', 'description: Record'), /out of date/],
    ['forbidden glossary term in use', '.baseline/forbidden-terms.txt', () => 'outdatedterm\n', /forbidden term/, 'docs/02-domain/lifecycles.md', (t) => `${t}\nThe outdatedterm moves to closed.\n`],
  ];
  for (const [label, file, mutate, expected, file2, mutate2] of cases) {
    const edits = [[file, mutate], ...(file2 ? [[file2, mutate2]] : [])].map(([f, m]) => {
      const p = join(dst, f);
      const before = existsSync(p) ? readFileSync(p, 'utf8') : null;
      m === null ? rmSync(p) : writeFileSync(p, m(before ?? ''));
      return [p, before];
    });
    const r = run('node', ['scripts/check.mjs'], { cwd: dst });
    record(`check.mjs rejects: ${label}`, !r.ok && expected.test(r.out), r.ok ? 'check passed but should have failed' : r.out);
    for (const [p, before] of edits) before === null ? rmSync(p) : writeFileSync(p, before);
  }
  record('check.mjs passes again after restoring', run('node', ['scripts/check.mjs'], { cwd: dst }).ok);
}

if (!KEEP) rmSync(TMP, { recursive: true, force: true });

let failed = 0;
for (const r of results) {
  console.log(`${r.ok ? '✓' : '✗'} ${r.scenario}`);
  if (!r.ok) { failed++; if (r.detail) console.log(r.detail.split('\n').map((l) => `    ${l}`).join('\n')); }
}
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
