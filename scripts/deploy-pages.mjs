import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist');
const repository = 'https://github.com/Andrewsive/qifu.git';
const branch = 'gh-pages';
const gitEnv = { ...process.env, GIT_TERMINAL_PROMPT: '0' };
function git(args, cwd = root) {
  try {
    return execFileSync('git', [
      '-c', 'http.version=HTTP/1.1',
      '-c', 'http.lowSpeedLimit=1',
      '-c', 'http.lowSpeedTime=20',
      ...args,
    ], {
      cwd,
      env: gitEnv,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 120000,
    }).trim();
  } catch (error) {
    if (error.stderr) process.stderr.write(error.stderr);
    throw error;
  }
}

if (!existsSync(path.join(output, 'index.html'))) {
  throw new Error('Build the demo with npm run build before deploying.');
}

const authorName = git(['config', 'user.name']);
const authorEmail = git(['config', 'user.email']);
const sourceCommit = git(['rev-parse', '--short', 'HEAD']);
console.log('Checking the published branch…');
const previous = git(['ls-remote', '--heads', repository, branch]);
const temporary = mkdtempSync(path.join(tmpdir(), 'qifu-pages-'));

// Every generated or removed file must stay inside this dedicated temporary checkout.
function assertInsideTemporary(target) {
  const relative = path.relative(temporary, path.resolve(target));
  if (!relative || relative === '..' || relative.startsWith('..' + path.sep) || path.isAbsolute(relative)) {
    throw new Error('The deployment file is outside the temporary checkout.');
  }
}

function copyBuild(source, destination) {
  assertInsideTemporary(destination);
  mkdirSync(destination, { recursive: true });
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    const target = path.join(destination, entry.name);
    assertInsideTemporary(target);
    if (entry.isDirectory()) copyBuild(path.join(source, entry.name), target);
    else if (entry.isFile()) copyFileSync(path.join(source, entry.name), target);
    else throw new Error('The build contains an unsupported file type.');
  }
}

try {
  console.log('Preparing a temporary publishing checkout…');
  if (previous) {
    // Only the parent commit/tree is needed: the current build supplies all file contents.
    git(['clone', '--depth', '1', '--filter=blob:none', '--no-checkout', '--branch', branch, '--single-branch', repository, temporary]);
  } else {
    git(['init', '-b', branch], temporary);
    git(['remote', 'add', 'origin', repository], temporary);
  }

  console.log('Configuring the publishing commit…');
  git(['config', 'user.name', authorName], temporary);
  git(['config', 'user.email', authorEmail], temporary);

  for (const entry of readdirSync(temporary)) {
    if (entry === '.git') continue;
    const target = path.join(temporary, entry);
    assertInsideTemporary(target);
    rmSync(target, { recursive: true, force: true });
  }
  for (const entry of readdirSync(output, { withFileTypes: true })) {
    const target = path.join(temporary, entry.name);
    assertInsideTemporary(target);
    const source = path.join(output, entry.name);
    if (entry.isDirectory()) copyBuild(source, target);
    else if (entry.isFile()) copyFileSync(source, target);
    else throw new Error('The build contains an unsupported file type.');
  }
  writeFileSync(path.join(temporary, '.nojekyll'), '');
  console.log('Staging the built website…');
  git(['add', '--all'], temporary);

  const nextTree = git(['write-tree'], temporary);
  const previousTree = previous ? git(['rev-parse', 'HEAD^{tree}'], temporary) : null;
  if (nextTree !== previousTree) {
    // Commit the complete build tree without diffing absent historical blobs.
    const commit = git(['commit-tree', nextTree, ...(previous ? ['-p', 'HEAD'] : []), '-m', 'deploy: publish demo from ' + sourceCommit], temporary);
    git(['update-ref', 'refs/heads/' + branch, commit], temporary);
    console.log('Uploading the build to gh-pages…');
    git(['-c', 'pack.window=0', 'push', '--set-upstream', 'origin', branch], temporary);
    console.log('Published build: https://andrewsive.github.io/qifu/');
  } else {
    console.log('The published build is already up to date.');
  }
} catch (error) {
  console.log('Deployment failed: ' + error.message);
  process.exitCode = 1;
} finally {
  // This exact directory was freshly created above and never used as an input path.
  const relative = path.relative(path.resolve(tmpdir()), temporary);
  if (!relative.startsWith('..') && !path.isAbsolute(relative) && path.basename(temporary).startsWith('qifu-pages-')) {
    try {
      rmSync(temporary, { recursive: true, force: true, maxRetries: 4, retryDelay: 300 });
    } catch (cleanupError) {
      console.warn('Temporary checkout cleanup could not finish: ' + cleanupError.code);
    }
  }
}
