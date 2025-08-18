import { Colors } from '@api';
import chalk from 'chalk';
import { log } from '../logger';
import { runCommand } from './runCommand';
const cp = require('child-process-es6-promise');

/**
 * Checks if Git is installed and available in the system by executing `git --version`.
 *
 * @throws Will log an error and throw if Git is not found in the system.
 * @remarks
 * If Git is not available, this function logs an error message and a tip to install Git,
 * then rethrows the error.
 */
export const checkGit = () => {
  try {
    cp.execSync('git --version');
  } catch (e) {
    log.error(Colors.ERROR(`❌ ${chalk.bold('git')} is not available in your system.`));
    log.info(Colors.YELLOW('💡 Tip: Install git from https://git-scm.com/downloads and try again.'));
    throw e;
  }
};

/**
 * Checks if the current working directory is inside a Git repository.
 *
 * Executes the `git rev-parse --git-dir` command to determine if the directory is part of a Git repository.
 * If not, logs an error message, provides a helpful tip, outputs the error details in verbose mode,
 * and exits the process with a non-zero status code.
 *
 * @remarks
 * This function will terminate the process if the directory is not a Git repository.
 *
 * @throws Will exit the process if the current directory is not a Git repository.
 */
export const checkIfInGitRepo = () => {
  try {
    cp.execSync('git rev-parse --git-dir');
  } catch (e) {
    log.error(Colors.ERROR('❌ The current working directory is not a git repository.'));
    log.info(Colors.YELLOW('💡 Tip: Run this command inside a folder initialized with git (git init).'));
    log.verbose(e);
    process.exit(1);
  }
};

/**
 * Creates a new Git tag with the specified name in the given repository root.
 * The tag message is set to the title of the latest commit, or a default message if unavailable.
 *
 * @param tagName - The name of the tag to create.
 * @param root - The root directory of the Git repository.
 * @returns The result of the tag creation command.
 */
export const tag = (tagName: string, root: string) => {
  // Obtener el título del último commit
  const lastCommitTitle =
    runCommand('git log -1 --pretty=%s', root, '', true)?.toString().trim() || `Release ${tagName}`;
  return runCommand(`git tag ${tagName} -m "${lastCommitTitle}"`, root, `Tag created: ${tagName}`, true);
};

/**
 * Generates a git push command string, optionally including a tag push.
 *
 * @param tagName - The name of the git tag to push.
 * @param noTag - If true, skips pushing the tag; if false or undefined, includes the tag push.
 * @returns The constructed git push command string.
 */
export const pushCommand = (tagName: string, noTag: boolean | undefined) => {
  let command = 'git push --force';
  if (!noTag) {
    command += ` && git push origin ${tagName} --force`;
  }
  return command;
};

/**
 * Retrieves the current git status of the specified repository root using the `git status --porcelain` command.
 *
 * @param root - The file system path to the root of the git repository.
 * @returns The output of the git status command, typically as a string or a promise resolving to the command result.
 */
export const gitStatus = (root: string) => {
  return runCommand('git status --porcelain', root, '', true);
};

/**
 * Retrieves the list of Git commit hashes and messages from the repository at the specified root directory.
 *
 * @param root - The file system path to the root of the Git repository.
 * @returns The result of executing the `git rev-list HEAD --pretty=oneline` command in the specified directory.
 */
export const getGitCommits = (root: string) => {
  return runCommand(`git rev-list HEAD --pretty=oneline`, root, '', true, 0, true);
};

/**
 * Retrieves the most recent Git tag in the specified repository root.
 *
 * Executes the `git describe --tags --abbrev=0` command to find the latest tag.
 * If no tags are found, logs an error and a helpful tip, then returns `null`.
 *
 * @param root - The file system path to the root of the Git repository.
 * @returns The latest Git tag as a string, or `null` if no tags are found.
 */
export const getTheLastTag = (root: string) => {
  try {
    const tags = runCommand('git describe --tags --abbrev=0', root, '', true, 0, true, false);
    if (tags) {
      return tags.toString();
    } else {
      log.error(Colors.ERROR('❌ No tags found in this repository.'));
      log.info(Colors.YELLOW('💡 Tip: Create a tag with git tag <tagname> to start versioning.'));
      return null;
    }
  } catch {
    log.error(Colors.ERROR('❌ No tags found in this repository.'));
    log.info(Colors.YELLOW('💡 Tip: Create a tag with git tag <tagname> to start versioning.'));
    return null;
  }
};

/**
 * Retrieves the remote origin URL of a Git repository located at the specified root directory.
 *
 * This function executes the `git config --get remote.origin.url` command within the given root directory,
 * processes the resulting URL by removing any trailing newline and the `.git` suffix, and sanitizes the URL
 * by removing any embedded credentials from the host portion.
 *
 * @param root - The file system path to the root directory of the Git repository.
 * @returns The sanitized remote origin URL as a string, or `undefined` if the command fails.
 */
export const getOriginUrl = (root: string) => {
  const url = runCommand(`git config --get remote.origin.url`, root, '', true, 0, true)
    ?.toString()
    .replace('\n', '')
    .replace('.git', '');

  return url.replace(/https?:\/\/[^@]*@/, 'https://');
};
