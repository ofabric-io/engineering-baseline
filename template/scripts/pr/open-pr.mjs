#!/usr/bin/env node
// Opens a pull request that conforms to docs/14-git/git.md, or refuses and says why.
//   node scripts/pr/open-pr.mjs --title "<title>" --body-file <path> [--story STORY-NNN] [--draft] [--dry-run]
//
// Refuses: on a protected branch, with a dirty tree, with a title that does not start with the story id
// (when there is one), and with a body that lacks any section of the pull-request template.
// Host: from the git_host answer in .copier-answers.yml (github -> gh, gitlab -> glab, other -> prints
// the title and body for you to paste). Node built-ins only.
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { join } from 'node:path';

const root = process.cwd();
const argv = process.argv.slice(2);
const flag = (n) => { const i = argv.indexOf(`--${n}`); return i === -1 ? null : (argv[i + 1]?.startsWith('--') || argv[i + 1] === undefined ? true : argv[i + 1]); };
const refuse = (m) => { console.error(`open-pr: refused: ${m}`); process.exit(1); };
const sh = (cmd, args) => execFileSync(cmd, args, { encoding: 'utf8', cwd: root }).trim();

const title = flag('title');
const bodyFile = flag('body-file');
if (typeof title !== 'string' || typeof bodyFile !== 'string') refuse('--title and --body-file are required');
if (!existsSync(bodyFile)) refuse(`body file ${bodyFile} does not exist`);

const branch = sh('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
if (/^(main|master|trunk|develop|HEAD)$/.test(branch)) refuse(`on "${branch}"; cut a topic branch first`);
if (sh('git', ['status', '--porcelain'])) refuse('the working tree is dirty; commit or discard first');

const story = (typeof flag('story') === 'string' ? flag('story') : (branch.match(/story-(\d+)/i) ?? [])[0]?.toUpperCase()) ?? null;
if (story && !title.startsWith(story)) refuse(`the title must start with ${story} (e.g. "${story}: <summary>")`);

// The body must contain every section heading of the template, in order.
const host = (existsSync(join(root, '.copier-answers.yml')) && readFileSync(join(root, '.copier-answers.yml'), 'utf8').match(/^git_host:\s*["']?(\w+)/m)?.[1]) || 'other';
const templates = { github: '.github/pull_request_template.md', gitlab: '.gitlab/merge_request_templates/Default.md' };
const body = readFileSync(bodyFile, 'utf8').replace(/\r\n/g, '\n');
if (templates[host] && existsSync(join(root, templates[host]))) {
  const headings = [...readFileSync(join(root, templates[host]), 'utf8').matchAll(/^## .+$/gm)].map((m) => m[0].trim());
  const padded = `\n${body}\n`;
  let from = 0;
  for (const h of headings) {
    const at = padded.indexOf(`\n${h}\n`, from);
    if (at === -1) refuse(`the body is missing the template section "${h}" (or has it out of order); answer it, do not delete it`);
    from = at + 1;
  }
}
if (/^\s*-\s\[\s\]\s*$/m.test(body)) refuse('the body still has an empty checklist item from the template');

if (flag('dry-run')) { console.log(`ok (${host}): ${title}`); process.exit(0); }

if (host === 'other') { console.log(`${title}\n\n${body}`); console.log('\nopen-pr: no host CLI for git_host=other; open the request by hand with the text above.'); process.exit(0); }
sh('git', ['push', '--set-upstream', 'origin', branch]);
const args = host === 'github'
  ? ['pr', 'create', '--title', title, '--body-file', bodyFile, ...(flag('draft') ? ['--draft'] : [])]
  : ['mr', 'create', '--title', title, '--description', body, '--yes', ...(flag('draft') ? ['--draft'] : [])];
const r = spawnSync(host === 'github' ? 'gh' : 'glab', args, { stdio: 'inherit', cwd: root });
process.exit(r.status ?? 1);
