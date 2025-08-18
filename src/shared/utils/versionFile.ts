import { Colors, getAppRoot } from '@api';
// Dependencias inyectables para facilitar testeo
type FsLike = {
  existsSync: typeof fs.existsSync;
  readJsonSync: typeof readJsonSync;
  writeJsonSync: typeof writeJsonSync;
};
type LogLike = typeof log;
type RunCommandLike = typeof runCommand;
type ProcessExitLike = typeof process.exit;

import { log, runCommand } from '@shared';
import { existsSync, readJsonSync, writeJsonSync } from 'fs-extra';
import { inc, ReleaseType, valid } from 'semver';

import chalk from 'chalk';
import fs from 'fs';
import { resolve } from 'path';

interface VersionFileContent {
  version: string;
  scripts: {
    [key: string]: string;
  };
  projex: {
    releaseFiles: string[];
  };
}

/**
 * Utility class for managing version-related files and operations in a project.
 *
 * `VersionFileUtils` provides methods to read, update, and validate version information
 * from key project files such as `manifest.json` and `package.json`. It also supports
 * handling release files, updating their versions, staging them for git, and running
 * scripts defined in these files.
 *
 * Key features:
 * - Reads and prioritizes version information from `manifest.json` or `package.json`.
 * - Updates version fields in release files and main project files.
 * - Adds relevant files to the git staging area.
 * - Validates semantic version strings.
 * - Increments versions according to semantic versioning rules.
 * - Retrieves and executes scripts defined in the project configuration.
 * - Provides utility methods for accessing project metadata such as the application name.
 *
 * Dependencies:
 * - File system utilities for reading and writing JSON files.
 * - Logging utilities for colored and informative output.
 * - Semantic versioning utilities for validation and incrementing.
 * - Command execution utilities for running shell commands.
 *
 * Usage:
 * Instantiate the class to automatically load version files and provide access to
 * version management methods for use in release automation, CI/CD pipelines, or
 * custom project tooling.
 */
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

  private fs: FsLike;
  private log: LogLike;
  private runCommand: RunCommandLike;
  private processExit: ProcessExitLike;

  constructor(opts?: {
    fs?: FsLike;
    log?: LogLike;
    runCommand?: RunCommandLike;
    processExit?: ProcessExitLike;
  }) {
    this.fs = opts?.fs || { existsSync, readJsonSync, writeJsonSync };
    this.log = opts?.log || log;
    this.runCommand = opts?.runCommand || runCommand;
    this.processExit = opts?.processExit || process.exit;
    this.root = getAppRoot();
    this.manifestVersionFile = resolve(this.root, 'manifest.json');
    this.packageVersionFile = resolve(this.root, 'package.json');
    this.changelogPath = resolve(this.root, 'CHANGELOG.md');
    this.readVersionFile();
  }

  /**
   * Checks if the specified directory exists in the file system.
   *
   * @param repository - The path to the directory to check.
   * @returns `true` if the directory exists, otherwise `false`.
   */
  public checkDirectory = (repository: string) => {
    try {
      return this.fs.existsSync(repository);
    } catch {
      return false;
    }
  };

  /**
   * Reads the version file from the project root, prioritizing `manifest.json` over `package.json`.
   *
   * - Checks if the manifest version file exists and reads its JSON content if available.
   * - Checks if the package version file exists and reads its JSON content if available.
   * - If neither file is found, logs an error message and exits the process.
   * - Sets the `versionFile` and `versionContent` properties based on the found file.
   *
   * @private
   * @returns {void}
   */
  private readonly readVersionFile = () => {
    if (this.checkDirectory(this.manifestVersionFile)) {
      this.manifestFile = this.manifestVersionFile;
      this.manifestContent = this.fs.readJsonSync(this.manifestVersionFile);
    }
    if (this.checkDirectory(this.packageVersionFile)) {
      this.packageFile = this.packageVersionFile;
      this.packageJsonContent = this.fs.readJsonSync(this.packageVersionFile);
    }

    if (!this.manifestContent && !this.packageJsonContent) {
      this.log.error(
        `${Colors.ERROR('❌ Version file not found:')} ${this.manifestVersionFile} or ${this.packageVersionFile}.`,
      );
      this.log.info(Colors.YELLOW('💡 Tip: Make sure you have a manifest.json or package.json in your project root.'));
      this.processExit(1);
    }

    this.versionFile = this.manifestFile || this.packageFile;
    this.versionContent = this.manifestContent || this.packageJsonContent;
  };

  /**
   * Retrieves the list of release files specified in the configuration.
   *
   * This method checks for the `releaseFiles` property under the `projex` key
   * in the loaded `package.json` content first. If not found, it falls back to
   * checking the `manifest` content. If neither contains the property, an empty
   * array is returned.
   *
   * @returns {string[]} An array of file paths or patterns to include in the release.
   */
  public getReleaseFilesFromConfig = (): string[] => {
    const contentPackageJson = this.packageJsonContent;
    const contentManifest = this.manifestContent;

    let releaseFiles: string[] = [];

    if (contentPackageJson?.projex?.releaseFiles) {
      releaseFiles = contentPackageJson.projex.releaseFiles;
    } else if (contentManifest?.projex?.releaseFiles) {
      releaseFiles = contentManifest.projex.releaseFiles;
    }

    return releaseFiles;
  };

  /**
   * Updates the `version` field in all release files specified in the configuration to the provided `newVersion`.
   *
   * For each release file:
   * - Reads the file as JSON.
   * - Updates its `version` property to `newVersion`.
   * - Writes the updated JSON back to the file with pretty formatting.
   * - Logs the version bump with colorized output.
   *
   * @param newVersion - The new version string to set in each release file.
   */
  public updateReleaseFilesVersion = (newVersion: string): void => {
    const releaseFiles = this.getReleaseFilesFromConfig();

    releaseFiles.forEach((file) => {
      const resolveFile = resolve(this.root, file);
  const content = this.fs.readJsonSync(resolveFile);
      const oldVersion = content.version;
      content.version = newVersion;
  this.fs.writeJsonSync(file, content, { spaces: 2 });
  this.log.info(
        `${Colors.GREEN('✅ Bumped version')} ${chalk.bold.yellow(oldVersion)} -> ${chalk.bold.green(
          newVersion,
        )} in ${chalk.bold.blue(file)}`,
      );
    });
  };

  /**
   * Adds the release files specified in the configuration to the Git staging area.
   *
   * This method retrieves the list of release files from the configuration,
   * resolves their absolute paths, constructs a `git add` command for all files,
   * and executes the command in the repository root. Upon success, it logs a
   * message listing the added files.
   *
   * @returns void
   */
  public addReleaseFiles = (): void => {
    const releaseFiles = this.getReleaseFilesFromConfig();
    let gitAddCommand = 'git add ';
    let successMessage = 'files added:';
    releaseFiles.forEach((file) => {
      const resolveFile = resolve(this.root, file);
      gitAddCommand += ` "${resolveFile}"`;
      successMessage += ` ${resolveFile}`;
    });
    return this.runCommand(gitAddCommand, this.root, successMessage, true);
  };

  /**
   * Updates the version field in both the package.json and manifest files with the provided new version.
   *
   * If the package.json or manifest file content is available, this method updates their `version` property,
   * writes the updated content back to their respective files, and logs the version bump operation.
   *
   * @param newVersion - The new version string to set in the package.json and manifest files.
   */
  public writeVersionFile = (newVersion: string) => {
    const contentPackageJson = this.packageJsonContent;
    const contentManifest = this.manifestContent;

    if (contentPackageJson) {
      const oldVersion = contentPackageJson.version;
      contentPackageJson.version = newVersion;

  this.fs.writeJsonSync(this.packageFile, contentPackageJson, { spaces: 2 });
  this.log.info(
        `${Colors.GREEN('✅ Bumped version')} ${chalk.bold.yellow(oldVersion)} -> ${chalk.bold.green(
          newVersion,
        )} in ${chalk.bold.blue(this.packageFile)}`,
      );
    }

    if (contentManifest) {
      const oldVersion = contentManifest.version;
      contentManifest.version = newVersion;
  this.fs.writeJsonSync(this.manifestFile, contentManifest, { spaces: 2 });
  this.log.info(
        `${Colors.GREEN('✅ Bumped version')} ${chalk.bold.yellow(oldVersion)} -> ${chalk.bold.green(
          newVersion,
        )} in ${chalk.bold.blue(this.manifestFile)}`,
      );
    }
  };

  /**
   * Reads and validates the application's version from the loaded content.
   *
   * This method checks if the `version` field in the loaded manifest or package file
   * is valid according to semantic versioning rules. If the version is invalid,
   * it logs an error message, provides a helpful tip, and terminates the process.
   *
   * @returns {string} The valid semantic version string.
   * @throws Terminates the process with exit code 1 if the version is invalid.
   */
  public readVersion = () => {
    const version = valid(this.versionContent?.version, true);
    if (!version) {
  this.log.error(Colors.ERROR(`❌ Invalid app version: ${version}`));
  this.log.info(Colors.YELLOW('💡 Tip: Check the version field in your manifest.json or package.json.'));
  this.processExit(1);
    }
    return version;
  };

  /**
   * Increments a semantic version string based on the specified release type and optional tag name.
   *
   * @param rawOldVersion - The original version string to increment.
   * @param releaseType - The type of release (e.g., 'major', 'minor', 'patch', 'prerelease').
   * @param tagName - An optional prerelease tag (e.g., 'alpha', 'beta', 'rc', or 'stable').
   * @returns The incremented version string, or `null` if the input version is invalid.
   *
   * If a `tagName` is provided and is not 'stable', and the `releaseType` is not 'prerelease',
   * the function increments the version as a prerelease with the given tag.
   * Otherwise, it increments the version according to the specified `releaseType`.
   */
  public incrementVersion = (rawOldVersion: string, releaseType: ReleaseType, tagName?: string) => {
    const oldVersion = valid(rawOldVersion, true);
    if (tagName !== 'stable' && releaseType !== 'prerelease') {
      return inc(String(oldVersion), `pre${releaseType}` as ReleaseType, false, tagName);
    }
    return inc(String(oldVersion), releaseType);
  };

  /**
   * Updates the version file with the specified new version.
   *
   * @param newVersion - The new version string to write to the version file.
   */
  public bump = (newVersion: string) => {
    this.writeVersionFile(newVersion);
  };

  /**
   * Adds the manifest, package, and changelog files to the git staging area if they exist.
   *
   * This method constructs a `git add` command by checking for the existence of each file:
   * - If the manifest file exists, it is added to the command and the success message.
   * - If the package file exists, it is added to the command and the success message.
   * - If the changelog file exists, it is added to the command and the success message (overwriting previous messages).
   *
   * Executes the constructed git command in the repository root and returns the result.
   *
   * @returns The result of running the git add command.
   */
  public add = () => {
    let gitAddCommand = 'git add ';
    let successMessage = 'files added:';

    if (this.fs.existsSync(this.manifestFile)) {
      gitAddCommand += ` "${this.manifestFile}"`;
      successMessage += ` ${this.manifestFile}`;
    }
    if (this.fs.existsSync(this.packageFile)) {
      gitAddCommand += ` "${this.packageFile}"`;
      successMessage += ` ${this.packageFile}`;
    }
    if (this.fs.existsSync(this.changelogPath)) {
      gitAddCommand += ` "${this.changelogPath}"`;
      successMessage = ` ${this.changelogPath}`;
    }
    return this.runCommand(gitAddCommand, this.root, successMessage, true);
  };

  /**
   * Returns the version file content to use, prioritizing `manifestContent` if available,
   * otherwise falling back to `packageJsonContent`.
   *
   * @returns The content of the manifest file if present; otherwise, the content of the package.json file.
   */
  private readonly getVersionFileToUse = () => {
    return this.manifestContent || this.packageJsonContent;
  };

  /**
   * Returns the application name, optionally prefixed with the vendor name.
   *
   * If a vendor is specified in `versionContent`, the returned string will be in the format
   * `vendor.name`. If no vendor is present, only the application name is returned.
   *
   * @returns {string} The application name, optionally prefixed by the vendor.
   */
  public readAppName = () => {
    const vendor = this.versionContent?.vendor;
    const name = this.versionContent?.name;
    return (vendor ? vendor + '.' : '') + name;
  };

  /**
   * Retrieves the script associated with the specified key from the version file.
   *
   * This method attempts to obtain the version file using `getVersionFileToUse()`.
   * If no version file is found, it logs an error and terminates the process.
   * Otherwise, it returns the script string corresponding to the provided key,
   * or `undefined` if the key does not exist in the scripts object.
   *
   * @param key - The key identifying the script to retrieve.
   * @returns The script string associated with the given key, or `undefined` if not found.
   * @throws Terminates the process if no version file is found.
   */
  private readonly getScript = (key: string): string => {
    const versionFile = this.getVersionFileToUse();
    if (!versionFile) {
  this.log.error('no version file found');
  this.processExit(1);
    }

    return versionFile.scripts?.[key];
  };

  /**
   * Searches for a script by key in either the manifest or package.json content.
   *
   * @param key - The name of the script to find.
   * @returns The script command string if found; otherwise, logs a warning and returns `undefined`.
   *
   * @remarks
   * This method checks for the existence of the script in `manifestContent.scripts` first,
   * then in `packageJsonContent.scripts`. If the script is not found in either, a warning is logged.
   */
  public findScript = (key: string) => {
    if (this.manifestContent || this.packageJsonContent) {
      const scriptInManifestFile = this.manifestContent?.scripts?.[key];
      const scriptInPackageFile = this.packageJsonContent?.scripts?.[key];

      if (scriptInManifestFile) {
        return scriptInManifestFile;
      } else if (scriptInPackageFile) {
        return scriptInPackageFile;
      } else {
  this.log.warn(`no script found for ${key}`);
      }
    }
  };

  /**
   * Executes a script associated with the given key, if it exists.
   *
   * @param key - The identifier used to look up the script to run.
   * @param msg - A message to display or log when running the script.
   * @returns The result of executing the script command if found, or logs a verbose message if no script is found for the given key.
   */
  public runFindScript = (key: string, msg: string) => {
    const cmd = this.findScript(key);
  return cmd ? this.runCommand(cmd, this.root, msg, false) : this.log.verbose(`no script found for ${key}`);
  };

  /**
   * Executes a script associated with the provided key.
   *
   * Retrieves the command string for the given key using `getScript`.
   * If a command is found, it runs the command in the context of the current root directory,
   * displaying the provided message. If no command is found, logs a verbose message.
   *
   * @param key - The identifier for the script to execute.
   * @param msg - The message to display or log when running the script.
   * @returns The result of `runCommand` if a script is found, otherwise the result of a verbose log.
   */
  public runScript = (key: string, msg: string) => {
    const cmd: string = this.getScript(key);
  return cmd ? this.runCommand(cmd, this.root, msg, false) : this.log.verbose(`no script found for ${key}`);
  };

  /**
   * Retrieves version information including the old version, new version, push command text, and application name.
   *
   * @param oldVersion - The previous version string of the application.
   * @param newVersion - The new version string to be set for the application.
   * @param pushCommandText - The command text used to push the new version.
   * @returns An object containing the old version, new version, push command text, and the application name.
   */
  public getVersionInformation = (oldVersion: string, newVersion: string, pushCommandText: string) => {
    return {
      oldVersion,
      newVersion,
      pushCommandText,
      appName: this.readAppName(),
    };
  };
}
