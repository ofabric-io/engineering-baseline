#!/usr/bin/env node
// Secret scan (check plugin). Fails on high-signal credential shapes in committed text.
//   node scripts/checks/secrets.mjs                 scans every tracked file
//   BASELINE_STAGED=1 node scripts/checks/secrets.mjs   scans only what is staged (pre-commit hook)
//
// Outside a git work tree it scans the directory tree instead. Never prints the secret itself.
// Allowlist: .baseline/secrets-allowlist.txt, one entry per line, '#' starts a comment:
//   path/to/file        skip that file        path/prefix/*   skip a directory tree
//   match:<text>        ignore a finding whose matched text contains <text>
// Allowlist a false positive; never a real secret (rotate it instead).
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const STAGED = process.env.BASELINE_STAGED === '1';
const MAX_BYTES = 1024 * 1024;
const SKIP_DIRS = new Set(['.git', 'node_modules', 'dist', 'build', 'out', '.venv']);
const BINARY = /\.(png|jpe?g|gif|webp|ico|pdf|zip|gz|tgz|woff2?|ttf|otf|eot|mp[34]|mov|wasm|lock)$/i;
const CONFIG_FILE = /(^|\/)\.env[^/]*$|\.(env|ini|properties|toml|conf|ya?ml)$/i;

const PATTERNS = [
  ['private key', /-----BEGIN (?:[A-Z]+ )*PRIVATE KEY(?: BLOCK)?-----/],
  ['cloud access key id', /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/],
  ['source-host token', /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{50,}|glpat-[A-Za-z0-9_-]{20,})/],
  ['chat-service token', /\bxox[abprs]-[A-Za-z0-9-]{10,}/],
  ['API key (Google-style)', /\bAIza[0-9A-Za-z_-]{35}\b/],
  ['live payment key', /\b[sr]k_live_[0-9A-Za-z]{16,}/],
  ['package-registry token', /\bnpm_[A-Za-z0-9]{36}\b/],
  ['credential in a URL', /\b[a-z][a-z0-9+.-]*:\/\/[^\s:@/]+:[^\s:@/$<{]{6,}@[^\s/]+/i],
];
// A literal assigned to a credential-looking name: password = "…", api_key: '…'
const NAME = String.raw`(?:pass(?:word|wd)|secret|api[_-]?key|access[_-]?token|auth[_-]?token|private[_-]?key)`;
const QUOTED = new RegExp(String.raw`\b[\w.-]*${NAME}[\w.-]*["']?\s*[:=]\s*(["'])([^"'\s]{8,})\1`, 'i');
const BARE = new RegExp(String.raw`^\s*[\w.-]*${NAME}[\w.-]*\s*[:=]\s*([^\s"'#$<{][^\s#]{7,})\s*$`, 'i');
const PLACEHOLDER = /example|change-?me|placeholder|your[-_ ]|xxx|\*\*\*|dummy|sample|redacted|todo|secret-here|process\.env|env\.|getenv|\$\{|\{\{|<[^>]+>|^[a-z_.]+\(\)$/i;

function findings(file, text) {
  const out = [];
  text.split('\n').forEach((line, i) => {
    for (const [label, re] of PATTERNS) {
      const m = line.match(re);
      if (m && !(label === 'credential in a URL' && (PLACEHOLDER.test(m[0]) || /:(?:pass(?:word)?|secret|pwd)@/i.test(m[0])))) {
        out.push({ line: i + 1, label, hit: m[0] });
      }
    }
    const lit = line.match(QUOTED) ?? (CONFIG_FILE.test(file) ? line.match(BARE) : null);
    if (lit) {
      const value = lit[2] ?? lit[1];
      if (!PLACEHOLDER.test(value) && !PLACEHOLDER.test(line)) out.push({ line: i + 1, label: 'literal credential assignment', hit: lit[0] });
    }
  });
  return out;
}

const git = (args) => spawnSync('git', args, { cwd: ROOT, encoding: 'utf8' });
const top = git(['rev-parse', '--show-toplevel']);
const inGit = top.status === 0 && resolve(top.stdout.trim()) === resolve(ROOT);

function listFiles() {
  if (inGit) {
    const r = STAGED
      ? git(['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z'])
      : git(['ls-files', '-z']);
    return r.stdout.split('\0').filter(Boolean);
  }
  const acc = [];
  const walk = (dir) => {
    for (const n of readdirSync(dir)) {
      if (SKIP_DIRS.has(n)) continue;
      const p = join(dir, n);
      if (statSync(p).isDirectory()) walk(p);
      else acc.push(relative(ROOT, p).split(sep).join('/'));
    }
  };
  walk(ROOT);
  return acc;
}

function contentOf(file) {
  if (inGit && STAGED) {
    const r = spawnSync('git', ['show', `:${file}`], { cwd: ROOT, encoding: 'buffer', maxBuffer: 16 * MAX_BYTES });
    return r.status === 0 && r.stdout.length <= MAX_BYTES ? r.stdout : null;
  }
  const abs = join(ROOT, file);
  if (!existsSync(abs) || statSync(abs).size > MAX_BYTES) return null;
  return readFileSync(abs);
}

const allowFile = join(ROOT, '.baseline', 'secrets-allowlist.txt');
const allow = existsSync(allowFile)
  ? readFileSync(allowFile, 'utf8').split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))
  : [];
const allowedFile = (f) => allow.some((a) => !a.startsWith('match:') && (a.endsWith('*') ? f.startsWith(a.slice(0, -1)) : f === a));
const allowedHit = (hit) => allow.some((a) => a.startsWith('match:') && a.length > 6 && hit.includes(a.slice(6)));

const problems = [];
for (const file of listFiles()) {
  if (BINARY.test(file) || allowedFile(file) || file === '.baseline/secrets-allowlist.txt') continue;
  const buf = contentOf(file);
  if (!buf || buf.includes(0)) continue;
  for (const f of findings(file, buf.toString('utf8').replace(/\r\n/g, '\n'))) {
    if (allowedHit(f.hit)) continue;
    problems.push(`${file}: line ${f.line}: possible secret (${f.label}); remove it and rotate it, or allowlist a false positive in .baseline/secrets-allowlist.txt`);
  }
}

if (problems.length) {
  console.log(problems.join('\n'));
  process.exit(1);
}
