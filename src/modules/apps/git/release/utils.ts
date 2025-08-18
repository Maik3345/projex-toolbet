import { Colors, promptConfirm } from '@api';
import {
  getGitCommits,
  getOriginUrl,
  getTheLastTag,
  gitStatus,
  log,
  pushCommand,
  ReleaseTypeEnums,
  runCommand,
  VersionFileUtils,
} from '@shared';
import chalk from 'chalk';
import { close, existsSync, openSync, readFileSync, writeSync } from 'fs-extra';
import { ReleaseType } from 'semver';
import { organizeCommitsToChangelog, validateVersion } from './changelog';

/**
 * Utility class for managing release-related operations in a Git repository.
 *
 * The `ReleaseUtils` class provides methods for:
 * - Committing version and changelog files with formatted messages.
 * - Pushing commits and tags to remote repositories.
 * - Checking for uncommitted changes.
 * - Running pre-release and post-release scripts.
 * - Confirming release actions with the user.
 * - Updating and formatting changelog files.
 * - Generating release metadata and changelog headers.
 *
 * This class integrates with Git and supports both Azure DevOps and GitHub repository URLs for changelog comparison links.
 *
 * @remarks
 * - Relies on `VersionFileUtils` for file and script management.
 * - Uses external utilities for Git operations, logging, and user prompts.
 * - Handles both stable and prerelease workflows.
 *
 * @example
 * ```typescript
 * const releaseUtils = new ReleaseUtils();
 * await releaseUtils.preRelease({ releaseType: 'prerelease' });
 * const releaseInfo = releaseUtils.getRelease('stable');
 * releaseUtils.updateChangelog(releaseInfo.changelogVersion, releaseInfo.changelog);
 * releaseUtils.commit(releaseInfo.tagText, releaseInfo.releaseType);
 * releaseUtils.push(releaseInfo.tagText, false);
 * ```
 */
export class ReleaseUtils {
  public versionFileUtils = new VersionFileUtils();

  /**
   * Commits version and changelog files to the git repository with a formatted commit message.
   *
   * The commit message is determined by the release type:
   * - For prerelease or pre, uses "chore(beta): beta release".
   * - Otherwise, uses "chore(main): release".
   * The tag name is appended to the commit message.
   *
   * If a changelog file exists, both the version file and changelog file are included in the success message.
   *
   * @param tagName - The name of the tag to include in the commit message.
   * @param releaseType - The type of release ("prerelease", "pre", or other).
   * @returns The result of the git commit command execution.
   */
  public commit = (tagName: string, releaseType: string) => {
    const beta = releaseType === 'prerelease' || releaseType === 'pre';
    const commitIcon = beta ? 'chore(beta): beta release' : 'chore(main): release';
    const commitMessage = `${commitIcon} ${tagName}`;
    let successMessage = `file(s) ${this.versionFileUtils.versionFile} committed`;
    if (existsSync(this.versionFileUtils.changelogPath)) {
      successMessage = `files ${this.versionFileUtils.versionFile} ${this.versionFileUtils.changelogPath} committed`;
    }
    return runCommand(`git commit -m "${commitMessage}"`, this.versionFileUtils.root, successMessage, true);
  };

  /**
   * Pushes the current commit and optionally a tag to the remote repository.
   *
   * @param tagName - The name of the tag to push.
   * @param noTag - If true, only the commit is pushed; if false or undefined, both the commit and the tag are pushed.
   * @returns A promise that resolves when the push operation is complete.
   */
  public push = (tagName: string, noTag: boolean | undefined) => {
    return runCommand(
      pushCommand(tagName, noTag),
      this.versionFileUtils.root,
      `pushed commit${noTag ? '' : ' and tag ' + tagName}`,
      true,
      2,
    );
  };

  /**
   * Checks if there are no changes to commit in the Git repository at the root directory.
   *
   * @returns `true` if there are no changes to commit; otherwise, `false`.
   */
  public checkNothingToCommit = () => {
    const response = gitStatus(this.versionFileUtils.root).toString();
    return !response;
  };

