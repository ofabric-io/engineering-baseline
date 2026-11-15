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
  // Tracker and host combinations: which files exist must follow the answers.
  { name: 'clickup-gitlab', data: { tracker: 'clickup', git_host: 'gitlab', clickup_workspace_id: '123' },
    expectFiles: ['scripts/tracker/adapters/clickup.mjs', 'scripts/tracker/config.json', '.gitlab/merge_request_templates/Default.md'],
    expectAbsent: ['.github/pull_request_template.md', 'docs/17-specs/QUEUE.md', 'scripts/tracker/adapters/none.mjs'] },
  { name: 'github-issues-github', data: { tracker: 'github-issues', git_host: 'github' },
    expectFiles: ['scripts/tracker/adapters/github-issues.mjs', '.github/pull_request_template.md'],
    expectAbsent: ['scripts/tracker/adapters/none.mjs', 'docs/17-specs/QUEUE.md', 'scripts/tracker/config.json'] },
  { name: 'none-other', data: { tracker: 'none', git_host: 'other', ci: 'none' },
    expectFiles: ['docs/17-specs/QUEUE.md', 'scripts/tracker/adapters/none.mjs'],
    expectAbsent: ['.github/pull_request_template.md', '.gitlab/merge_request_templates/Default.md'],
    commands: [[['scripts/tracker/cli.mjs', 'next-number', '--kind', 'story'], /STORY-001/]] },
  // Each pack on its own (plus what it requires): a pack must not silently depend on another.
  ...ALL_PACKS.map((p) => ({
    name: `pack-${p}`,
    data: { packs: p === 'webhooks' ? ['events', 'webhooks'] : p === 'ledger' ? ['money', 'ledger'] : [p], tracker: 'none', ci: 'none' },
    quick: true,
  })),
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

  for (const f of s.expectFiles ?? []) record(`${s.name}: ${f} present`, existsSync(join(dst, f)));
  for (const f of s.expectAbsent ?? []) record(`${s.name}: ${f} absent`, !existsSync(join(dst, f)));
  for (const [cmd, expected] of s.commands ?? []) {
    const c = run('node', cmd, { cwd: dst });
    record(`${s.name}: node ${cmd.join(' ')}`, c.ok && expected.test(c.out), c.out);
  }
  if (s.quick) continue; // pack-alone scenarios only need to render and pass check.mjs

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
      (t) => `${t.replace(/^status: [\w-]+/m, 'status: ratified').replace(/^owner: .*/m, 'owner: someone').replace(/^last-reviewed: .*/m, 'last-reviewed: 2026-01-01')}\nAnswer: [[still_open]]\n`,
      /unresolved markers/],
    ['ratified document with owner TBD', 'docs/10-patterns/patterns.md',
      (t) => t.replace(/^status: [\w-]+/m, 'status: ratified').replace(/^owner: .*/m, 'owner: TBD').replace(/^last-reviewed: .*/m, 'last-reviewed: 2026-01-01'),
      /owner is TBD/],
    ['unknown status value', 'docs/14-git/git.md', (t) => t.replace(/^status: [\w-]+/m, 'status: done'), /is not one of/],
    ['broken relative link', 'docs/README.md', (t) => `${t}\n[gone](./does-not-exist.md)\n`, /broken link/],
    ['core document linking into a pack', 'docs/09-errors/taxonomy.md', (t) => `${t}\nSee [errors](../packs/http-api/responses-and-errors.md).\n`, /must not link into docs\/packs/],
    ['adapter holding rules', 'CLAUDE.md', (t) => `${t}${'- a rule that belongs in AGENTS.md\n'.repeat(20)}`, /holds at most/],
    ['adapter pointer deleted', 'GEMINI.md', null, /adapter is missing/],
    ['edited canonical skill without sync', '.agents/skills/new-adr/SKILL.md', (t) => t.replace('description: Write', 'description: Record'), /out of date/],
    ['forbidden glossary term in use', '.baseline/forbidden-terms.txt', () => 'outdatedterm\n', /forbidden term/, 'docs/02-domain/lifecycles.md', (t) => `${t}\nThe outdatedterm moves to closed.\n`],
    ['proposed document with no rules', 'docs/02-domain/time.md', (t) => setDoc(t, { status: 'proposed' }), /"## Rules" section has no rules/],
    ['rule missing from the Enforcement table', 'docs/02-domain/time.md',
      (t) => setDoc(t, { status: 'proposed', rules: '- **R1.** MUST a.\n- **R2.** MUST b.', enforcement: '| R1 | review | ❌ |' }), /R2 has no row in "## Enforcement"/],
    ['Enforcement row for a rule that does not exist', 'docs/02-domain/time.md',
      (t) => setDoc(t, { status: 'in-progress', rules: '- **R1.** MUST a.', enforcement: '| R1 | review | ❌ |\n| R4 | review | ⬜ |' }), /row for R4, which is not a rule/],
    ['Enforcement row without a status', 'docs/02-domain/time.md',
      (t) => setDoc(t, { status: 'proposed', rules: '- **R1.** MUST a.', enforcement: '| R1 | review | automated |' }), /row has no status/],
    ['duplicate rule number', 'docs/02-domain/time.md',
      (t) => setDoc(t, { status: 'proposed', rules: '- **R1.** MUST a.\n- **R1.** MUST b.', enforcement: '| R1 | review | ❌ |' }), /R1 is used more than once/],
    ['pack document held to the same rules', 'docs/packs/http-api/responses-and-errors.md', (t) => setDoc(t, { status: 'proposed' }), /"## Rules" section has no rules/],
    ['cross-reference to a rule that does not exist', 'docs/02-domain/time.md', (t) => setDoc(t, { status: 'proposed', rules: '- **R1.** MUST a.', enforcement: '| R1 | review | ❌ |' }),
      /names a rule that does not exist in docs\/02-domain\/time\.md/, 'docs/README.md', (t) => `${t}\nSee \`02-domain/time.md\` R7.\n`],
    ['cross-reference to a missing document', 'docs/README.md', (t) => `${t}\nSee \`02-domain/nowhere.md\` R1.\n`, /document that does not exist/],
    ['adapter with logic in its hook', '.claude/settings.json', (t) => t.replace('"command": "node', '"command": "echo inline logic && node'), /must only run/],
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
  extraChecks(dst);
}

