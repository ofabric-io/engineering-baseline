#!/usr/bin/env node
// Tracker CLI: the one way skills and people talk to the work tracker.
//   node scripts/tracker/cli.mjs <verb> [args]      (node scripts/tracker/cli.mjs --help)
//
// The adapter is chosen by the `tracker` answer in .copier-answers.yml (override: TRACKER=<name>);
// exactly one adapter file exists under scripts/tracker/adapters/. There is deliberately no
// delete verb: work items are closed or abandoned, never destroyed. Node built-ins only.
import { existsSync, readdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, basename } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, read, frontmatter } from '../lib.mjs';

import { STATES, NAMES, stateName } from './states.mjs';
const TODO = STATES.todo;
const IN_PROGRESS = STATES['in-progress'];
const COMPLETE = STATES.complete;
const SPECS_DIR = 'docs/17-specs';
const ID_RE = /\b(FEAT|STORY)-(\d+)\b/g;
const KIND_PREFIX = { feat: 'FEAT', feature: 'FEAT', story: 'STORY' };

const HELP = `usage: node scripts/tracker/cli.mjs <verb> [args]

  next-number --kind feat|story        highest + 1 across docs/17-specs/ and the tracker
                                       (a gap in the sequence is a reservation, never reused);
                                       tracker unreachable: specs only, flagged "offline answer" on stderr
  create --spec <path> [--epic <e>] [--dry-run]
                                       create the work item for a spec, write its reference back
                                       into the spec's tracker: frontmatter
  get <ID>                             one item: status, assignee, reference
  set-status <ID> <state>              state is one of: ${NAMES.join(' | ')} (names from states.json);
                                       "complete" only after the change has merged
  assign-self <ID>                     add the current user (the VCS user.email); never replaces anyone
  claim <ID>                           assign-self, then move to "in progress"; refuses to take over
  list [--startable] [--status <s>]    items; --startable applies the start gate (specs + tracker)
  adapter                              print the active adapter name

Options: --json for machine-readable output. There is no delete verb.`;

// ---------------------------------------------------------------- helpers

function parseArgs(argv) {
  const pos = [];
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) flags[key] = true;
      else { flags[key] = next; i++; }
    } else pos.push(a);
  }
  return { pos, flags };
}

const die = (msg, code = 1) => { console.error(`tracker: ${msg}`); process.exit(code); };

