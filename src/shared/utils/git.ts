import { Colors } from '@api';
import { log } from '../logger';
import chalk from 'chalk';
import { runCommand } from './runCommand';

const cp = require('child-process-es6-promise');

/**
 * The function `checkGit` checks if Git is available in the system and throws an error if it is not.
 */
export const checkGit = () => {
  try {
    cp.execSync('git --version');
  } catch (e) {
    log.error(
      Colors.ERROR(`${chalk.bold(`git`)} is not available in your system. \
    Please install ${chalk.bold(`git`)} and try again.`),
    );
    throw e;
  }
};

/**
 * The function `checkIfInGitRepo` checks if the current working directory is a git repository in
 * TypeScript.
 */
export const checkIfInGitRepo = () => {
  try {
    cp.execSync('git rev-parse --git-dir');
  } catch (e) {
    log.error(
      Colors.ERROR(
        `the current working directory is not a git repository, please run this command in a git repository`,
      ),
    );
    log.verbose(e);
    process.exit(1);
  }
};

export const tag = (tagName: string, root: string) => {
  const tagMessage = `Release ${tagName}`;
  return runCommand(`git tag ${tagName} -m "${tagMessage}"`, root, `Tag created: ${tagName}`, true);
};

export const pushCommand = (tagName: string, noTag: boolean | undefined) => {
  return `git push ${noTag ? '' : `&& git push origin ${tagName}`}`;
};

export const gitStatus = (root: string) => {
  return runCommand('git status --porcelain', root, '', true);
};