// Rewrites a standards stub: status, and optionally its Rules and Enforcement bodies.
function setDoc(t, { status, rules = '', enforcement = '' }) {
  return t
    .replace(/^status: [\w-]+/m, `status: ${status}`)
    .replace(/## Rules[\s\S]*?(?=\n## Enforcement)/, `## Rules\n\n${rules}\n`)
    .replace(/## Enforcement[\s\S]*?(?=\n## AI guardrails)/, `## Enforcement\n\n| Rule | Mechanism | Status |\n| --- | --- | --- |\n${enforcement}\n`);
}

// A node process without a shell, so arguments with spaces and quotes arrive intact.
function node(args, opts = {}) {
  const r = spawnSync(process.execPath, args, { encoding: 'utf8', ...opts });
  return { code: r.status, out: `${r.stdout ?? ''}${r.stderr ?? ''}`.trim() };
}

// Positive and negative proofs for the rule checks, plugins, secret scan and guards.
function extraChecks(dst) {
  const check = () => run('node', ['scripts/check.mjs'], { cwd: dst });
  const withFile = (file, content, fn) => {
    const p = join(dst, file);
    const before = existsSync(p) ? readFileSync(p, 'utf8') : null;
    mkdirSync(join(p, '..'), { recursive: true });
    writeFileSync(p, content);
    try { return fn(); } finally { before === null ? rmSync(p, { force: true }) : writeFileSync(p, before); }
  };

  // Well-formed rules and a valid cross-reference pass.
  const time = join(dst, 'docs/02-domain/time.md');
  const timeBefore = readFileSync(time, 'utf8');
  writeFileSync(time, setDoc(timeBefore, { status: 'proposed', rules: '- **R1.** MUST a.\n- **R2.** MAY b.', enforcement: '| R1 | review | ❌ |\n| R2 | `scripts/check.mjs` | ✅ |' }));
  const goodRef = withFile('docs/README.md', `${readFileSync(join(dst, 'docs/README.md'), 'utf8')}\nSee \`02-domain/time.md\` R2.\n`, check);
  record('check.mjs accepts well-formed rules and a valid cross-reference', goodRef.ok, goodRef.out);
  writeFileSync(time, timeBefore);

  // Plugin runner: a failing plugin fails the check with its stdout lines; *.test.mjs is not a plugin.
  const failing = 'console.log("docs/x.md: planted plugin problem");\nconsole.log("docs/y.md: second problem");\nprocess.exit(1);\n';
  const planted = withFile('scripts/checks/zz-failing.mjs', failing, check);
  record('check.mjs rejects: a failing check plugin (each stdout line reported)', !planted.ok && /docs\/x\.md: planted plugin problem/.test(planted.out) && /docs\/y\.md: second problem/.test(planted.out), planted.out);
  const silent = withFile('scripts/checks/zz-silent.mjs', 'process.exit(3);\n', check);
  record('check.mjs rejects: a plugin that fails without output', !silent.ok && /exited with code 3/.test(silent.out), silent.out);
  const testFile = withFile('scripts/checks/zz.test.mjs', 'process.exit(1);\n', check);
  record('check.mjs ignores *.test.mjs files in scripts/checks/', testFile.ok, testFile.out);

  // Secret scan: a planted fake secret fails, an allowlist entry clears it, removal restores.
  const fakeKey = ['AKIA', 'ABCDEFGHIJKLMNOP'].join(''); // assembled so this file holds no secret literal
  const secret = withFile('docs/notes.md', `# Notes\n\naws key ${fakeKey}\n`, check);
  record('check.mjs rejects: a planted secret', !secret.ok && /docs\/notes\.md: line 3: possible secret/.test(secret.out) && !secret.out.includes(fakeKey), secret.out);
  const assign = withFile('config.yaml', 'database:\n  password: "Tr0ub4dor-and-3-more"\n', check);
  record('check.mjs rejects: a literal password assignment', !assign.ok && /config\.yaml: line 2: possible secret/.test(assign.out), assign.out);
  const placeholder = withFile('config.yaml', 'database:\n  password: "your-password-here"\n  api_key: "${API_KEY}"\n', check);
  record('check.mjs accepts placeholder credentials', placeholder.ok, placeholder.out);
  const allowed = withFile('docs/notes.md', `# Notes\n\naws key ${fakeKey}\n`, () =>
    withFile('.baseline/secrets-allowlist.txt', '# test fixture\ndocs/notes.md\n', check));
  record('check.mjs accepts a secret finding that is allowlisted', allowed.ok, allowed.out);

  // Staged mode (pre-commit): only the index is scanned.
  const repo = join(TMP, 'staged-repo');
  rmSync(repo, { recursive: true, force: true });
  mkdirSync(repo, { recursive: true });
  const script = join(dst, 'scripts/checks/secrets.mjs');
  const inRepo = (env) => node([script], { cwd: repo, env: { ...process.env, ...env } });
  spawnSync('git', ['init', '-q'], { cwd: repo });
  writeFileSync(join(repo, 'leak.txt'), `token ${fakeKey}\n`);
  writeFileSync(join(repo, 'ok.txt'), 'clean\n');
  spawnSync('git', ['add', 'ok.txt'], { cwd: repo });
  record('secret scan, staged mode: ignores an unstaged leak', inRepo({ BASELINE_STAGED: '1' }).code === 0);
  spawnSync('git', ['add', 'leak.txt'], { cwd: repo });
  const staged = inRepo({ BASELINE_STAGED: '1' });
  record('secret scan, staged mode: rejects a staged leak', staged.code === 1 && /leak\.txt: line 1: possible secret/.test(staged.out), staged.out);
  writeFileSync(join(repo, 'leak.txt'), 'fixed\n'); // unstaged fix: the index still holds the leak
  record('secret scan, staged mode: reads the index, not the working tree', inRepo({ BASELINE_STAGED: '1' }).code === 1);
  rmSync(repo, { recursive: true, force: true });

  // Guards: protected documents.
  const guardDoc = (path, opts) => node(['scripts/guards/protected-docs.mjs', path], { cwd: dst, ...opts });
  const adr = 'docs/04-adr/ADR-001-adopt-engineering-baseline.md';
  record('guard allows editing a proposed standard', guardDoc('docs/02-domain/time.md').code === 0);
  for (const [label, file, from, to] of [
    ['a ratified standard', 'docs/02-domain/time.md', /^status: [\w-]+/m, 'status: ratified'],
    ['an accepted ADR', adr, /^status: [\w-]+/m, 'status: accepted'],
  ]) {
    const r = withFile(file, readFileSync(join(dst, file), 'utf8').replace(from, to), () => guardDoc(file));
    record(`guard refuses ${label}`, r.code === 2 && /refused/.test(r.out), `exit ${r.code}: ${r.out}`);
    const viaStdin = withFile(file, readFileSync(join(dst, file), 'utf8').replace(from, to), () =>
      guardDoc('--stdin', { input: JSON.stringify({ tool_name: 'Edit', tool_input: { file_path: join(dst, file) } }) }));
    record(`guard refuses ${label} (tool-hook payload on stdin)`, viaStdin.code === 2, `exit ${viaStdin.code}: ${viaStdin.out}`);
  }
  record('guard allows a document again after restoring', guardDoc('docs/02-domain/time.md').code === 0);

  // Guards: commands.
  const guardCmd = (cmd) => node(['scripts/guards/command.mjs', cmd], { cwd: dst });
  const refused = [
    ['--no-verify', 'git commit --no-verify -m "x"'],
    ['commit -n', 'git commit -n -m x'],
    ['force-push to main', 'git push --force origin main'],
    ['force-push (+refspec) to master', 'git push origin +master'],
    ['reset --hard', 'git reset --hard HEAD~1'],
    ['clean -fd', 'git clean -fd'],
    ['discarding all changes', 'git checkout .'],
    ['--no-verify after &&', 'git add -A && git commit -m "x" --no-verify'],
  ];
  for (const [label, cmd] of refused) {
    const r = guardCmd(cmd);
    record(`command guard refuses ${label}`, r.code === 2 && /refused/.test(r.out), `exit ${r.code}: ${r.out}`);
  }
  const viaStdin = node(['scripts/guards/command.mjs', '--stdin'], { cwd: dst, input: JSON.stringify({ tool_input: { command: 'git commit --no-verify -m x' } }) });
  record('command guard refuses --no-verify (tool-hook payload on stdin)', viaStdin.code === 2, viaStdin.out);
  for (const cmd of ['git commit -m "mentions --no-verify and git reset --hard in prose"', 'git push --force-with-lease origin feat/x', 'git push origin main', 'git status && git diff', 'git checkout -b feat/x']) {
    const r = guardCmd(cmd);
    record(`command guard allows: ${cmd}`, r.code === 0, `exit ${r.code}: ${r.out}`);
  }
}

if (!KEEP) rmSync(TMP, { recursive: true, force: true });

let failed = 0;
for (const r of results) {
  console.log(`${r.ok ? '✓' : '✗'} ${r.scenario}`);
  if (!r.ok) { failed++; if (r.detail) console.log(r.detail.split('\n').map((l) => `    ${l}`).join('\n')); }
}
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
