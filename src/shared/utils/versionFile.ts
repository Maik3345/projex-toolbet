import { Colors, getAppRoot } from '@api';
import { log, runCommand } from '@shared';
import { existsSync, readJsonSync, writeJsonSync } from 'fs-extra';
import { inc, ReleaseType, valid } from 'semver';

import { resolve } from 'path';
const fs = require('fs');
import chalk from 'chalk';

interface VersionFileContent {
  version: string;
  scripts: {
    [key: string]: string;
  };
  projex: {
    releaseFiles: string[];
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
    } catch {
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

  public getReleaseFilesFromConfig = (): string[] => {
    const contentPackageJson = this.packageJsonContent;
    const contentManifest = this.manifestContent;

    let releaseFiles: string[] = [];

    if (contentPackageJson && contentPackageJson.projex && contentPackageJson.projex.releaseFiles) {
      releaseFiles = contentPackageJson.projex.releaseFiles;
    } else if (contentManifest && contentManifest.projex && contentManifest.projex.releaseFiles) {
      releaseFiles = contentManifest.projex.releaseFiles;
    }

    return releaseFiles;
  };

  public updateReleaseFilesVersion = (newVersion: string): void => {
    const releaseFiles = this.getReleaseFilesFromConfig();

    releaseFiles.forEach((file) => {
      const resolveFile = resolve(this.root, file);
      const content = readJsonSync(resolveFile);
      const oldVersion = content.version;
      content.version = newVersion;
      writeJsonSync(file, content, { spaces: 2 });
      log.info(
        `bumped version ${chalk.bold.yellow(oldVersion)} -> ${chalk.bold.green(newVersion)} in ${chalk.bold.blue(
          file,
        )}`,
      );
    });
  };

  public addReleaseFiles = (): void => {
    const releaseFiles = this.getReleaseFilesFromConfig();
    let gitAddCommand = 'git add ';
    let successMessage = 'files added:';
    releaseFiles.forEach((file) => {
      const resolveFile = resolve(this.root, file);
      gitAddCommand += ` "${resolveFile}"`;
      successMessage += ` ${resolveFile}`;
    });
    return runCommand(gitAddCommand, this.root, successMessage, true);
  };

  public writeVersionFile = (newVersion: string) => {
    const contentPackageJson = this.packageJsonContent;
    const contentManifest = this.manifestContent;

    if (contentPackageJson) {
      const oldVersion = contentPackageJson.version;
      contentPackageJson.version = newVersion;

      writeJsonSync(this.packageFile, contentPackageJson, { spaces: 2 });
      log.info(
        `bumped version ${chalk.bold.yellow(oldVersion)} -> ${chalk.bold.green(newVersion)} in ${chalk.bold.blue(
          this.packageFile,
        )}`,
      );
    }

    if (contentManifest) {
      const oldVersion = contentManifest.version;
      contentManifest.version = newVersion;
      writeJsonSync(this.manifestFile, contentManifest, { spaces: 2 });
      log.info(
        `bumped version ${chalk.bold.yellow(oldVersion)} -> ${chalk.bold.green(newVersion)} in ${chalk.bold.blue(
          this.manifestFile,
        )}`,
      );
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
  };

  public add = () => {
    let gitAddCommand = 'git add ';
    let successMessage = 'files added:';

    if (existsSync(this.manifestFile)) {
      gitAddCommand += ` "${this.manifestFile}"`;
      successMessage += ` ${this.manifestFile}`;
    }
    if (existsSync(this.packageFile)) {
      gitAddCommand += ` "${this.packageFile}"`;
      successMessage += ` ${this.packageFile}`;
    }
    if (existsSync(this.changelogPath)) {
      gitAddCommand += ` "${this.changelogPath}"`;
      successMessage = ` ${this.changelogPath}`;
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
    return cmd ? runCommand(cmd, this.root, msg, false) : log.verbose(`no script found for ${key}`);
  };

  public runScript = (key: string, msg: string) => {
    const cmd: string = this.getScript(key);
    return cmd ? runCommand(cmd, this.root, msg, false) : log.verbose(`no script found for ${key}`);
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
