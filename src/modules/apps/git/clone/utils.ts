import { Colors, getCurrentDirectory } from '@api';
import { log, runCommand } from '@shared';
import fs from 'fs';

/**
 * Utility class for cloning Git repositories and checking directory existence.
 *
 * The `CloneUtils` class provides methods to clone a Git repository from a specified URL
 * and to verify if a given directory exists on the filesystem. It logs the cloning process,
 * including success and error messages, and offers troubleshooting tips if cloning fails.
 *
 * @example
 * ```typescript
 * const utils = new CloneUtils('https://github.com/example/');
 * utils.cloneRepository('my-repo.git');
 * ```
 *
 * @remarks
 * - Uses `runCommand` to execute the `git clone` operation.
 * - Logs informative messages using the `log` and `Colors` utilities.
 * - Checks directory existence using Node.js `fs.existsSync`.
 *
 * @public
 */
export class CloneUtils {
  private readonly repositoryUrl: string;
  private readonly root: string;

  constructor(repositoryUrl: string) {
    this.repositoryUrl = repositoryUrl;
    this.root = getCurrentDirectory();
  }

  /**
   * Clones a Git repository from the specified repository name or path.
   *
   * Logs the cloning process, including success and error messages.
   * If cloning fails, logs an error and provides a troubleshooting tip.
   *
   * @param repository - The name or path of the repository to clone.
   * @returns The result of the `runCommand` function if successful; otherwise, logs errors.
   */
  public cloneRepository = (repository: string) => {
    try {
      log.info(`${Colors.BLUE('🔗 Cloning repository:')} ${Colors.BLUE(repository)}...`);
      return runCommand(
        `git clone ${this.repositoryUrl}${repository}`,
        this.root,
        Colors.GREEN('✅ Repository cloned successfully!'),
      );
    } catch (e: any) {
      log.error(Colors.ERROR(`❌ Failed to clone repository: ${Colors.BLUE(repository)}.`));
      log.info(Colors.YELLOW('💡 Tip: Check your network connection and repository URL.'));
      log.error(e);
    }
  };

  /**
   * Checks if the specified directory exists on the filesystem.
   *
   * @param repository - The path to the directory or repository to check.
   * @returns `true` if the directory exists, otherwise `false`.
   */
  public checkDirectory = (repository: string) => {
    try {
      return fs.existsSync(repository);
    } catch {
      return false;
    }
  };
}
