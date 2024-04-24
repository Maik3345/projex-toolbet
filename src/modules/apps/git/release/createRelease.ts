import { Colors, renderTableOfReleaseVersions } from '@api';
import { checkGit, checkIfInGitRepo, log, pushCommand, tag } from '@shared';
import { ReleaseType } from 'semver';
import { getNewAndOldVersions, shouldUpdateChangelog } from './changelog';
import { releaseTypeAliases } from './constants';
import { ReleaseUtils } from './utils';
const chalk = require('chalk');

export const release = async (
  releaseType: ReleaseType = 'patch', // This arg. can also be a valid (semver) version.
  tagName = 'beta',
  options: {
    y?: boolean;
    yes?: boolean;
    noPush?: boolean;
    noDeploy?: boolean;
    noCheckRelease?: boolean;
    noTag?: boolean;
    getVersion?: boolean;
  },
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

  const normalizedReleaseType =
    releaseTypeAliases[releaseType as keyof typeof releaseTypeAliases] || (releaseType as ReleaseType); // Cast normalizedReleaseType to ReleaseType
  const [oldVersion, newVersion] = getNewAndOldVersions(utils, normalizedReleaseType, tagName);
  // Pachamama v2 requires that version tags start with a 'v' character.
  const tagText = `v${newVersion}`;

  if (getVersion) {
    return console.log(
      `old_version:${oldVersion},new_version:${newVersion},app_name:${utils.readAppName()},push:${pushCommand(
        tagText,
        noTag,
      )}`,
    );
  } else {
    renderTableOfReleaseVersions({
      emptyMessage: 'No commits found',
      listArray: [
        {
          text: 'Old version',
          value: String(oldVersion),
        },
        {
          text: 'New version',
          value: chalk.yellow(newVersion),
        },
      ],
    });
  }

  const [month, day, year] = new Date()
    .toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    .split('/');

  const changelogVersion = `\n\n## [${newVersion}] - ${year}-${month}-${day}`;

  if (!preConfirm && !(await utils.confirmRelease(String(newVersion)))) {
    // Abort release.
    log.verbose('aborted release.');
    return;
  }

  try {
    log.warn(`to push the commit and tag manually, use: ${chalk.bold.blue(pushCommand(tagText, noTag))}`);
    if (!checkPreRelease) {
      await utils.preRelease();
    }
    await utils.bump(String(newVersion));
    if (shouldUpdateChangelog(normalizedReleaseType, tagName)) {
      utils.updateChangelog(changelogVersion);
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
  }
};