  /**
   * Attempts to perform a forced `git push` operation in the repository's root directory.
   *
   * If the push fails, logs an error message with the failure reason.
   *
   * @returns void
   */
  public checkIfGitPushWorks = () => {
    try {
      runCommand('git push --force', this.versionFileUtils.root, '', true, 2, true);
    } catch (e) {
      log.error(Colors.ERROR(`failed pushing to remote. ${e}`));
    }
  };

  /**
   * Handles the pre-release process for a project, including checks for uncommitted changes,
   * and running appropriate pre-release scripts based on the release type.
   *
   * @param params - The options for the pre-release process.
   * @param params.noPreRelease - If true, skips the pre-release process.
   * @param params.checkPreRelease - If true, skips the check for uncommitted changes.
   * @param params.releaseType - The type of release being performed.
   * @returns A promise that resolves when the pre-release process is complete.
   *
   * @throws Will exit the process with code 1 if there are uncommitted changes and `checkPreRelease` is not set.
   */
  public preRelease = async ({
    checkPreRelease,
    noPreRelease,
    releaseType,
  }: {
    noPreRelease?: boolean;
    checkPreRelease?: boolean;
    releaseType: ReleaseType;
  }) => {
    if (!checkPreRelease) {
      if (!this.checkNothingToCommit()) {
        log.warn(
          chalk.red(
            'process could not continue because there are uncommitted changes, Please commit your changes before proceeding.',
          ),
        );
        process.exit(1);
      }
    }

    if (noPreRelease) return;

    if (releaseType === ReleaseTypeEnums.Prerelease && this.versionFileUtils.findScript('prerelease-beta')) {
      return await this.versionFileUtils.runFindScript('prerelease-beta', 'beta release');
    }

    if (this.versionFileUtils.findScript('prerelease')) {
      return await this.versionFileUtils.runFindScript('prerelease', 'pre release');
    }
  };

  /**
   * Prompts the user to confirm whether they want to proceed with releasing a new version.
   *
   * Displays a confirmation message with the specified version number. If the user confirms,
   * the function returns `true`; otherwise, it logs a warning and returns `false`.
   *
   * @param newVersion - The version string to be released.
   * @returns A promise that resolves to `true` if the user confirms the release, or `false` if aborted.
   */
  public confirmRelease = async (newVersion: string): Promise<boolean> => {
    const answer = await promptConfirm(
      chalk.green(`are you sure you want to release with version ${chalk.blue(newVersion)}?`),
    );
    if (!answer) {
      log.warn('aborted release.');
      return false;
    }
    return true;
  };

  /**
   * Executes a post-release script if available, unless explicitly skipped.
   *
   * This method checks for the existence of either a 'postrelease' or 'postreleasy'
   * script using `versionFileUtils`. If found, it runs the corresponding script with
   * a message indicating a post-release operation. If the `noPostRelease` flag is set
   * to `true`, the method exits early without executing any scripts.
   *
   * @param noPostRelease - Optional flag to skip the post-release step if set to `true`.
   * @returns The result of the executed post-release script, or `undefined` if no script is found or execution is skipped.
   */
  public postRelease = (noPostRelease?: boolean) => {
    if (noPostRelease) return;

    const msg = 'post release';
    if (this.versionFileUtils.findScript('postrelease')) {
      return this.versionFileUtils.runFindScript('postrelease', msg);
    }
    if (this.versionFileUtils.findScript('postreleasy')) {
      return this.versionFileUtils.runFindScript('postreleasy', msg);
    }
  };

