import { Colors, getAppRoot, promptConfirm } from '@api';
import { gitStatus, log, pushCommand, runCommand, unreleased } from '@shared';
import { close, existsSync, openSync, readFileSync, readJsonSync, writeJsonSync, writeSync } from 'fs-extra';
import { resolve } from 'path';
import { ReleaseType, inc, valid } from 'semver';
const cp = require('child-process-es6-promise');
const fs = require('fs');
const chalk = require('chalk');

export class ReleaseUtils {
  public root: string;
  private manifestVersionFile: string;
  private packageVersionFile: string;
  private versionFile: string = '';
  private changelogPath: string;

  constructor() {
    this.root = getAppRoot();
    this.manifestVersionFile = resolve(this.root, 'manifest.json');
    this.packageVersionFile = resolve(this.root, 'package.json');

    this.changelogPath = resolve(this.root, 'CHANGELOG.md');
  }

  public checkDirectory = (repository: string) => {
    try {
      return fs.existsSync(repository);
    } catch (error) {
      return false;
    }
  };

  private readVersionFile = () => {
    if (this.checkDirectory(this.manifestVersionFile)) {
      this.versionFile = this.manifestVersionFile;
      return readJsonSync(this.manifestVersionFile);
    } else if (this.checkDirectory(this.packageVersionFile)) {
      this.versionFile = this.packageVersionFile;
      return readJsonSync(this.packageVersionFile);
    } else {
      log.error(
        `${Colors.ERROR('version file not found:')} ${this.manifestVersionFile} or ${this.packageVersionFile}.`,
      );
      throw new Error(`Manifest or package.json not found in ${this.root} directory`);
    }
  };

  private writeVersionFile = (newManifest: any) => {
    writeJsonSync(this.versionFile, newManifest, { spaces: 2 });
  };

  public readVersion = () => {
    const version = valid(this.readVersionFile().version, true);
    if (!version) {
      throw new Error(`Invalid app version: ${version}`);
    }
    return version;
  };

  public incrementVersion = (rawOldVersion: string, releaseType: ReleaseType, tagName: string) => {
    const oldVersion = valid(rawOldVersion, true);
    if (tagName !== 'stable' && releaseType !== 'prerelease') {
      return inc(String(oldVersion), `pre${releaseType}` as ReleaseType, false, tagName);
    }
    return inc(String(oldVersion), releaseType);
  };

  public commit = (tagName: string, releaseType: string) => {
    const commitIcon =
      releaseType === 'prerelease' || releaseType === 'pre' ? ':construction: beta release' : ':rocket: release';
    const commitMessage = `build: ${commitIcon} ${tagName}`;
    let successMessage = `file(s) ${this.versionFile} committed`;
    if (existsSync(this.changelogPath)) {
      successMessage = `files ${this.versionFile} ${this.changelogPath} committed`;
    }
    return runCommand(`git commit -m "${commitMessage}"`, this.root, successMessage, true);
  };

  public push = (tagName: string, noTag: boolean | undefined) => {
    return runCommand(
      pushCommand(tagName, noTag),
      this.root,
      `pushed commit ${noTag ? '' : `and tag ${tagName}`}`,
      true,
      2,
    );
  };

  public checkNothingToCommit = () => {
    const response = gitStatus(this.root).toString();
    return !response;
  };

  public checkIfGitPushWorks = () => {
    try {
      runCommand('git push', this.root, '', true, 2, true);
    } catch (e) {
      log.error(Colors.ERROR(`failed pushing to remote.`));
      throw e;
    }
  };

  /* The `preRelease` method is a function that is used to perform pre-release tasks before creating a
  new release. Here is a breakdown of what it does: */
  public preRelease = () => {
    const msg = 'Pre release';
    if (!this.checkNothingToCommit()) {
      log.warn(
        chalk.red(
          'process could not continue because there are uncommitted changes, Please commit your changes before proceeding.',
        ),
      );
      process.exit(1);
    }
    this.checkIfGitPushWorks();
    const key = 'prereleasy';
    this.runScript(key, msg);
    if (!this.checkNothingToCommit()) {
      const commitMessage = `pre release commit\n\n ${this.getScript(key)}`;
      return this.commit(commitMessage, 'prerelease');
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

  public postRelease = () => {
    const msg = 'post release';
    if (this.getScript('postrelease')) {
      return this.runScript('postrelease', msg);
    }
    if (this.getScript('postreleasy')) {
      return this.runScript('postreleasy', msg);
    }
  };

  public add = () => {
    let gitAddCommand = `git add "${this.versionFile}"`;
    let successMessage = `file ${this.versionFile} added`;
    if (existsSync(this.changelogPath)) {
      gitAddCommand += ` "${this.changelogPath}"`;
      successMessage = `files ${this.versionFile} ${this.changelogPath} added`;
    }
    return runCommand(gitAddCommand, this.root, successMessage, true);
  };

  public readAppName = () => {
    const vendor = this.readVersionFile().vendor;
    return `${vendor ? `${vendor}.` : ''}${this.readVersionFile().name}`;
  };

  public updateChangelog = (changelogVersion: any) => {
    if (existsSync(this.changelogPath)) {
      let data: string;
      try {
        data = readFileSync(this.changelogPath).toString();
      } catch (e) {
        throw new Error(`Error reading file: ${e}`);
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
        const bufferedText = Buffer.from(`${changelogVersion}${data.substring(position)}`);
        const file = openSync(this.changelogPath, 'r+');
        try {
          writeSync(file, bufferedText, 0, bufferedText.length, position);
          close(file);
          log.info(`successfully added the new changes to the CHANGELOG.md file.`);
        } catch (e) {
          throw new Error(`error writing file: ${e}`);
        }
      }
    }
  };

  public bump = (newVersion: string) => {
    const manifest = this.readVersionFile();
    manifest.version = newVersion;
    this.writeVersionFile(manifest);
    log.info(`bumped version to ${chalk.bold.green(newVersion)}`);
  };

  private getScript = (key: string): string => {
    const versionFile = this.readVersionFile();
    return versionFile.scripts && versionFile.scripts[key];
  };

  private runScript = (key: string, msg: string) => {
    const cmd: string = this.getScript(key);
    return cmd ? runCommand(cmd, this.root, msg, false) : undefined;
  };
}
