// Shared helpers for the baseline scripts. Node built-ins only, no dependencies.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

export const ROOT = process.cwd();

const SKIP_DIRS = new Set(['.git', 'node_modules', 'dist', 'build', 'out', '.venv']);

export function walk(dir, filter = () => true, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, filter, acc);
    else if (filter(full)) acc.push(full);
  }
  return acc;
}

export const rel = (p) => relative(ROOT, p).split(sep).join('/');

export function read(p) {
  return readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
}

/** Parses a flat YAML frontmatter block (key: value, comments stripped). */
export function frontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (kv) fm[kv[1]] = kv[2].replace(/\s+#.*$/, '').trim().replace(/^["']|["']$/g, '');
  }
  return fm;
}

/** Removes fenced code, inline code and HTML comments, so markers inside them are ignored. */
export function stripNonProse(text) {
  return text
    .replace(/^---\n[\s\S]*?\n---\n/, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/`[^`\n]*`/g, '');
}

/** Splits a document into its `## Heading` sections (fenced code ignored). Returns { heading: body }. */
export function sections(text) {
  const out = {};
  let current = null;
  let fenced = false;
  for (const line of text.replace(/^---\n[\s\S]*?\n---\n/, '').split('\n')) {
    if (/^```/.test(line)) fenced = !fenced;
    const h = !fenced && line.match(/^## +(.+?)\s*$/);
    if (h) { current = h[1]; out[current] = ''; continue; }
    if (current !== null) out[current] += `${line}\n`;
  }
  return out;
}

/** Rule numbers defined in a `## Rules` section: list items that start `- **R<n>.**`. */
export function ruleIds(text) {
  const body = sections(text).Rules ?? '';
  const ids = [];
  for (const m of body.matchAll(/^\s*(?:[-*]|\d+\.)\s+\*\*R(\d+)\.\*\*/gm)) ids.push(Number(m[1]));
  return ids;
}

/** Rows of the `## Enforcement` table whose first cell names rules: [{ ids, status, raw }]. */
export function enforcementRows(text) {
  const body = sections(text).Enforcement ?? '';
  const rows = [];
  for (const line of body.split('\n')) {
    if (!line.trim().startsWith('|')) continue;
    const cells = line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
    const first = cells[0].replace(/[*`]/g, '');
    const ids = [];
    const range = first.match(/^R(\d+)\s*[-–]\s*R?(\d+)$/); // "R3-R5"
    if (range) for (let n = Number(range[1]); n <= Number(range[2]); n++) ids.push(n);
    else if (/^R\d+(\s*(,|\/|&|and)\s*R\d+)*$/.test(first)) for (const m of first.matchAll(/R(\d+)/g)) ids.push(Number(m[1]));
    else continue;
    const status = (cells.slice(1).join(' ').match(/[✅◐⬜❌]/) ?? [null])[0];
    rows.push({ ids, status, raw: line.trim() });
  }
  return rows;
}
