import { indexOf } from "ramda";
import semver from "semver";
import { log } from "../../../../shared";
import {
  releaseTypesToUpdateChangelogList,
  supportedReleaseTypesList,
  supportedTagNamesList,
  tagNamesToUpdateChangelog,
} from "./constants";
import { ReleaseUtils } from "./utils";

export const shouldUpdateChangelog = (releaseType, tagName) => {
  return (
    (releaseTypesToUpdateChangelogList.indexOf(releaseType) >= 0 &&
      tagNamesToUpdateChangelog.indexOf(tagName) >= 0) ||
    semver.valid(releaseType)
  );
};

export const getNewAndOldVersions = (
  utils: ReleaseUtils,
  releaseType,
  tagName
) => {
  if (semver.valid(releaseType)) {
    // If `releaseType` is a valid (semver) version, use it.
    const oldVersion = utils.readVersion();
    const newVersion = semver.parse(releaseType).version;
    if (!semver.gt(newVersion, oldVersion)) {
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
    log.error(`Invalid release type: ${releaseType}
Valid release types are: ${supportedReleaseTypesList.join(", ")}`);
    throw new Error(`Invalid release type: ${releaseType}
Valid release types are: ${supportedReleaseTypesList.join(", ")}`);
  }
  // Check if tagName is valid.
  if (indexOf(tagName, supportedTagNamesList) === -1) {
    log.error(`Invalid release tag: ${tagName}
Valid release tags are: ${supportedTagNamesList.join(", ")}`);
    throw new Error(`Invalid release tag: ${tagName}
Valid release tags are: ${supportedTagNamesList.join(", ")}`);
  }
  const oldVersion = utils.readVersion();
  const newVersion = utils.incrementVersion(oldVersion, releaseType, tagName);
  return [oldVersion, newVersion];
};
