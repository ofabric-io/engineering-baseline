#!/usr/bin/env node
// Guard: refuse edits to a ratified standard or an accepted ADR. Tool-neutral: any tool's
// pre-edit hook, or a person, can call it.
//   node scripts/guards/protected-docs.mjs <path>     exit 0 = allowed, exit 2 = refused (reason on stderr)
//   node scripts/guards/protected-docs.mjs --stdin    same, reading a tool-hook JSON payload on stdin
//                                                     (the path is tool_input.file_path or tool_input.path)
// Paths are resolved against the project root (the parent of scripts/). A file that does not
// exist yet, or lies outside docs/, is allowed.
import { existsSync, readFileSync } from 'node:fs';
import { relative, resolve, sep } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..', '..');

function targetPath() {
  const arg = process.argv[2];
  if (arg && arg !== '--stdin') return arg;
  try {
    const payload = JSON.parse(readFileSync(0, 'utf8'));
    const input = payload.tool_input ?? payload;
    return input.file_path ?? input.path ?? input.notebook_path ?? null;
  } catch {
    return null;
  }
}

const target = targetPath();
if (!target) process.exit(0); // nothing to judge; this guard never blocks on a payload it cannot read

const abs = resolve(ROOT, target);
const file = relative(ROOT, abs).split(sep).join('/');
if (file.startsWith('..') || !file.startsWith('docs/') || !file.endsWith('.md') || !existsSync(abs)) process.exit(0);

const text = readFileSync(abs, 'utf8').replace(/\r\n/g, '\n');
const fm = {};
for (const line of (text.match(/^---\n([\s\S]*?)\n---\n/) ?? [, ''])[1].split('\n')) {
  const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
  if (kv) fm[kv[1]] = kv[2].replace(/\s+#.*$/, '').trim();
}
const isTemplate = /(^|\/)_template\.md$|-template\.md$/.test(file);
const isAdr = /^docs\/04-adr\/ADR-\d+/.test(file);

if (!isTemplate && !isAdr && fm.status === 'ratified') {
  console.error(
    `refused: ${file} is a ratified standard. It changes only through an ADR (docs/04-adr/README.md R4): ` +
    'write the ADR with .agents/skills/new-adr/SKILL.md, get the human to accept it, then edit with their explicit approval.');
  process.exit(2);
}
if (isAdr && fm.status === 'accepted') {
  console.error(
    `refused: ${file} is an accepted ADR. Supersede it with a new ADR (docs/04-adr/README.md R6, R7); ` +
    'in pre-production governance mode an in-place amendment needs the user\'s explicit approval first.');
  process.exit(2);
}
