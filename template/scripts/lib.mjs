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
