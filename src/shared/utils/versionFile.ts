import { Colors, getAppRoot } from '@api';
import { log, runCommand } from '@shared';
import { existsSync, readJsonSync, writeJsonSync } from 'fs-extra';
import { inc, ReleaseType, valid } from 'semver';

import { resolve } from 'path';
const fs = require('fs');
const chalk = require('chalk');

interface VersionFileContent {
  version: string;
  scripts: {
    [key: string]: string;
  };
}

export class VersionFileUtils {
  public root: string;
  public manifestVersionFile: string;
  public packageVersionFile: string;
  public manifestFile: string = '';
  public packageFile: string = '';
  public manifestContent: VersionFileContent | null = null;
  public packageJsonContent: VersionFileContent | null = null;
  public versionFile: string = '';
  public versionContent: any = null;
  public changelogPath: string;

  constructor() {
    this.root = getAppRoot();
    this.manifestVersionFile = resolve(this.root, 'manifest.json');
    this.packageVersionFile = resolve(this.root, 'package.json');
    this.changelogPath = resolve(this.root, 'CHANGELOG.md');
    this.readVersionFile();
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
      this.manifestFile = this.manifestVersionFile;
      this.manifestContent = readJsonSync(this.manifestVersionFile);
    }
    if (this.checkDirectory(this.packageVersionFile)) {
      this.packageFile = this.packageVersionFile;
      this.packageJsonContent = readJsonSync(this.packageVersionFile);
    }

    if (!this.manifestContent && !this.packageJsonContent) {
      log.error(
        `${Colors.ERROR('version file not found:')} ${this.manifestVersionFile} or ${this.packageVersionFile}.`,
      );
      process.exit(1);
    }

    this.versionFile = this.manifestFile || this.packageFile;
    this.versionContent = this.manifestContent || this.packageJsonContent;
  };

  public writeVersionFile = (newVersion: string) => {
    const contentPackageJson = this.packageJsonContent;
    const contentManifest = this.manifestContent;

    if (contentPackageJson) {
      contentPackageJson.version = newVersion;
      writeJsonSync(this.packageFile, contentPackageJson, { spaces: 2 });
    }

    if (contentManifest) {
      contentManifest.version = newVersion;
      writeJsonSync(this.manifestFile, contentManifest, { spaces: 2 });
    }
  };

  public readVersion = () => {
    const version = valid(this.versionContent?.version, true);
    if (!version) {
      log.error(Colors.ERROR(`invalid app version: ${version}`));
      process.exit(1);
    }
    return version;
  };

  public incrementVersion = (rawOldVersion: string, releaseType: ReleaseType, tagName?: string) => {
    const oldVersion = valid(rawOldVersion, true);
    if (tagName !== 'stable' && releaseType !== 'prerelease') {
      return inc(String(oldVersion), `pre${releaseType}` as ReleaseType, false, tagName);
    }
    return inc(String(oldVersion), releaseType);
  };

  public bump = (newVersion: string) => {
    this.writeVersionFile(newVersion);
    log.info(`bumped version to ${chalk.bold.green(newVersion)}`);
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

  private getVersionFileToUse = () => {
    return this.manifestContent || this.packageJsonContent;
  };

  public readAppName = () => {
    const vendor = this.versionContent?.vendor;
    const name = this.versionContent?.name;
    return `${vendor ? `${vendor}.` : ''}${name}`;
  };

  private getScript = (key: string): string => {
    const versionFile = this.getVersionFileToUse();
    if (!versionFile) {
      log.error('no version file found');
      process.exit(1);
    }

    return versionFile.scripts && versionFile.scripts[key];
  };

  public findScript = (key: string) => {
    if (this.manifestContent || this.packageJsonContent) {
      const scriptInManifestFile = this.manifestContent?.scripts && this.manifestContent?.scripts[key];
      const scriptInPackageFile = this.packageJsonContent?.scripts && this.packageJsonContent?.scripts[key];

      if (scriptInManifestFile) {
        return scriptInManifestFile;
      } else if (scriptInPackageFile) {
        return scriptInPackageFile;
      } else {
        log.warn(`no script found for ${key}`);
      }
    }
  };

  public runFindScript = (key: string, msg: string) => {
    const cmd = this.findScript(key);
    return cmd ? runCommand(cmd, this.root, msg, false) : log.warn(`no script found for ${key}`);
  };

  public runScript = (key: string, msg: string) => {
    const cmd: string = this.getScript(key);
    return cmd ? runCommand(cmd, this.root, msg, false) : log.warn(`no script found for ${key}`);
  };

  public getVersionInformation = (oldVersion: string, newVersion: string, pushCommandText: string) => {
    return {
      oldVersion,
      newVersion,
      pushCommandText,
      appName: this.readAppName(),
    };
  };
}
