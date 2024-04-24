import { ReleaseType, valid, parse, gt } from 'semver';
import {
  releaseTypesToUpdateChangelogList,
  supportedReleaseTypesList,
  supportedTagNamesList,
  tagNamesToUpdateChangelog,
} from './constants';
import { ReleaseUtils } from './utils';
import { log } from '@shared';
import { Colors } from '@api';
import chalk from 'chalk';

export const shouldUpdateChangelog = (releaseType: ReleaseType, tagName: string) => {
  return (
    (releaseTypesToUpdateChangelogList.indexOf(releaseType) >= 0 && tagNamesToUpdateChangelog.indexOf(tagName) >= 0) ||
    valid(releaseType)
  );
};

/**
 * Get the new and old versions based on the release type and tag name.
 * @param utils - An instance of ReleaseUtils.
 * @param releaseType - The release type (either a valid semver version or a regular release type).
 * @param tagName - The tag name.
 * @returns An array containing the old version and the new version.
 * @throws Error if the new version is not greater than the old version or if the release type or tag name is invalid.
 */
export const getNewAndOldVersions = (utils: ReleaseUtils, releaseType: ReleaseType, tagName: string) => {
  if (valid(releaseType)) {
    // If `releaseType` is a valid (semver) version, use it.
    const oldVersion = utils.readVersion();
    const parsedVersion = parse(releaseType);
    const newVersion = parsedVersion?.version;

    if (!newVersion || !gt(newVersion, oldVersion)) {
      const errorMessage = `the new version (${chalk.bold(
        newVersion,
      )}) must be greater than the old version (${chalk.bold(oldVersion)})`;
      log.error(Colors.ERROR(errorMessage));
      throw new Error(errorMessage);
    }

    return [oldVersion, newVersion];
  }

  // Else `releaseType` is just a regular release type. Then we increment the actual version.

  // Check if releaseType is valid.
  if (!supportedReleaseTypesList.includes(releaseType)) {
    const validReleaseTypes = supportedReleaseTypesList.join(', ');
    throw new Error(`Invalid release type: ${releaseType}\nValid release types are: ${validReleaseTypes}`);
  }

  // Check if tagName is valid.
  if (!supportedTagNamesList.includes(tagName)) {
    const validTagNames = supportedTagNamesList.join(', ');
    throw new Error(`Invalid release tag: ${tagName}\nValid release tags are: ${validTagNames}`);
  }

  const oldVersion = utils.readVersion();
  const newVersion = utils.incrementVersion(oldVersion, releaseType, tagName);
  return [oldVersion, newVersion];
};
