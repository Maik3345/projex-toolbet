import { Colors } from '@api';
import { checkGit, checkIfInGitRepo, log } from '@shared';
import { ChangelogUtils } from './changelog';

export const changelogUpdate = async (changeLogReleaseType = 'Changed', changelogContent = '') => {
  const utils = new ChangelogUtils(changeLogReleaseType, changelogContent);

  checkGit();
  checkIfInGitRepo();

  try {
    await utils.writeGitLogCommits();
  } catch (e) {
    log.verbose(e);
    log.error(Colors.ERROR('failed to update changelog file'));
  }
};
