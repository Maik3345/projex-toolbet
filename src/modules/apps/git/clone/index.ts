import { Colors } from '@api';
import { log } from '@shared';
import { CloneUtils } from './utils';

/**
 * Clones multiple repositories from a given list using the specified repository URL.
 *
 * @param repositoryUrl - The base URL of the repository to clone from.
 * @param repositoryList - A comma-separated string of repository names to be cloned.
 * @returns A promise that resolves when all repositories have been processed.
 *
 * @remarks
 * - If a repository already exists locally, it will not be cloned again.
 * - Logs a message for each repository that already exists.
 */
export const clone = async (repositoryUrl: string, repositoryList: string) => {
  const utils = new CloneUtils(repositoryUrl);

  const clone = repositoryList.split(',').map(async (repository) => {
    const name = repository.replace(/\s/g, '');
    const exist = utils.checkDirectory(name);

    if (!exist) {
      await utils.cloneRepository(name);
    } else {
      log.info(`${Colors.YELLOW('⚠️ Repository already exists:')} ${Colors.GREEN(name)}`);
    }
  });

  await Promise.all(clone);
};
