#!/usr/bin/env node
// Guard: refuse shell commands that bypass or destroy work. Tool-neutral.
//   node scripts/guards/command.mjs "<command>"   exit 0 = allowed, exit 2 = refused (reason on stderr)
//   node scripts/guards/command.mjs --stdin       same, reading a tool-hook JSON payload on stdin
//                                                 (the command is tool_input.command)
// Refuses: skipping git hooks (--no-verify, commit -n), force-pushing a protected branch
// (main, master), and destructive resets (reset --hard, clean -f, discarding all changes).
// Only git invocations are inspected, token by token, so a commit message that merely
// mentions a flag is not refused.
import { readFileSync } from 'node:fs';

const PROTECTED = ['main', 'master'];

function commandText() {
  const arg = process.argv[2];
  if (arg && arg !== '--stdin') return process.argv.slice(2).join(' ');
  try {
    const payload = JSON.parse(readFileSync(0, 'utf8'));
    return (payload.tool_input ?? payload).command ?? '';
  } catch {
    return '';
  }
}

/** Splits one command segment into tokens, keeping quoted text as a single token. */
function tokenize(s) {
  const out = [];
  const re = /"((?:\\.|[^"\\])*)"|'([^']*)'|(\S+)/g;
  for (const m of s.matchAll(re)) out.push(m[1] ?? m[2] ?? m[3]);
  return out;
}

function refusal(tokens) {
  // Skip leading env assignments and wrappers to find `git`.
  let i = 0;
  while (i < tokens.length && (/^\w+=/.test(tokens[i]) || ['command', 'sudo', 'env', 'exec', 'time'].includes(tokens[i]))) i++;
  if (tokens[i] !== 'git') return null;
  let rest = tokens.slice(i + 1);
  while (rest.length && rest[0].startsWith('-')) rest = rest.slice(rest[0] === '-C' || rest[0] === '-c' ? 2 : 1);
  const [sub, ...args] = rest;
  const has = (...flags) => args.some((a) => flags.includes(a));

  // `git commit -n` is --no-verify; in a short-flag cluster only the letters before a value-taking `m` count.
  const shortN = (a) => /^-[a-zA-Z]+$/.test(a) && a.slice(1).split(/[mFCct]/)[0].includes('n');
  if (has('--no-verify') || (sub === 'commit' && args.some(shortN))) {
    return 'skipping git hooks (--no-verify) is not allowed; fix what the hook reports instead';
  }
  if (sub === 'push') {
    const force = args.some((a) => a === '-f' || a.startsWith('--force') || /^\+/.test(a));
    const names = args.filter((a) => !a.startsWith('-')).flatMap((a) => a.replace(/^\+/, '').split(':'));
    if (force && names.some((n) => PROTECTED.includes(n.replace(/^refs\/heads\//, '')))) {
      return `force-pushing ${PROTECTED.join(' or ')} is not allowed`;
    }
  }
  if (sub === 'reset' && has('--hard')) return 'git reset --hard destroys uncommitted work; stash or commit first, or ask the user';
  if (sub === 'clean' && args.some((a) => /^-[a-z]*f/.test(a) || a === '--force')) return 'git clean -f deletes untracked files for good; ask the user first';
  if ((sub === 'checkout' || sub === 'restore') && args.some((a) => a === '.') ) return `git ${sub} . discards every uncommitted change; ask the user first`;
  return null;
}

const text = commandText().replace(/<<-?\s*(['"]?)(\w+)\1[^\n]*\n[\s\S]*?\n\s*\2\b/g, '');
// Separators inside quotes do not split commands: hide them before splitting.
const hidden = text.replace(/"(?:\\.|[^"\\])*"|'[^']*'/g, (q) => q.replace(/[&;|\n]/g, '\u0001'));
for (const segment of hidden.split(/&&|\|\||;|\||\n/)) {
  const reason = refusal(tokenize(segment.trim().replace(/\u0001/g, ';')));
  if (reason) {
    console.error(`refused: ${reason}.`);
    process.exit(2);
  }
}
