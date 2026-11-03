import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist');
const repository = 'https://github.com/Andrewsive/qifu.git';
const branch = 'gh-pages';
const gitEnv = { ...process.env, GIT_TERMINAL_PROMPT: '0' };
const git = (args, cwd = root) => execFileSync('git', args, {
  cwd,
  env: gitEnv,
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'inherit'],
}).trim();

if (!existsSync(path.join(output, 'index.html'))) {
  throw new Error('Build the demo with npm run build before deploying.');
}

const authorName = git(['config', 'user.name']);
const authorEmail = git(['config', 'user.email']);
const sourceCommit = git(['rev-parse', '--short', 'HEAD']);
const previous = git(['ls-remote', '--heads', repository, branch]);
const temporary = mkdtempSync(path.join(tmpdir(), 'qifu-pages-'));

// Every generated or removed file must stay inside this dedicated temporary checkout.
function assertInsideTemporary(target) {
  const relative = path.relative(temporary, path.resolve(target));
  if (!relative || relative === '..' || relative.startsWith('..' + path.sep) || path.isAbsolute(relative)) {
    throw new Error('The deployment file is outside the temporary checkout.');
  }
}

try {
  if (previous) {
    git(['clone', '--depth', '1', '--branch', branch, '--single-branch', repository, temporary]);
  } else {
    git(['init', '-b', branch], temporary);
    git(['remote', 'add', 'origin', repository], temporary);
  }

  git(['config', 'user.name', authorName], temporary);
  git(['config', 'user.email', authorEmail], temporary);

  for (const entry of readdirSync(temporary)) {
    if (entry === '.git') continue;
    const target = path.join(temporary, entry);
    assertInsideTemporary(target);
    rmSync(target, { recursive: true, force: true });
  }
  for (const entry of readdirSync(output)) {
    const target = path.join(temporary, entry);
    assertInsideTemporary(target);
    cpSync(path.join(output, entry), target, { recursive: true });
  }
  writeFileSync(path.join(temporary, '.nojekyll'), '');
  git(['add', '--all'], temporary);

  if (git(['status', '--porcelain'], temporary)) {
    git(['commit', '-m', 'deploy: publish demo from ' + sourceCommit], temporary);
    git(['push', '--set-upstream', 'origin', branch], temporary);
    console.log('Published build: https://andrewsive.github.io/qifu/');
  } else {
    console.log('The published build is already up to date.');
  }
} finally {
  // This exact directory was freshly created above and never used as an input path.
  const relative = path.relative(path.resolve(tmpdir()), temporary);
  if (!relative.startsWith('..') && !path.isAbsolute(relative) && path.basename(temporary).startsWith('qifu-pages-')) {
    rmSync(temporary, { recursive: true, force: true });
  }
}
