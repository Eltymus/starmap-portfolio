// Runs the Playwright suite inside the same Linux container used by CI, so that
// screenshot baselines match on every machine. Extra arguments are passed to
// `playwright test`, e.g. `npm run test:e2e:linux -- --update-snapshots`.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const { version } = JSON.parse(readFileSync('node_modules/@playwright/test/package.json', 'utf8'));
const image = `mcr.microsoft.com/playwright:v${version}-noble`;
const args = process.argv.slice(2).join(' ');

const result = spawnSync(
  'docker',
  [
    'run',
    '--rm',
    '--ipc=host',
    '-v',
    `${process.cwd()}:/work`,
    '-v',
    '/work/node_modules',
    '-w',
    '/work',
    '-e',
    'CI=1',
    image,
    'bash',
    '-c',
    `npm ci --no-audit --no-fund && npm run build && npx playwright test ${args}`
  ],
  { stdio: 'inherit', env: { ...process.env, MSYS_NO_PATHCONV: '1' } }
);
process.exit(result.status ?? 1);
