import { Colors } from '@api';
import { checkGit, checkIfInGitRepo, log, pushCommand, tag } from '@shared';
import { shouldUpdateChangelog } from './changelog';
import { ReleaseUtils } from './utils';
const chalk = require('chalk');

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
      await utils.preRelease({ noPreRelease, checkPreRelease });

      await utils.versionFileUtils.bump(newVersion);

      if (shouldUpdateChangelog(releaseType, tagName)) {
        utils.updateChangelog(changelogVersion, changelog);
      }

      if (!pushAutomatic) {
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
