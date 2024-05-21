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
  },
  tagName: string,
) => {
  const preConfirm = options.y || options.yes;
  const pushAutomatic = options.noPush;
  const automaticDeploy = options.noDeploy;
  const checkPreRelease = options.noCheckRelease;
  const noTag = options.noTag;
  const getVersion = options.getVersion;

  const utils = new ReleaseUtils();

  checkGit();
  checkIfInGitRepo();

  const { releaseType, oldVersion, newVersion, tagText, changelogVersion, changelog } = utils.getRelease(tagName);
  const pushCommandText = pushCommand(tagText, noTag);

  if (getVersion) {
    return console.log(utils.getVersionInformation(oldVersion, newVersion, pushCommandText));
  }

  if (!preConfirm && !(await utils.confirmRelease(String(newVersion)))) {
    log.verbose('aborted release.');
    return;
  }

  try {
    if (!checkPreRelease) await utils.preRelease();

    await utils.bump(newVersion);

    if (shouldUpdateChangelog(releaseType, tagName)) {
      utils.updateChangelog(changelogVersion, changelog);
    }

    if (!pushAutomatic) {
      await utils.add();
      await utils.commit(tagText, releaseType);
    }
    if (!noTag) {
      await tag(tagText, utils.root);
    }
    if (!pushAutomatic) {
      await utils.push(tagText, noTag);
    }
    if (!automaticDeploy) {
      await utils.postRelease();
    }
  } catch (e) {
    log.error(`${Colors.ERROR('an error occurred while releasing the new version')} ${chalk.bold(newVersion)}.`);
    log.error(e);
    process.exit(1);
  }
};