  /**
   * Updates the changelog file by prepending the provided changelog content to the existing file.
   *
   * @param changelogVersion - The version string associated with the changelog update.
   * @param changelog - The new changelog content to add to the top of the changelog file.
   * @throws Will log an error and exit the process if writing to the file fails.
   */
  public updateChangelog = (changelogVersion: string, changelog: string) => {
    try {
      const changelogPath = this.versionFileUtils.changelogPath;
      let changelogContent = '';
      if (existsSync(changelogPath)) {
        changelogContent = readFileSync(changelogPath, 'utf8');
      }
      const newChangelogContent = `${changelog}\n${changelogContent}`;
      const fd = openSync(changelogPath, 'w');
      writeSync(fd, newChangelogContent, undefined, 'utf8');
      close(fd);
      log.info(`successfully added the new changes to the CHANGELOG.md file.`);
    } catch (e) {
      log.error(`error writing file: ${e}`);
      process.exit(1);
    }
  };

  /**
   * Generates a formatted changelog header string for a given new version, including a comparison URL and the current date.
   *
   * The generated string includes:
   * - The new version number.
   * - A URL comparing the last tag to the new version (for Azure DevOps or GitHub repositories).
   * - The current date in `YYYY-MM-DD` format.
   *
   * @param newVersion - The new version string to include in the changelog header.
   * @returns A formatted changelog header string with a comparison link and date.
   */
  private readonly getChangelogDate = (newVersion: string) => {
    const lastTag = getTheLastTag(this.versionFileUtils.root);
    const originUrl = getOriginUrl(this.versionFileUtils.root);
    let compareTagUrl = '';

    if (lastTag) {
      // Support for Azure DevOps and GitHub only for now
      if (originUrl.includes('https://dev.azure.com')) {
        compareTagUrl = `${originUrl}/branchCompare?baseVersion=GT${lastTag?.replace(
          /\n+$/,
          '',
        )}&targetVersion=GTv${newVersion}`;
      } else {
        compareTagUrl = `${originUrl}/compare/${lastTag?.replace(/\n+$/, '')}...v${newVersion}`;
      }
    } else {
      if (originUrl.includes('https://dev.azure.com')) {
        compareTagUrl = `${originUrl}?version=GTv${newVersion}`;
      } else {
        compareTagUrl = `${originUrl}/releases/tag/v${newVersion}`;
      }
    }

    const [month, day, year] = new Date()
      .toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
      .split('/');

    return `\n\n## [${newVersion}](${compareTagUrl}) - (${year}-${month}-${day})`;
  };

  /**
   * Generates release information based on the provided tag name.
   *
   * Determines the release type (e.g., 'prerelease' or 'stable'), generates a changelog if applicable,
   * validates and increments the version, and returns all relevant release metadata.
   *
   * @param tagName - The name of the release tag (e.g., 'stable', 'beta', etc.).
   * @returns An object containing the release type, old and new version numbers, tag text, changelog version, and changelog content.
   * @throws Will log an error and exit the process if the release type is invalid.
   */
  public getRelease = (tagName: string) => {
    let releaseType: ReleaseType | null = tagName !== 'stable' ? 'prerelease' : null;
    let changelog: string = '';

    if (tagName === 'stable') {
      const commits = getGitCommits(this.versionFileUtils.root).toString();
      const changelogContent = organizeCommitsToChangelog(commits, getOriginUrl(this.versionFileUtils.root));
      releaseType = releaseType || changelogContent.releaseType;
      changelog = changelogContent.changelog;
    }

    if (!releaseType) {
      log.error(Colors.ERROR(`invalid release type: ${tagName}`));
      process.exit(1);
    }

    const oldVersion = this.versionFileUtils.readVersion();
    const newVersion = this.versionFileUtils.incrementVersion(oldVersion, releaseType, tagName);
    validateVersion(oldVersion, releaseType, tagName);
    const tagText = `v${newVersion}`;
    const changelogVersion = this.getChangelogDate(String(newVersion));

    return {
      releaseType,
      oldVersion,
      newVersion: String(newVersion),
      tagText,
      changelogVersion,
      changelog,
    };
  };
}
