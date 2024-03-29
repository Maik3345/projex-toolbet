import { log } from "../../../../shared";
import chalk from "chalk";
import { indexOf, prop } from "ramda";
import semver from "semver";
import { ReleaseUtils } from "./utils";
import { ChangelogUtils } from "./changelog";
import {
  releaseTypesToUpdateChangelogList,
  tagNamesToUpdateChangelog,
  supportedReleaseTypesList,
  supportedTagNamesList,
  releaseTypeAliases,
} from "./constants";

const shouldUpdateChangelog = (releaseType, tagName) => {
  return (
    (releaseTypesToUpdateChangelogList.indexOf(releaseType) >= 0 &&
      tagNamesToUpdateChangelog.indexOf(tagName) >= 0) ||
    semver.valid(releaseType)
  );
};

const getNewAndOldVersions = (utils: ReleaseUtils, releaseType, tagName) => {
  if (semver.valid(releaseType)) {
    // If `releaseType` is a valid (semver) version, use it.
    const oldVersion = utils.readVersion();
    const newVersion = semver.parse(releaseType).version;
    if (!semver.gt(newVersion, oldVersion)) {
      // TODO: Remove the below log.error when toolbelt has better error handling.
      log.error(`The new version has to be greater than the old one: \
${newVersion} <= ${oldVersion}`);
      throw new Error(`The new version has to be greater than the old one: \
${newVersion} <= ${oldVersion}`);
    }
    return [oldVersion, newVersion];
  }
  // Else `releaseType` is just a regular release type. Then we increment the
  // actual version.
  // Check if releaseType is valid.
  if (indexOf(releaseType, supportedReleaseTypesList) === -1) {
    // TODO: Remove the below log.error when toolbelt has better error handling.
    log.error(`Invalid release type: ${releaseType}
Valid release types are: ${supportedReleaseTypesList.join(", ")}`);
    throw new Error(`Invalid release type: ${releaseType}
Valid release types are: ${supportedReleaseTypesList.join(", ")}`);
  }
  // Check if tagName is valid.
  if (indexOf(tagName, supportedTagNamesList) === -1) {
    // TODO: Remove the below log.error when toolbelt has better error handling.
    log.error(`Invalid release tag: ${tagName}
Valid release tags are: ${supportedTagNamesList.join(", ")}`);
    throw new Error(`Invalid release tag: ${tagName}
Valid release tags are: ${supportedTagNamesList.join(", ")}`);
  }
  const oldVersion = utils.readVersion();
  const newVersion = utils.incrementVersion(oldVersion, releaseType, tagName);
  return [oldVersion, newVersion];
};

export const release = async (
  releaseType = "patch", // This arg. can also be a valid (semver) version.
  tagName = "beta",
  changeLogReleaseType = "Changed",
  changelogContent = "",
  options
) => {
  const preConfirm = options.y || options.yes;
  const pushAutomatic = options.noPush;
  const automaticDeploy = options.noDeploy;
  const checkPreRelease = options.noCheckRelease;
  const noTag = options.noTag;
  const getVersion = options.getVersion;

  const utils = new ReleaseUtils();
  const changelogUtils = new ChangelogUtils(
    changeLogReleaseType,
    changelogContent
  );
  utils.checkGit();
  utils.checkIfInGitRepo();
  const normalizedReleaseType =
    prop<string>(releaseType, releaseTypeAliases) || releaseType;
  const [oldVersion, newVersion] = getNewAndOldVersions(
    utils,
    normalizedReleaseType,
    tagName
  );
  // Pachamama v2 requires that version tags start with a 'v' character.
  const tagText = `v${newVersion}`;

  if (getVersion) {
    return console.log(
      `old_version:${oldVersion},new_version:${newVersion},app_name:${utils.readAppName()},push:${utils.pushCommand(
        tagText,
        noTag
      )}`
    );
  } else {
    log.info(`Old version: ${chalk.bold(oldVersion)}`);
    log.info(`New version: ${chalk.bold.yellow(newVersion)}`);
    log.info(`App name: ${chalk.bold.yellow(utils.readAppName())}`);
    log.info(`Push command: ${chalk.bold(utils.pushCommand(tagText, noTag))}`);
  }

  const [month, day, year] = new Date()
    .toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .split("/");

  const changelogVersion = `\n\n## [${newVersion}] - ${year}-${month}-${day}`;

  if (!preConfirm && !(await utils.confirmRelease())) {
    // Abort release.
    return;
  }

  log.info("Starting release...");
  try {
    !checkPreRelease && (await utils.preRelease());
    await utils.bump(newVersion);
    await changelogUtils.writeGitLogCommits();
    if (shouldUpdateChangelog(normalizedReleaseType, tagName)) {
      utils.updateChangelog(changelogVersion);
    }
    !pushAutomatic && (await utils.add());
    !pushAutomatic && (await utils.commit(tagText, releaseType));
    !noTag && !pushAutomatic && (await utils.tag(tagText));
    !pushAutomatic && (await utils.push(tagText, noTag));
    !automaticDeploy && (await utils.postRelease());

    if (pushAutomatic && automaticDeploy) {
      log.info(
        `you can push all changes with:git push && git push origin ${tagText}`
      );
    }
  } catch (e) {
    log.error(`Failed to release \n${e}`);
  }
};
