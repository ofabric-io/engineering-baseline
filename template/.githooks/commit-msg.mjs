// Conventional Commits check for the subject line (docs/14-git/git.md).
import { readFileSync } from 'node:fs';

const TYPES = ['feat', 'fix', 'refactor', 'perf', 'test', 'docs', 'chore', 'build', 'ci', 'revert', 'style'];
const MAX = 72;

const subject = readFileSync(process.argv[2], 'utf8')
  .split(/\r?\n/)
  .find((l) => l.trim() && !l.startsWith('#')) ?? '';

// Messages git generates itself are not ours to police.
if (/^(Merge |Revert "|fixup! |squash! |amend! )/.test(subject)) process.exit(0);

const re = new RegExp(`^(${TYPES.join('|')})(\\([a-z0-9][a-z0-9-]*\\))?!?: \\S`);
const problems = [];
if (!re.test(subject)) problems.push(`subject must look like "<type>(<scope>): <summary>", type one of: ${TYPES.join(', ')}`);
if (subject.length > MAX) problems.push(`subject is ${subject.length} characters; the limit is ${MAX}`);

if (problems.length) {
  console.error(`commit-msg: rejected\n  "${subject}"`);
  for (const p of problems) console.error(`  ✗ ${p}`);
  process.exit(1);
}