function adapterName() {
  if (process.env.TRACKER) return process.env.TRACKER;
  const answers = join(ROOT, '.copier-answers.yml');
  if (existsSync(answers)) {
    const m = read(answers).match(/^tracker:\s*["']?([\w-]+)["']?\s*$/m);
    if (m) return m[1];
  }
  return 'none';
}

async function loadAdapter() {
  const name = adapterName();
  const file = join(ROOT, 'scripts', 'tracker', 'adapters', `${name}.mjs`);
  if (!existsSync(file)) die(`no adapter file for tracker "${name}" (expected scripts/tracker/adapters/${name}.mjs)`);
  const mod = await import(pathToFileURL(file).href);
  return { name, ...mod };
}

export function parseList(value) {
  const v = (value ?? '').trim();
  if (!v || v === '[]') return [];
  return v.replace(/^\[|\]$/g, '').split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
}

/** Every spec file under docs/17-specs/ with its parsed frontmatter. Templates are skipped. */
export function loadSpecs() {
  const dir = join(ROOT, SPECS_DIR);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((n) => /^(FEAT|STORY)-\d+.*\.md$/.test(n))
    .map((n) => {
      const path = `${SPECS_DIR}/${n}`;
      const text = read(join(ROOT, path));
      const fm = frontmatter(text) ?? {};
      const id = fm.spec || fm.story || n.match(/^((?:FEAT|STORY)-\d+)/)[1];
      return { id, path, fm, text, deps: parseList(fm['depends-on']) };
    });
}

/** Highest number seen for a prefix in file names, spec ids and tracker items, plus one. */
export function nextNumber(prefix, specs, trackerIds) {
  let max = 0;
  const seen = [...specs.flatMap((s) => [s.id, basename(s.path)]), ...trackerIds];
  for (const text of seen) {
    for (const m of String(text).matchAll(ID_RE)) if (m[1] === prefix) max = Math.max(max, Number(m[2]));
  }
  return `${prefix}-${String(max + 1).padStart(3, '0')}`;
}

/** Body of a work item: pointers into the repository only, never a copy of a rule. */
export function dispatchBlock(spec) {
  const m = spec.text.match(/^## Standards to read\s*\n([\s\S]*?)(?=^## |^---\s*$|(?![\s\S]))/m);
  const section = m ? m[1].replace(/<!--[\s\S]*?-->/g, '') : '';
  const standards = [...section.matchAll(/`(docs\/[^`]+)`/g)].map((x) => x[1]).filter((p) => p !== 'docs/');
  const verification = (spec.text.match(/^## Verification\s*\n[\s\S]*?```[a-z]*\n([\s\S]*?)```/m) ?? [])[1] ?? '';
  const commands = verification.split('\n').map((l) => l.trim()).filter(Boolean);
  const parts = (spec.text.match(/\*\*Parts touched:\*\*[ \t]*([^\n]*)/) ?? [])[1]?.trim();
  return [
    `Spec: ${spec.path} (status: ${spec.fm.status || '-'})`,
    `Parent: ${spec.fm.parent || '-'}`,
    `Tier: ${spec.fm.tier || '-'}`,
    `Parts touched: ${parts || '-'}`,
    `Depends on: ${parseList(spec.fm['depends-on']).join(', ') || '-'}`,
    `Standards to read: ${standards.join(', ') || '-'}`,
    `Verification: ${commands.join(' ; ') || '-'}`,
    `Branch: ${spec.fm.branch && spec.fm.branch !== 'null' ? spec.fm.branch : '-'}`,
    `Pull request: ${spec.fm.pr && spec.fm.pr !== 'null' ? spec.fm.pr : '-'}`,
    '',
    'The spec is the source of truth. This item holds workflow state only: no rule text, no acceptance criteria.',
  ].join('\n');
}

function titleOf(spec) {
  const m = spec.text.replace(/^---\n[\s\S]*?\n---\n/, '').match(/^# (.+)$/m);
  return m ? m[1].trim() : spec.id;
}

function writeBack(spec, key, value) {
  const abs = join(ROOT, spec.path);
  const text = read(abs);
  const end = text.indexOf('\n---\n', 4);
  const head = text.slice(0, end);
  const re = new RegExp(`^${key}:.*$`, 'm');
  if (!re.test(head)) die(`${spec.path}: frontmatter has no "${key}:" line to update`);
  writeFileSync(abs, head.replace(re, `${key}: ${value}`) + text.slice(end));
}

function vcsEmail() {
  try { return execFileSync('git', ['config', 'user.email'], { encoding: 'utf8' }).trim(); } catch { return ''; }
}

function out(flags, value, human) {
  if (flags.json) console.log(JSON.stringify(value, null, 2));
  else console.log(human);
}

const normId = (s) => String(s ?? '').toUpperCase();

/** Reasons a story cannot be started; empty means startable. */
export function startBlockers(spec, specs, item) {
  const reasons = [];
  if (spec.fm.status !== 'approved') reasons.push(`spec status is ${spec.fm.status || '?'}, not approved`);
  if (spec.fm.pr && spec.fm.pr !== 'null') reasons.push('spec already has a PR');
  if (!('depends-on' in spec.fm)) reasons.push('no depends-on: field');
  for (const dep of spec.deps) {
    const d = specs.find((s) => s.id === dep);
    if (!d) reasons.push(`depends-on ${dep}: no such spec`);
    else if (d.fm.status !== 'implemented') reasons.push(`depends-on ${dep}: ${d.fm.status}, not implemented`);
  }
  if (spec.fm.parent && spec.fm.parent !== 'null') {
    const p = specs.find((s) => s.id === spec.fm.parent);
    if (!p) reasons.push(`parent ${spec.fm.parent}: no such spec`);
    else if (!['approved', 'implemented'].includes(p.fm.status)) reasons.push(`parent ${p.id} is ${p.fm.status}`);
  }
  if (item) {
    if (item.status !== TODO) reasons.push(`tracker status is ${item.status}, not ${TODO}`);
    if (item.assignee) reasons.push(`already assigned to ${item.assignee}`);
  }
  return reasons;
}

// ---------------------------------------------------------------- verbs

async function main() {
  const { pos, flags } = parseArgs(process.argv.slice(2));
  const verb = pos[0];
  if (!verb || flags.help || verb === 'help') { console.log(HELP); return; }
  if (/^(delete|remove|rm|destroy)$/.test(verb)) die('there is no delete verb: close or abandon the item instead');
  if (verb === 'adapter') { console.log(adapterName()); return; }

  const specs = loadSpecs();

  if (verb === 'next-number') {
    const prefix = KIND_PREFIX[String(flags.kind ?? '').toLowerCase()];
    if (!prefix) die('next-number needs --kind feat|story');
    let trackerIds = [];
    let offline = null;
    try {
      const adapter = await loadAdapter();
      trackerIds = (await adapter.list()).map((i) => i.id);
    } catch (e) {
      offline = e.message;
    }
    const id = nextNumber(prefix, specs, trackerIds);
    if (offline) {
      console.error(`tracker: offline answer — verify against the tracker before using it (the tracker could not be read: ${offline.split('\n')[0]}; the number is highest + 1 across ${SPECS_DIR}/ only)`);
    }
    out(flags, offline ? { id, offline: true } : { id }, id);
    return;
  }

  const adapter = await loadAdapter();

  switch (verb) {
    case 'create': {
      const path = flags.spec;
      if (!path || path === true) die('create needs --spec <path>');
      const spec = specs.find((s) => s.path === String(path).replace(/\\/g, '/').replace(/^\.\//, ''));
      if (!spec) die(`${path}: not a spec under ${SPECS_DIR}/`);
      const kind = spec.id.startsWith('FEAT') ? 'feature' : 'story';
      const parentSpec = kind === 'story' ? specs.find((s) => s.id === spec.fm.parent) : null;
      if (kind === 'story' && !parentSpec) die(`${spec.path}: parent ${spec.fm.parent || '(none)'} is not a spec`);
      const req = {
        kind, id: spec.id, title: `${spec.id} — ${titleOf(spec)}`, body: dispatchBlock(spec),
        status: TODO,
        parent: parentSpec ? { id: parentSpec.id, ref: parentSpec.fm.tracker } : null,
        epic: flags.epic && flags.epic !== true ? flags.epic : null, spec: spec.path,
      };
      if (flags['dry-run']) { out(flags, req, `dry run (${adapter.name}):\n${req.title}\n\n${req.body}`); return; }
      if (await adapter.get(spec.id)) die(`${spec.id} already exists in the tracker; use get or set-status`);
      const created = await adapter.create(req);
      writeBack(spec, 'tracker', created.ref);
      out(flags, created, `created ${spec.id}: ${created.ref}`);
      return;
    }
    case 'get': {
      const id = normId(pos[1]);
      if (!id) die('get needs an id');
      const item = await adapter.get(id);
      if (!item) die(`${id}: not in the tracker`, 2);
      out(flags, item, `${item.id}  ${item.status}  assignee: ${item.assignee || '-'}  ${item.ref || ''}`);
      return;
    }
    case 'set-status': {
      const id = normId(pos[1]);
      const status = stateName(pos[2]);
      if (!id || !status) die(`usage: set-status <ID> <${NAMES.join('|')}>`);
      if (status === COMPLETE && !flags.merged) die(`"${COMPLETE}" only after the pull request has merged: pass --merged to confirm it did`);
      if (!(await adapter.get(id))) die(`${id}: not in the tracker`, 2);
      await adapter.setStatus(id, status);
      out(flags, { id, status }, `${id} -> ${status}`);
      return;
    }
    case 'assign-self':
    case 'claim': {
      const id = normId(pos[1]);
      if (!id) die(`${verb} needs an id`);
      const email = vcsEmail();
      if (!email) die('the VCS user.email is not set; cannot tell who is claiming');
      const item = await adapter.get(id);
      if (!item) die(`${id}: not in the tracker`, 2);
      if (item.assignee && !item.assigneeIsSelf) die(`${id} is assigned to ${item.assignee}; not taking it over`);
      if (!item.assignee && item.status === IN_PROGRESS) {
        die(`${id} is ${item.status} with nobody assigned; ask a human before claiming it`);
      }
      if (item.status === COMPLETE) die(`${id} is ${COMPLETE}`);
      if (!item.assignee) await adapter.assign(id, email);
      if (verb === 'claim' && item.status !== IN_PROGRESS) await adapter.setStatus(id, IN_PROGRESS);
      const status = verb === 'claim' ? IN_PROGRESS : item.status;
      out(flags, { id, assignee: email, status }, `${id} assigned to ${email}${verb === 'claim' ? `, ${IN_PROGRESS}` : ''}`);
      return;
    }
    case 'list': {
      const items = await adapter.list();
      let rows = items;
      if (flags.status && flags.status !== true) rows = rows.filter((i) => i.status === flags.status);
      if (flags.startable) {
        const byId = new Map(items.map((i) => [i.id, i]));
        rows = specs
          .filter((s) => s.id.startsWith('STORY'))
          .filter((s) => startBlockers(s, specs, byId.get(s.id)).length === 0)
          .map((s) => ({ id: s.id, title: titleOf(s), status: byId.get(s.id)?.status ?? 'untracked', assignee: '', ref: s.path }));
      }
      out(flags, rows, rows.length ? rows.map((r) => `${r.id}  ${r.status}  ${r.assignee || '-'}  ${r.title}`).join('\n') : '(none)');
      return;
    }
    default:
      die(`unknown verb "${verb}"\n\n${HELP}`);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((e) => die(e.message));
}
