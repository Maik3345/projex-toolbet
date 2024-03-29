import { getAppRoot, promptConfirm } from "../../../../api";
import { log, runCommand, unreleased } from "../../../../shared";
import chalk from "chalk";
import { execSync } from "child-process-es6-promise";
import {
  close,
  existsSync,
  openSync,
  readFileSync,
  readJsonSync,
  writeJsonSync,
  writeSync,
} from "fs-extra";
import { resolve } from "path";
import { path } from "ramda";
import semver from "semver";
const fs = require("fs");

export class ReleaseUtils {
  public root: string;
  private manifestVersionFile: string;
  private packageVersionFile: string;
  private versionFile: string;
  private changelogPath: string;

  constructor() {
    this.root = getAppRoot();
    this.manifestVersionFile = resolve(this.root, "manifest.json");
    this.packageVersionFile = resolve(this.root, "package.json");

    this.changelogPath = resolve(this.root, "CHANGELOG.md");
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
        `Version file not found: ${this.manifestVersionFile} or ${this.packageVersionFile}.`
      );
      throw new Error(
        `Manifest or package.json not found in ${this.root} directory`
      );
    }
  };

  private writeVersionFile = (newManifest: any) => {
    writeJsonSync(this.versionFile, newManifest, { spaces: 2 });
  };

  public readVersion = () => {
    const version = semver.valid(this.readVersionFile().version, true);
    if (!version) {
      throw new Error(`Invalid app version: ${version}`);
    }
    return version;
  };

  public incrementVersion = (
    rawOldVersion: string,
    releaseType: semver.ReleaseType,
    tagName: string
  ) => {
    const oldVersion = semver.valid(rawOldVersion, true);
    if (tagName !== "stable" && releaseType !== "prerelease") {
      return semver.inc(
        oldVersion,
        `pre${releaseType}` as semver.ReleaseType,
        false,
        tagName
      );
    }
    return semver.inc(oldVersion, releaseType);
  };

  public commit = (tagName: string, releaseType: string) => {
    const commitIcon =
      releaseType === "prerelease" || releaseType === "pre"
        ? ":construction: beta release"
        : ":rocket: release";
    const commitMessage = `build: ${commitIcon} ${tagName}`;
    let successMessage = `File(s) ${this.versionFile} committed`;
    if (existsSync(this.changelogPath)) {
      successMessage = `Files ${this.versionFile} ${this.changelogPath} committed`;
    }
    return runCommand(
      `git commit -m "${commitMessage}"`,
      this.root,
      successMessage,
      true
    );
  };

  public tag = (tagName: string) => {
    const tagMessage = `Release ${tagName}`;
    return runCommand(
      `git tag ${tagName} -m "${tagMessage}"`,
      this.root,
      `Tag created: ${tagName}`,
      true
    );
  };

  public pushCommand = (tagName: string, noTag: string) => {
    return `git push ${noTag ? "" : `&& git push origin ${tagName}`}`;
  };

  public push = (tagName: string, noTag: string) => {
    return runCommand(
      this.pushCommand(tagName, noTag),
      this.root,
      `Pushed commit ${noTag ? "" : `and tag ${tagName}`}`,
      true,
      2
    );
  };

  public gitStatus = () => {
    return runCommand("git status --porcelain", this.root, "", true);
  };

  public checkNothingToCommit = () => {
    const response = this.gitStatus().toString();
    return !response;
  };

  public checkIfGitPushWorks = () => {
    try {
      runCommand("git push", this.root, "", true, 2, true);
    } catch (e) {
      log.error(`Failed pushing to remote.`);
      throw e;
    }
  };

  /* The `preRelease` method is a function that is used to perform pre-release tasks before creating a
  new release. Here is a breakdown of what it does: */
  public preRelease = () => {
    const msg = "Pre release";
    if (!this.checkNothingToCommit()) {
      throw new Error("Please commit your changes before proceeding.");
    }
    this.checkIfGitPushWorks();
    const key = "prereleasy";
    this.runScript(key, msg);
    if (!this.checkNothingToCommit()) {
      const commitMessage = `Pre release commit\n\n ${this.getScript(key)}`;
      return this.commit(commitMessage, "prerelease");
    }
  };

  public confirmRelease = async (): Promise<boolean> => {
    const answer = await promptConfirm(chalk.green("Are you sure?"));
    if (!answer) {
      log.info("Cancelled by user");
      return false;
    }
    return true;
  };

  public checkGit = () => {
    try {
      execSync("git --version");
    } catch (e) {
      log.error(`${chalk.bold(`git`)} is not available in your system. \
  Please install it if you wish to use ${chalk.bold(`vtex release`)}`);
      throw e;
    }
  };

  public checkIfInGitRepo = () => {
    try {
      execSync("git rev-parse --git-dir");
    } catch (e) {
      log.error(`The current working directory is not in a git repo. \
  Please run ${chalk.bold(`vtex release`)} from inside a git repo.`);
      throw e;
    }
  };

  public postRelease = () => {
    const msg = "Post release";
    if (this.getScript("postrelease")) {
      return this.runScript("postrelease", msg);
    }
    if (this.getScript("postreleasy")) {
      return this.runScript("postreleasy", msg);
    }
  };

  public add = () => {
    let gitAddCommand = `git add "${this.versionFile}"`;
    let successMessage = `File ${this.versionFile} added`;
    if (existsSync(this.changelogPath)) {
      gitAddCommand += ` "${this.changelogPath}"`;
      successMessage = `Files ${this.versionFile} ${this.changelogPath} added`;
    }
    return runCommand(gitAddCommand, this.root, successMessage, true);
  };

  public readAppName = () => {
    const vendor = this.readVersionFile().vendor;
    return `${vendor ? `${vendor}.` : ""}${this.readVersionFile().name}`;
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
            `I can't update your CHANGELOG. :( \n
          Make your CHANGELOG great again and follow the CHANGELOG format
          http://keepachangelog.com/en/1.0.0/`
          )
        );
      } else {
        const position = data.indexOf(unreleased) + unreleased.length;
        const bufferedText = Buffer.from(
          `${changelogVersion}${data.substring(position)}`
        );
        const file = openSync(this.changelogPath, "r+");
        try {
          writeSync(file, bufferedText, 0, bufferedText.length, position);
          close(file);
          log.info(`updated CHANGELOG`);
        } catch (e) {
          throw new Error(`Error writing file: ${e}`);
        }
      }
    }
  };

  public bump = (newVersion: string) => {
    const manifest = this.readVersionFile();
    manifest.version = newVersion;
    this.writeVersionFile(manifest);
    log.info(`Version bumped to ${chalk.bold.green(newVersion)}`);
  };

  private getScript = (key: string): string => {
    return path(["scripts", key], this.readVersionFile());
  };

  private runScript = (key: string, msg: string) => {
    const cmd: string = this.getScript(key);
    return cmd ? runCommand(cmd, this.root, msg, false) : undefined;
  };
}
