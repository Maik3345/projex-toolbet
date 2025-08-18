import { Colors } from '@api';
import { checkGit, checkIfInGitRepo, log, pushCommand, tag } from '@shared';
import chalk from 'chalk';
import { shouldUpdateChangelog } from './changelog';
import { ReleaseUtils } from './utils';

/**
 * Handles the process of creating and managing a Git release, including version bumping,
 * changelog updates, tagging, pushing, and optional deployment steps.
 *
 * @param options - Configuration options to control the release process.
 * @param options.y - If true, automatically confirm the release without prompting.
 * @param options.yes - Alias for `y`.
 * @param options.noPush - If true, skip pushing changes to the remote repository.
 * @param options.noDeploy - If true, skip the deployment step after release.
 * @param options.noCheckRelease - If true, skip pre-release checks.
 * @param options.noTag - If true, do not create a Git tag for the release.
 * @param options.getVersion - If true, output version information and exit.
 * @param options.noPreRelease - If true, skip pre-release hooks.
 * @param options.noPostRelease - If true, skip post-release hooks.
 * @param options.getReleaseType - If true, output the release type and exit.
 * @param options.getOnlyVersionNumber - If true, output only the new version number and exit.
 * @param tagName - The name of the Git tag to create for the release.
 *
 * @returns {Promise<void>} Resolves when the release process is complete or exits early based on options.
 *
 * @throws Will log and exit the process if an error occurs during the release process.
 */
export const release = async (
  options: {
    y?: boolean;
    yes?: boolean;
    noPush?: boolean;
    noDeploy?: boolean;
    noCheckRelease?: boolean;
    noTag?: boolean;
    getVersion?: boolean;
    noPreRelease?: boolean;
    noPostRelease?: boolean;
    getReleaseType?: boolean;
    getOnlyVersionNumber?: boolean;
  },
  tagName: string,
) => {
  const preConfirm = options.y || options.yes;
  const pushAutomatic = options.noPush;
  const automaticDeploy = options.noDeploy;
  const checkPreRelease = options.noCheckRelease;
  const noTag = options.noTag;
  const getVersion = options.getVersion;
  const noPreRelease = options.noPreRelease;
  const noPostRelease = options.noPostRelease;
  const getReleaseType = options.getReleaseType;
  const getOnlyVersionNumber = options.getOnlyVersionNumber;

  const utils = new ReleaseUtils();

  checkGit();
  checkIfInGitRepo();

  const { releaseType, oldVersion, newVersion, tagText, changelogVersion, changelog } = utils.getRelease(tagName);
  const pushCommandText = pushCommand(tagText, noTag);

  if (getOnlyVersionNumber) {
    return console.log(newVersion);
  } else if (getReleaseType) {
    return console.log(releaseType);
  } else if (getVersion) {
    return console.log(utils.versionFileUtils.getVersionInformation(oldVersion, newVersion, pushCommandText));
  } else {
    if (!preConfirm && !(await utils.confirmRelease(String(newVersion)))) {
      log.verbose('aborted release.');
      return;
    }

    try {
      await utils.preRelease({ noPreRelease, checkPreRelease, releaseType });

      utils.versionFileUtils.updateReleaseFilesVersion(newVersion);
      utils.versionFileUtils.bump(newVersion);

      if (shouldUpdateChangelog(releaseType, tagName)) {
        utils.updateChangelog(changelogVersion, changelog);
      }

      if (!pushAutomatic) {
        utils.versionFileUtils.addReleaseFiles();
        await utils.versionFileUtils.add();
        await utils.commit(tagText, releaseType);
      }
      if (!noTag) {
        await tag(tagText, utils.versionFileUtils.root);
      }
      if (!pushAutomatic) {
        await utils.push(tagText, noTag);
      }
      if (!automaticDeploy) {
        await utils.postRelease(noPostRelease);
      }
    } catch (e) {
      log.error(`${Colors.ERROR('an error occurred while releasing the new version')} ${chalk.bold(newVersion)}.`);
      log.error(e);
      process.exit(1);
    }
  }
};
