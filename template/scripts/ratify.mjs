#!/usr/bin/env node
// Ratifies documents, or marks them not applicable, after the user has said yes — never before.
//   node scripts/ratify.mjs --owner <who> <doc> [<doc> …]
//   node scripts/ratify.mjs --not-applicable "<one-line reason>" --owner <who> <doc> [<doc> …]
// <doc> is a path under docs/ (with or without the `docs/` prefix). For each document it sets
// `status`, `owner` and `last-reviewed` (today), adds `reason:` for not-applicable, ticks the
// "Ratify this document" bullet, and updates the Status board in docs/DECISION-QUEUE.md. It does
// not check completeness: run `node scripts/check.mjs` afterwards, which refuses a ratified
// document with `[[...]]` left or an open decision not queued.
import { ROOT, read, frontmatter } from './lib.mjs';
import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { cells } from './decisions.mjs';

const args = process.argv.slice(2);
const take = (flag) => {
  const i = args.indexOf(flag);
  if (i < 0) return null;
  const [v] = args.splice(i, 2).slice(1);
  return v ?? '';
};
const owner = take('--owner');
const naReason = take('--not-applicable');
const docs = args.map((a) => a.replace(/^docs\//, '').replace(/\\/g, '/'));
if (!owner || !docs.length || naReason === '') {
  console.error('usage: node scripts/ratify.mjs [--not-applicable "<reason>"] --owner <who> <doc> [<doc> …]');
  process.exit(2);
}
const status = naReason ? 'not-applicable' : 'ratified';
const today = new Date().toISOString().slice(0, 10);

const setField = (fm, key, value) => (new RegExp(`^${key}:.*$`, 'm').test(fm) ? fm.replace(new RegExp(`^${key}:.*$`, 'm'), `${key}: ${value}`) : `${fm}\n${key}: ${value}`);
let failed = false;
for (const doc of docs) {
  const p = join(ROOT, 'docs', doc);
  if (!existsSync(p)) { console.error(`ratify: docs/${doc} does not exist`); failed = true; continue; }
  const text = read(p);
  if (!frontmatter(text)) { console.error(`ratify: docs/${doc} has no frontmatter`); failed = true; continue; }
  const end = text.indexOf('\n---', 4);
  let fm = text.slice(4, end);
  fm = setField(fm, 'status', status);
  fm = setField(fm, 'owner', owner);
  fm = setField(fm, 'last-reviewed', today);
  if (naReason) fm = setField(fm, 'reason', naReason.replace(/\n/g, ' '));
  const body = text.slice(end).replace(/^([-*]\s+)\[ \](\s+Ratify this document\b)/m, '$1[x]$2');
  writeFileSync(p, `---\n${fm}${body}`);
  console.log(`ratify: docs/${doc} is ${status}`);
}

// Status board.
const q = join(ROOT, 'docs', 'DECISION-QUEUE.md');
if (existsSync(q)) {
  const lines = read(q).split('\n');
  const head = lines.findIndex((l) => /^## Status board/.test(l));
  if (head >= 0) {
    let last = -1;
    for (let i = head + 1; i < lines.length && !/^## /.test(lines[i]); i++) if (cells(lines[i])) last = i;
    for (let i = last; i > head; i--) if (/_Filled in by the bootstrap\._/.test(lines[i])) { lines.splice(i, 1); last--; }
    for (const doc of docs) {
      const row = `| \`${doc}\` | ${status} | ${owner} | ${today} |`;
      const at = lines.findIndex((l, i) => i > head && i <= last && cells(l)?.[0] === `\`${doc}\``);
      if (at >= 0) lines[at] = row;
      else if (last >= 0) lines.splice(++last, 0, row);
    }
    writeFileSync(q, lines.join('\n'));
  }
}
process.exit(failed ? 1 : 0);
