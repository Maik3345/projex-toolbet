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
  unreleased,
  VersionFileUtils,
} from '@shared';
import { close, existsSync, openSync, readFileSync, writeSync } from 'fs-extra';
import { ReleaseType } from 'semver';
import { organizeCommitsToChangelog, validateVersion } from './changelog';
import chalk from 'chalk';


export class ReleaseUtils {
  public versionFileUtils = new VersionFileUtils();

  constructor() {}

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

  public push = (tagName: string, noTag: boolean | undefined) => {
    return runCommand(
      pushCommand(tagName, noTag),
      this.versionFileUtils.root,
      `pushed commit ${noTag ? '' : `and tag ${tagName}`}`,
      true,
      2,
    );
  };

  public checkNothingToCommit = () => {
    const response = gitStatus(this.versionFileUtils.root).toString();
    return !response;
  };

  public checkIfGitPushWorks = () => {
    try {
      runCommand('git push', this.versionFileUtils.root, '', true, 2, true);
    } catch (e) {
      log.error(Colors.ERROR(`failed pushing to remote. ${e}`));
    }
  };

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

  public updateChangelog = (changelogVersion: string, changelog: string) => {
    if (existsSync(this.versionFileUtils.changelogPath)) {
      let data: string;
      try {
        data = readFileSync(this.versionFileUtils.changelogPath).toString();
      } catch (e) {
        log.error(`error reading file: ${e}`);
        process.exit(1);
      }
      if (data.indexOf(unreleased) < 0) {
        log.info(
          chalk.red.bold(
            `i can't update your CHANGELOG. :( \n
          Make your CHANGELOG great again and follow the CHANGELOG format
          http://keepachangelog.com/en/1.0.0/`,
          ),
        );
      } else {
        const position = data.indexOf(unreleased) + unreleased.length;
        const bufferedText = Buffer.from(`${changelogVersion}\n${changelog}${data.substring(position)}`);
        const file = openSync(this.versionFileUtils.changelogPath, 'r+');
        try {
          writeSync(file, bufferedText, 0, bufferedText.length, position);
          close(file);
          log.info(`successfully added the new changes to the CHANGELOG.md file.`);
        } catch (e) {
          log.error(`error writing file: ${e}`);
          process.exit(1);
        }
      }
    }
  };

  private getChangelogDate = (newVersion: string) => {
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

  public getRelease = (tagName: string) => {
    let releaseType: ReleaseType | null = tagName !== 'stable' ? 'prerelease' : null;
    let changelog: string = '';

    if (tagName === 'stable') {
      const commits = getGitCommits(this.versionFileUtils.root).toString();
      const changelogContent = organizeCommitsToChangelog(commits, getOriginUrl(this.versionFileUtils.root));
      releaseType = releaseType ? releaseType : changelogContent.releaseType;
      changelog = changelogContent.changelog;
    }

    if (!releaseType) {
      log.error(Colors.ERROR(`invalid release type: ${tagName}`));
      process.exit(1);
    }

    const oldVersion = this.versionFileUtils.readVersion();
    const newVersion = this.versionFileUtils.incrementVersion(oldVersion, releaseType, tagName);
    // validate version
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
