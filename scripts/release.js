import { execa } from 'execa';
import minimist from 'minimist';
import process from 'node:process';
import c from 'ansi-colors';

(() => run(process.argv))();

async function run(argv) {
  try {
    const args = minimist(argv.slice(2));

    const options = parseOptions(args);

    await releasePackages(options);
    await releaseGithub(options);
  } catch {
    process.exit(1);
  }
}

function parseOptions(args) {
  const options = [
    args.dry ? '--dry-run' : '',
    args.interactive ? '' : '--ci',
  ].filter((o) => o);

  const invalidArgumentError = (message) => {
    console.error(c.red(
      `Invalid option: ${message}`,
    ));

    process.exit(1);
  };

  if ([undefined, 'alpha', 'beta'].indexOf(args.prerelease) === -1) {
    invalidArgumentError('"prerelease" must be set to "alpha" or "beta" when defined.');
  }

  if ([undefined, 'patch', 'minor', 'major'].indexOf(args.increment) === -1) {
    invalidArgumentError('"increment" must be set to "patch", "minor" or "major" when defined.');
  }

  if (args.increment === undefined && args.prerelease === undefined) {
    invalidArgumentError('either "increment" or "prerelease" must be set release a new version.');
  }

  if (args.prerelease !== undefined) {
    return [
      `--preRelease=${args.prerelease}`,
      '--npm.tag=next',
      ...(args.increment !== undefined ? [`--increment=${args.increment}`] : []),
      ...options,
    ];
  }

  return [
    `--increment=${args.increment}`,
    ...options,
  ];
}

async function releasePackages(options) {
  await execa({ stdio: 'inherit' })`yarn ${[
    'workspaces',
    'foreach',
    'run',
    'release',
    '--verbose',
    ...options,
  ]}`;
}

async function releaseGithub(options) {
  await execa({ stdio: 'inherit' })`release-it ${options}`;
}
