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
// Mutation tests rewrite this copy of time.md, never a document other documents cite.
const FIXTURE_DOC = 'docs/02-domain/zz-test-fixture.md';
const ALL_PACKS = ['http-api', 'events', 'webhooks', 'money', 'ledger', 'multi-tenant', 'audit-trail', 'user-interface', 'web-ui', 'cli', 'data-store', 'domain-model'];
// Packs are written by different hands in parallel: assert a pack's presence only when its template
// folder exists. TODO(integrator): once all pack folders are merged, drop this and assert every pack.
const packFolderExists = (p) => existsSync(join(ROOT, 'template', 'docs', 'packs', `{% if '${p}' in packs %}${p}{% endif %}`));
const REQUIRES = { webhooks: ['events'], ledger: ['money', 'events'], 'web-ui': ['user-interface'] };

const scenarios = [
  { name: 'minimal', data: { packs: [], tracker: 'none', ci: 'none' } },
  { name: 'defaults', data: {} },
  { name: 'everything', data: { packs: ALL_PACKS, tracker: 'github-issues', ci: 'github-actions' } },
  { name: 'missing-requirement', data: { packs: ['webhooks'] }, expectFailure: /requires the events pack/ },
  { name: 'missing-requirement-web-ui', data: { packs: ['web-ui'] }, expectFailure: /requires the user-interface pack/ },
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
  // The tracker is unreachable (no token): next-number falls back to the specs and says so.
  { name: 'clickup-offline', data: { tracker: 'clickup', clickup_workspace_id: '123', ci: 'none' }, quick: true,
    commands: [[['scripts/tracker/cli.mjs', 'next-number', '--kind', 'story'], /^(?=[\s\S]*STORY-001)[\s\S]*offline answer — verify against the tracker before using it/]] },
  // Each pack on its own (plus what it requires): a pack must not silently depend on another.
  ...ALL_PACKS.map((p) => ({
    name: `pack-${p}`,
    data: { packs: [...(REQUIRES[p] ?? []), p], tracker: 'none', ci: 'none' },
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
    if (packs.includes(p) && !packFolderExists(p)) continue;
    if (present !== packs.includes(p)) record(`${s.name}: pack ${p} ${packs.includes(p) ? 'present' : 'absent'}`, false);
  }
  for (const f of ['CLAUDE.md', 'GEMINI.md', '.github/copilot-instructions.md', '.cursor/rules/agents.mdc']) {
    if (!existsSync(join(dst, f))) record(`${s.name}: adapter ${f} present`, false);
  }
  // docs/packs is exempt: it exists (empty) when no pack is chosen. TODO(integrator): rename the folder
  // to "{% if packs %}packs{% endif %}" once every wave-2 branch has merged, then drop the exemption.
  const emptyDirs = [];
  const findEmpty = (d) => { const names = readdirSync(d).filter((n) => n !== '.git'); if (!names.length && d !== dst && relative(dst, d) !== join('docs', 'packs')) emptyDirs.push(relative(dst, d)); for (const n of names) { const p = join(d, n); if (statSync(p).isDirectory()) findEmpty(p); } };
  findEmpty(dst);
  record(`${s.name}: no empty directories`, emptyDirs.length === 0, emptyDirs.join('\n'));
  const unrendered = walk(dst).filter((f) => /\{%|\{\{/.test(relative(dst, f)));
  record(`${s.name}: no unrendered file names`, unrendered.length === 0, unrendered.join('\n'));

  const pipeline = join(dst, 'docs/15-delivery/pipeline-and-gates.md');
  const ciNone = (data.ci ?? 'github-actions') === 'none';
  const pipelineText = existsSync(pipeline) ? readFileSync(pipeline, 'utf8') : '';
  record(`${s.name}: ci_system default follows the ci answer`, ciNone ? /\| `ci_system` \| \[\[ci_system\]\] \| none yet/.test(pipelineText) : /\| `ci_system` \| \[\[ci_system\]\] \| the CI service chosen when the project was generated \(github-actions\)/.test(pipelineText));
  const sync = run('node', ['scripts/sync-adapters.mjs'], { cwd: dst });
  record(`${s.name}: sync-adapters`, sync.ok, sync.out);
  const check = run('node', ['scripts/check.mjs'], { cwd: dst });
  record(`${s.name}: check.mjs passes`, check.ok, check.out);
  const rec = run('node', ['scripts/recommend.mjs', '--json'], { cwd: dst });
  let recRows = null;
  try { recRows = JSON.parse(rec.out); } catch { /* reported below */ }
  record(`${s.name}: recommend.mjs maps every questionnaire row to existing documents and parameters`, rec.ok && Array.isArray(recRows) && recRows.length > 0, rec.out.slice(0, 600));

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

  if (s.name === 'everything') recommendChecks(dst);
  if (s.name === 'everything') designMdChecks(dst);
  if (s.name === 'everything') {
    const fixture = join(dst, FIXTURE_DOC);
    writeFileSync(fixture, readFileSync(join(dst, 'docs/02-domain/time.md'), 'utf8')
      .replace(/^# .*$/m, '# Test fixture')
      .replace(/^\| `([\w-]+)` \|/gm, '| `fixture_$1` |')); // parameter names are unique per project
    negativeChecks(dst);
    rmSync(fixture, { force: true });
  }
}

// The recommendation sheet: generation, completeness check, merge on re-run, answered ids, and the
// questionnaire-to-documents mapping failing on drift.
function recommendChecks(dst) {
  const rec = (...a) => run('node', ['scripts/recommend.mjs', ...a], { cwd: dst });
  const sheet = join(dst, '.baseline/recommendations.md');
  const edit = (file, mutate, fn) => {
    const p = join(dst, file);
    const prior = existsSync(p) ? readFileSync(p, 'utf8') : null;
    writeFileSync(p, mutate(prior ?? ''));
    try { return fn(); } finally { prior === null ? rmSync(p, { force: true }) : writeFileSync(p, prior); }
  };
  try {
    const w = rec();
    record('recommend.mjs writes the sheet with derived and ask rows', w.ok && existsSync(sheet) && /\d+ derived/.test(w.out) && /\d+ ask/.test(w.out), w.out);
    const text = existsSync(sheet) ? readFileSync(sheet, 'utf8') : '';
    const hasRow = (id) => text.split('\n').some((l) => l.startsWith(`| ${id} |`));
    record('the sheet leaves out the brief (0.1) and 0.6, and lists headline and bulk rows',
      !hasRow('0.1') && !hasRow('0.6') && hasRow('1.3') && hasRow('4.2/06-security/sensitive-data.md/data_classes'), text.slice(0, 400));
    const fresh = rec('--check');
    record('recommend.mjs --check fails while a derived row has no recommendation', !fresh.ok && /2\.6: Source is derived but Recommended is empty/.test(fresh.out), fresh.out);

    // Fill every derived row, as the bootstrap would.
    writeFileSync(sheet, text.split('\n').map((l) => (/ \|  \| derived \| /.test(l) ? l.replace(' |  | derived | ', ' | a recommendation | derived | ') : l)).join('\n'));
    const filled = rec('--check');
    record('recommend.mjs --check passes once every row is complete', filled.ok && /ok — \d+ open decision/.test(filled.out), filled.out);
    const again = rec();
    const kept = rec('--check');
    record('re-running recommend.mjs keeps filled rows', again.ok && kept.ok, `${again.out}\n${kept.out}`);

    // Rewrites the Recommended, Source and Why cells of row 1.3.
    const row13 = (recommended, source, why) => (t) => t.split('\n').map((l) => {
      if (!l.startsWith('| 1.3 |')) return l;
      const c = l.split(' | ');
      return [c[0], c[1], recommended ?? c[2], source, `${why} |`].join(' | ');
    }).join('\n');
    const noWhy = edit('.baseline/recommendations.md', row13('availability first', 'brief', ''), () => rec('--check'));
    record('recommend.mjs --check fails on a brief row with no quote from the brief', !noWhy.ok && /1\.3: Source is brief but Why is empty/.test(noWhy.out), noWhy.out);
    const badSource = edit('.baseline/recommendations.md', row13(null, 'guess', ''), () => rec('--check'));
    record('recommend.mjs --check fails on an unknown source', !badSource.ok && /1\.3: Source "guess"/.test(badSource.out), badSource.out);

    const answeredYaml = [
      'answers:',
      '  "1.3": { answer: default, source: default, decided: 2026-01-01, adr: null }',
      '  1.8/01-business/availability.md/slo_exhaustion_response: { answer: default, source: default, decided: 2026-01-01, adr: null }',
    ].join('\n');
    const answered = edit('.baseline/answers.yaml', (t) => t.replace('answers: {}', answeredYaml), () => rec('--json'));
    let byId = new Map();
    try { byId = new Map(JSON.parse(answered.out).map((r) => [r.id, r])); } catch { /* reported below */ }
    record('recommend.mjs marks ids answered in answers.yaml, and only those',
      answered.ok && byId.get('1.3')?.answered === true && byId.get('1.8/01-business/availability.md/slo_exhaustion_response')?.answered === true && byId.get('1.4')?.answered === false, answered.out.slice(0, 400));
    record('the sheet lists each document\'s open decisions, defaulting to later',
      [...byId.values()].some((r) => r.kind === 'open' && r.id === '2.5/02-domain/time.md/open-1' && r.recommended === 'later' && r.source === 'default'), answered.out.slice(0, 400));

    const drift = edit('bootstrap/questionnaire.md', (t) => t.replace('`priority_order` |', '`priority_ordr` |'), () => rec('--json'));
    record('recommend.mjs fails when the questionnaire names a parameter that does not exist', !drift.ok && /names parameter `priority_ordr`/.test(drift.out), drift.out);
    const orphan = edit('docs/02-domain/zz-orphan.md', () => readFileSync(join(dst, 'docs/02-domain/time.md'), 'utf8').replace(/^\| `([\w-]+)` \|/gm, '| `orphan_$1` |'), () => rec('--json'));
    record('recommend.mjs fails when a document with open parameters is offered by no question', !orphan.ok && /no question offers docs\/02-domain\/zz-orphan\.md/.test(orphan.out), orphan.out);
    const kindsRows = (...a) => { try { return new Map(JSON.parse(rec('--json', ...a).out).map((r) => [r.id, r])); } catch { return new Map(); } };
    const plain = kindsRows();
    const cliLib = kindsRows('--kinds', 'cli,library');
    const svc = kindsRows('--kinds', 'service');
    const drain = '4.3/07-observability/health.md/drain_timeout';
    const slo = '1.8/01-business/availability.md/slo_exhaustion_response';
    record('recommend.mjs --kinds marks n/a a document whose applies-to names none of the kinds',
      plain.get(drain)?.source === 'default' && cliLib.get(drain)?.source === 'n/a' && /applies to service, daemon/.test(cliLib.get(drain)?.why ?? '') && svc.get(drain)?.source === 'default',
      JSON.stringify([plain.get(drain), cliLib.get(drain), svc.get(drain)]).slice(0, 600));
    record('recommend.mjs --kinds marks n/a a parameter whose every citing rule is scoped to absent kinds',
      plain.get(slo)?.source === 'default' && cliLib.get(slo)?.source === 'n/a' && svc.get(slo)?.source === 'default',
      JSON.stringify([plain.get(slo), cliLib.get(slo)]).slice(0, 600));
    const withSheet = run('node', ['scripts/check.mjs'], { cwd: dst });
    record('check.mjs passes with a recommendation sheet present', withSheet.ok, withSheet.out);
    applyChecks(dst);
  } finally {
    rmSync(sheet, { force: true });
  }
}

// DESIGN.md is generated from the DTCG token source; the plugin fails on drift; the contrast
// plugin resolves aliases into a separate primitives file.
function designMdChecks(dst) {
  const node = (...a) => run('node', a, { cwd: dst });
  const ui = join(dst, '.baseline/ui.json');
  const designMd = join(dst, 'DESIGN.md');
  const tokensDir = join(dst, 'design-test-tokens');
  try {
    mkdirSync(tokensDir, { recursive: true });
    writeFileSync(join(tokensDir, 'primitives.json'), JSON.stringify({
      palette: { $type: 'color', ink: { $value: '#111827' }, paper: { $value: '#f9fafb' }, blue: { $value: '#1d4ed8' }, sky: { $value: '#93c5fd' } },
      size: { $type: 'dimension', 4: { $value: { value: 4, unit: 'px' } }, 8: { $value: { value: 8, unit: 'px' } } },
    }));
    const theme = (bg, fg, action) => JSON.stringify({
      color: { $type: 'color', surface: { $value: bg }, text: { $value: fg }, action: { primary: { $value: action } } },
      radius: { $type: 'dimension', md: { $value: '{size.4}' } },
      space: { $type: 'dimension', md: { $value: '{size.8}' } },
      font: { body: { $type: 'typography', $value: { fontFamily: ['Inter', 'sans-serif'], fontSize: { value: 1, unit: 'rem' }, fontWeight: 400, lineHeight: 1.5 } } },
    });
    writeFileSync(join(tokensDir, 'light.json'), theme('{palette.paper}', '{palette.ink}', '{palette.blue}'));
    writeFileSync(join(tokensDir, 'dark.json'), theme('{palette.ink}', '{palette.paper}', '{palette.sky}'));
    const config = {
      tokens: { light: 'design-test-tokens/light.json', dark: 'design-test-tokens/dark.json' },
      primitives: 'design-test-tokens/primitives.json',
      contrastPairs: [['color.text', 'color.surface']],
      designMd: { primary: 'color.action.primary' },
    };
    writeFileSync(ui, JSON.stringify(config));

    const missing = node('scripts/check.mjs');
    record('check.mjs requires DESIGN.md once token files are configured', !missing.ok && /DESIGN\.md: missing; run node scripts\/design-md\.mjs/.test(missing.out), missing.out);
    record('ui-token-contrast resolves aliases into the primitives file', !/does not exist/.test(missing.out), missing.out);
    const gen = node('scripts/design-md.mjs');
    const text = existsSync(designMd) ? readFileSync(designMd, 'utf8') : '';
    record('design-md.mjs writes DESIGN.md with the DESIGN.md front matter',
      gen.ok && /^---\nversion: "alpha"\nname: "Sample everything"/.test(text) && /\n  primary: "#1d4ed8"/.test(text) && /\n  text: "#111827"/.test(text)
      && /\n  radius-md: "4px"/.test(text) && /\n  space-md: "8px"/.test(text) && /fontFamily: "Inter"/.test(text), text.slice(0, 600));
    record('DESIGN.md has the format\'s sections in order',
      ['## Overview', '## Colors', '## Typography', '## Layout', '## Elevation & Depth', '## Shapes', '## Components', "## Do's and Don'ts"].every((h, i, a) => text.indexOf(h) >= 0 && (i === 0 || text.indexOf(h) > text.indexOf(a[i - 1]))), text.slice(0, 300));
    record('DESIGN.md lists every theme\'s colours', /\| `action-primary` \| `color\.action\.primary` \| #1d4ed8 \| #93c5fd \|/.test(text), text);
    const fresh = node('scripts/check.mjs');
    record('check.mjs accepts a freshly generated DESIGN.md', fresh.ok, fresh.out);
    writeFileSync(designMd, text.replace('#1d4ed8', '#000000'));
    const edited = node('scripts/check.mjs');
    record('check.mjs refuses a hand-edited DESIGN.md', !edited.ok && /DESIGN\.md: out of date/.test(edited.out), edited.out);
    writeFileSync(ui, JSON.stringify({ ...config, designMd: { enabled: false } }));
    rmSync(designMd, { force: true });
    const off = node('scripts/check.mjs');
    record('designMd.enabled false turns DESIGN.md off', off.ok, off.out);
  } finally {
    rmSync(ui, { force: true });
    rmSync(designMd, { force: true });
    rmSync(tokensDir, { recursive: true, force: true });
  }
}

// apply-answers.mjs fills cells and queues open decisions; ratify.mjs ratifies; check.mjs then
// accepts the document and refuses it once its queue row is gone; queue.mjs drops rows scoped to
// kinds the project lacks.
function applyChecks(dst) {
  const touched = ['.baseline/answers.yaml', 'docs/02-domain/time.md', 'docs/01-business/principles.md', 'docs/DECISION-QUEUE.md', 'docs/03-architecture/system.md'];
  const saved = touched.map((f) => [join(dst, f), readFileSync(join(dst, f), 'utf8')]);
  const node = (...a) => run('node', a, { cwd: dst });
  try {
    const entries = [
      '"2.5": { answer: default, source: default, decided: 2026-01-01, adr: null }',
      '2.5/02-domain/time.md/instant_precision: { answer: default, source: default, decided: 2026-01-01, adr: null }',
      '2.5/02-domain/time.md/clock_source: { answer: "an injected clock, always", source: user, decided: 2026-01-01, adr: null }',
      '2.5/02-domain/time.md/open-1: { answer: later, source: default, decided: 2026-01-01, adr: null }',
      '"1.3": { answer: "security > correctness, as a test", source: user, decided: 2026-01-01, adr: null }',
    ].map((e) => `  ${e}`).join('\n');
    const answersPath = join(dst, '.baseline/answers.yaml');
    writeFileSync(answersPath, readFileSync(answersPath, 'utf8').replace('answers: {}', `answers:\n${entries}`));

    const dry = node('scripts/apply-answers.mjs', '--dry-run');
    const timeBefore = readFileSync(join(dst, 'docs/02-domain/time.md'), 'utf8');
    record('apply-answers.mjs --dry-run reports changes and writes nothing', dry.ok && /would change docs\/02-domain\/time\.md: clock_source/.test(dry.out) && timeBefore.includes('[[clock_source]]'), dry.out);
    const applied = node('scripts/apply-answers.mjs');
    const time = readFileSync(join(dst, 'docs/02-domain/time.md'), 'utf8');
    const queue = readFileSync(join(dst, 'docs/DECISION-QUEUE.md'), 'utf8');
    record('apply-answers.mjs fills parameter cells (default stays the word default)',
      applied.ok && /\| `business_time_zone` \| default \|/.test(time) && /\| `clock_source` \| an injected clock, always \|/.test(time)
      && /\| `priority_order` \| security > correctness, as a test \|/.test(readFileSync(join(dst, 'docs/01-business/principles.md'), 'utf8')), applied.out);
    record('apply-answers.mjs queues a later open decision and numbers its queue row',
      /→ DECISION-QUEUE\s*$/m.test(time.split('## Rules')[0]) && /^\| D1 \| .* \| `02-domain\/time\.md` \(2\.5\/02-domain\/time\.md\/open-1\) \| no \|/m.test(queue), queue.split('## Enforcement')[0].slice(-600));
    const again = node('scripts/apply-answers.mjs');
    record('apply-answers.mjs is idempotent', again.ok && /0 change\(s\)/.test(again.out), again.out);

    const ratified = node('scripts/ratify.mjs', '--owner', 'tester', 'docs/02-domain/time.md');
    const timeR = readFileSync(join(dst, 'docs/02-domain/time.md'), 'utf8');
    const board = readFileSync(join(dst, 'docs/DECISION-QUEUE.md'), 'utf8');
    record('ratify.mjs sets status, owner and date, ticks the Ratify bullet and fills the status board',
      ratified.ok && /^status: ratified$/m.test(timeR) && /^owner: tester$/m.test(timeR) && /^- \[x\] Ratify this document/m.test(timeR) && /^\| `02-domain\/time\.md` \| ratified \| tester \|/m.test(board) && !/_Filled in by the bootstrap\._/.test(board), ratified.out);
    const ok = node('scripts/check.mjs');
    record('check.mjs accepts the ratified document with its open decision queued', ok.ok, ok.out);
    writeFileSync(join(dst, 'docs/DECISION-QUEUE.md'), board.replace(/^\| D1 .*\n/m, ''));
    const noRow = node('scripts/check.mjs');
    record('check.mjs refuses a queued open decision with no Deferred decisions row', !noRow.ok && /queues an open decision, but docs\/DECISION-QUEUE\.md/.test(noRow.out), noRow.out);
    writeFileSync(join(dst, 'docs/DECISION-QUEUE.md'), board);

    // Debt rows for rules scoped to kinds the project lacks disappear once the kinds are known.
    const count = () => (readFileSync(join(dst, 'docs/DECISION-QUEUE.md'), 'utf8').match(/^\| `[^`]+` \| [RP]\d/gm) ?? []).length;
    node('scripts/queue.mjs');
    const all = count();
    const sys = join(dst, 'docs/03-architecture/system.md');
    writeFileSync(sys, readFileSync(sys, 'utf8').replace(/^\| `component_kinds` \| \[\[component_kinds\]\] \|/m, '| `component_kinds` | library |'));
    const q = node('scripts/queue.mjs');
    record('queue.mjs leaves out debt rows scoped only to kinds the project lacks', q.ok && count() > 0 && count() < all, `${all} -> ${count()}\n${q.out}`);
  } finally {
    for (const [p, t] of saved) writeFileSync(p, t); // restores DECISION-QUEUE.md to never-generated
  }
}

// Each check must be seen to fail on a known-bad input; a check that never fails proves nothing.
function negativeChecks(dst) {
  const cases = [
    ['ratified document with an unresolved parameter', FIXTURE_DOC,
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
    ['proposed document with no rules', FIXTURE_DOC, (t) => setDoc(t, { status: 'proposed' }), /"## Rules" section has no rules/],
    ['rule missing from the Enforcement table', FIXTURE_DOC,
      (t) => setDoc(t, { status: 'proposed', rules: '- **R1.** MUST a.\n- **R2.** MUST b.', enforcement: '| R1 | review | ❌ |' }), /R2 has no row in "## Enforcement"/],
    ['Enforcement row for a rule that does not exist', FIXTURE_DOC,
      (t) => setDoc(t, { status: 'in-progress', rules: '- **R1.** MUST a.', enforcement: '| R1 | review | ❌ |\n| R4 | review | ⬜ |' }), /row for R4, which is not a rule/],
    ['Enforcement row without a status', FIXTURE_DOC,
      (t) => setDoc(t, { status: 'proposed', rules: '- **R1.** MUST a.', enforcement: '| R1 | review | automated |' }), /row has no status/],
    ['duplicate rule number', FIXTURE_DOC,
      (t) => setDoc(t, { status: 'proposed', rules: '- **R1.** MUST a.\n- **R1.** MUST b.', enforcement: '| R1 | review | ❌ |' }), /R1 is used more than once/],
    ['pack document held to the same rules', 'docs/packs/http-api/responses-and-errors.md', (t) => setDoc(t, { status: 'proposed' }), /"## Rules" section has no rules/],
    ['cross-reference to a rule that does not exist', FIXTURE_DOC, (t) => setDoc(t, { status: 'proposed', rules: '- **R1.** MUST a.', enforcement: '| R1 | review | ❌ |' }),
      /names a rule that does not exist in docs\/02-domain\/zz-test-fixture\.md/, 'docs/README.md', (t) => `${t}\nSee \`02-domain/zz-test-fixture.md\` R7.\n`],
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
  wave2Checks(dst);
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
  const time = join(dst, FIXTURE_DOC);
  const timeBefore = readFileSync(time, 'utf8');
  writeFileSync(time, setDoc(timeBefore, { status: 'proposed', rules: '- **R1.** MUST a.\n- **R2.** MAY b.', enforcement: '| R1 | review | ❌ |\n| R2 | `scripts/check.mjs` | ✅ |' }));
  const goodRef = withFile('docs/README.md', `${readFileSync(join(dst, 'docs/README.md'), 'utf8')}\nSee \`02-domain/zz-test-fixture.md\` R2.\n`, check);
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
  record('guard allows editing a proposed standard', guardDoc(FIXTURE_DOC).code === 0);
  for (const [label, file, from, to] of [
    ['a ratified standard', FIXTURE_DOC, /^status: [\w-]+/m, 'status: ratified'],
    ['an accepted ADR', adr, /^status: [\w-]+/m, 'status: accepted'],
  ]) {
    const r = withFile(file, readFileSync(join(dst, file), 'utf8').replace(from, to), () => guardDoc(file));
    record(`guard refuses ${label}`, r.code === 2 && /refused/.test(r.out), `exit ${r.code}: ${r.out}`);
    const viaStdin = withFile(file, readFileSync(join(dst, file), 'utf8').replace(from, to), () =>
      guardDoc('--stdin', { input: JSON.stringify({ tool_name: 'Edit', tool_input: { file_path: join(dst, file) } }) }));
    record(`guard refuses ${label} (tool-hook payload on stdin)`, viaStdin.code === 2, `exit ${viaStdin.code}: ${viaStdin.out}`);
  }
  record('guard allows a document again after restoring', guardDoc(FIXTURE_DOC).code === 0);

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

// Negative and positive proofs for the wave-2 checks: forbidden terms, scope tags, not-applicable,
// parameter uniqueness, open decisions, ADR completeness, references, the debt table.
function wave2Checks(dst) {
  const check = () => run('node', ['scripts/check.mjs'], { cwd: dst });
  const edit = (edits, fn) => {
    const saved = edits.map(([file, m]) => {
      const p = join(dst, file);
      const before = existsSync(p) ? readFileSync(p, 'utf8') : null;
      mkdirSync(join(p, '..'), { recursive: true });
      writeFileSync(p, typeof m === 'function' ? m(before ?? '') : m);
      return [p, before];
    });
    try { return fn(); } finally { for (const [p, b] of saved) b === null ? rmSync(p, { force: true }) : writeFileSync(p, b); }
  };
  const rejects = (label, edits, re) => {
    const r = edit(edits, check);
    record(`check.mjs rejects: ${label}`, !r.ok && re.test(r.out), r.ok ? 'check passed but should have failed' : r.out);
    return r;
  };
  const accepts = (label, edits) => {
    const r = edit(edits, check);
    record(`check.mjs accepts: ${label}`, r.ok, r.out);
  };
  const TIME = FIXTURE_DOC;
  const LIFE = 'docs/02-domain/lifecycles.md';
  const ADR1 = 'docs/04-adr/ADR-001-adopt-engineering-baseline.md';
  const terms = ['.baseline/forbidden-terms.txt', 'outdatedterm\n'];
  const twoHits = [LIFE, (x) => `${x}\nThe outdatedterm moves to closed.\nAnd the OutdatedTerm returns.\n`];
  const paramRow = (row) => (x) => x.replace(/(## Parameters[\s\S]*?\| --- \| --- \| --- \| --- \|\n)/, (m) => `${m}${row}\n`);

  // Forbidden terms: every hit is reported, with file:line and the way to allow-list.
  const hits = rejects('forbidden terms in project prose', [terms, twoHits], /lifecycles\.md:\d+: uses forbidden term/);
  record('forbidden-terms check reports every hit and how to allow-list', (hits.out.match(/uses forbidden term/g) ?? []).length === 2 && /forbidden-allow\.txt/.test(hits.out), hits.out);
  accepts('a forbidden term in a skipped path (ADR-001)', [terms, [ADR1, (x) => `${x}\nThe outdatedterm is mentioned here.\n`]]);
  accepts('a forbidden term only in a Parameters Default and Trade-off column', [terms, [TIME, paramRow('| `zz_probe` | answer | the outdatedterm default | the outdatedterm trade-off |')]]);
  accepts('a forbidden term inside hyphen- and underscore-joined compounds', [terms, [LIFE, (x) => `${x}\nSee outdatedterm-id and outdatedterm_id and pre-outdatedterm.\n`]]);
  accepts('a forbidden term allow-listed by path', [terms, twoHits, ['.baseline/forbidden-allow.txt', `# fixture\n${LIFE}\n`]]);
  accepts('a forbidden term allow-listed by match:', [terms, twoHits, ['.baseline/forbidden-allow.txt', 'match:moves to closed\nmatch:returns\n']]);
  accepts('a forbidden term under an allow-listed dir/*', [terms, twoHits, ['.baseline/forbidden-allow.txt', 'docs/02-domain/*\n']]);

  // D1: not-applicable and scope tags.
  const setStatus = (s) => (x) => x.replace(/^status: [\w-]+/m, s);
  rejects('not-applicable without a reason', [[TIME, setStatus('status: not-applicable')]], /not-applicable but has no "reason:"/);
  accepts('not-applicable with a reason (rule checks skipped)', [[TIME, setStatus('status: not-applicable\nreason: no component of this project needs it')]]);
  const oneRule = (rule) => (x) => setDoc(x, { status: 'proposed', rules: rule, enforcement: '| R1 | review | ❌ |' });
  rejects('a scope tag naming an unknown kind', [[TIME, oneRule('- **R1.** MUST a. _(applies to: service, robot)_')]], /unknown kind\(s\) robot/);
  rejects('a malformed scope tag', [[TIME, oneRule('- **R1.** MUST a. (applies to: service)')]], /malformed scope tag/);
  accepts('a valid scope tag', [[TIME, oneRule('- **R1.** MUST a. _(applies to: service, daemon)_')]]);
  rejects('applies-to frontmatter with an unknown kind', [[TIME, (x) => x.replace(/^owner:/m, 'applies-to: [service, widget]\nowner:')]], /names unknown kind\(s\) widget/);
  accepts('applies-to frontmatter with valid kinds', [[TIME, (x) => x.replace(/^owner:/m, 'applies-to: [service, ui]\nowner:')]]);

  // Parameters: unique names across the project, every [[...]] listed, --json keeps working.
  const dupRow = paramRow('| `terms` | default | duplicate | duplicate |');
  const dup = edit([[TIME, dupRow]], () => run('node', ['scripts/params.mjs'], { cwd: dst }));
  record('params.mjs fails on a parameter defined in two documents, naming both', !dup.ok && /"terms" is defined more than once/.test(dup.out) && /time\.md/.test(dup.out) && /glossary\.md/.test(dup.out), dup.out);
  rejects('a parameter defined in two documents', [[TIME, dupRow]], /"terms" is defined more than once/);
  const js = run('node', ['scripts/params.mjs', '--json'], { cwd: dst });
  let parsed = null;
  try { parsed = JSON.parse(js.out); } catch { /* reported below */ }
  record('params.mjs --json prints JSON and exits 0 without duplicates', js.ok && Array.isArray(parsed), js.out.slice(0, 300));
  record('params.mjs lists markers outside Parameters tables (glossary Terms row)', Array.isArray(parsed) && parsed.some((d) => /glossary\.md$/.test(d.file) && d.other.some((o) => o.marker === '[[term]]')), js.out.slice(0, 300));

  // D7: a ratified document keeps an open decision only if it is queued.
  const ratified = (body) => (x) => setDoc(
    x.replace(/\[\[[^\]\n]+\]\]/g, 'x').replace(/^owner: .*/m, 'owner: someone').replace(/^last-reviewed: .*/m, 'last-reviewed: 2026-01-01')
      .replace(/## Open decisions[\s\S]*?(?=\n## Rules)/, `## Open decisions\n\n${body}\n`),
    { status: 'ratified', rules: '- **R1.** MUST a.', enforcement: '| R1 | review | ❌ |' });
  rejects('a ratified document with an open decision not in the queue', [[TIME, ratified('- [ ] still open')]], /open decision not in the queue/);
  const queueRow = (x) => x.replace(/(\| # \| Question \| Belongs to \| Blocking\? \| Raised \|\n\| --- \| --- \| --- \| --- \| --- \|\n)/, `$1| D1 | later | \`${TIME.replace(/^docs\//, '')}\` | no | 2026-01-01 |\n`);
  accepts('a ratified document whose open decisions are ticked or queued', [[TIME, ratified('- [x] done\n- [ ] later\n      continued here → DECISION-QUEUE')], ['docs/DECISION-QUEUE.md', queueRow]]);
  rejects('a scope tag on a rule\'s later line', [[TIME, (x) => x.replace('## Rules\n', '## Rules\n\n- **R99.** Something MUST hold\n  for some kinds. _(applies to: service)_\n')]], /R99 has its scope tag on a later line/);
  rejects('a ratified document that queues an open decision with no queue row', [[TIME, ratified('- [ ] later → DECISION-QUEUE')]], /queues an open decision, but docs\/DECISION-QUEUE\.md/);

  // ADRs: index parity and completeness of an accepted ADR.
  const accept = (x) => x.replace(/^status: [\w-]+/m, 'status: accepted').replace(/^date: .*/m, 'date: 2026-01-01').replace(/^deciders: .*/m, 'deciders: [Ada Lovelace]');
  rejects('an accepted ADR with a placeholder date and no deciders', [[ADR1, setStatus('status: accepted')]], /date is "YYYY-MM-DD"/);
  accepts('a complete accepted ADR', [[ADR1, accept]]);
  rejects('an accepted ADR missing a required section', [[ADR1, (x) => accept(x).replace(/## Compliance[\s\S]*?(?=\n## Amendments)/, '')]], /"## Compliance" section is missing/);
  rejects('an ADR file missing from the index', [['docs/04-adr/ADR-002-extra.md', '---\nadr: 002\nstatus: proposed\ndate: YYYY-MM-DD\ndeciders: []\nsupersedes: null\nsuperseded-by: null\n---\n\n# ADR-002: Extra\n']], /index does not list ADR-002-extra\.md/);
  rejects('an index row for an ADR file that does not exist', [['docs/04-adr/README.md', (x) => `${x}| [ADR-009](ADR-009-gone.md) | Gone | proposed | — |\n`]], /ADR-009-gone\.md does not exist/);

  // D9: bare names resolve only when unique.
  accepts('a bare file name that is unique in the project', [[TIME, oneRule('- **R1.** MUST a.')], ['docs/README.md', (x) => `${x}\nSee \`zz-test-fixture.md\` R1.\n`]]);
  rejects('a bare file name shared by two documents', [['docs/aa/same.md', '# a\n'], ['docs/bb/same.md', '# b\n'], ['docs/README.md', (x) => `${x}\nSee \`same.md\` R1.\n`]], /ambiguous[\s\S]*aa\/same\.md/);

  // The enforcement-debt table (docs/DECISION-QUEUE.md between markers).
  const Q = 'docs/DECISION-QUEUE.md';
  const markers = (x) => (x.includes('<!-- debt:start -->') ? x : `${x}\n<!-- debt:start -->\n<!-- debt:end -->\n`);
  accepts('markers around a debt table that was never generated', [[Q, markers]]);
  const owed = (x) => setDoc(x, { status: 'proposed', rules: '- **R1.** MUST a.', enforcement: '| R1 | see [system](../03-architecture/system.md) | ⬜ before-production |' });
  const debt = edit([[Q, markers], [TIME, owed]], () => {
    const gen = run('node', ['scripts/queue.mjs'], { cwd: dst });
    const fresh = run('node', ['scripts/check.mjs'], { cwd: dst });
    const table = readFileSync(join(dst, Q), 'utf8');
    writeFileSync(join(dst, Q), table.replace('<!-- debt:end -->', '| `x.md` | R1 | y | later |\n<!-- debt:end -->'));
    const stale = run('node', ['scripts/check.mjs'], { cwd: dst });
    return { gen, fresh, table, stale };
  });
  record('queue.mjs writes the debt table with docs/-relative references and due', debt.gen.ok && /\| `02-domain\/zz-test-fixture\.md` \| R1 \| see `03-architecture\/system\.md` \| before-production \|/.test(debt.table), debt.gen.out + debt.table.slice(-600));
  record('check.mjs accepts a freshly generated debt table', debt.fresh.ok, debt.fresh.out);
  record('check.mjs rejects: a stale debt table', !debt.stale.ok && /debt table is stale/.test(debt.stale.out), debt.stale.out);
  record('check.mjs passes again after the wave-2 checks', check().ok);
}

if (!KEEP) rmSync(TMP, { recursive: true, force: true });

let failed = 0;
for (const r of results) {
  console.log(`${r.ok ? '✓' : '✗'} ${r.scenario}`);
  if (!r.ok) { failed++; if (r.detail) console.log(r.detail.split('\n').map((l) => `    ${l}`).join('\n')); }
}
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
