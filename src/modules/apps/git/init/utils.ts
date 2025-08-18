import { FilesUtils, README_TEMPLATE_CODE, GIT_IGNORE_TEMPLATE_CODE, CHANGELOG_TEMPLATE_CODE } from '@shared';

/**
 * Utility class for initializing a new Git repository structure within a given root directory.
 *
 * This class provides methods to set up standard files and directories commonly found in Git repositories,
 * such as `docs/`, `README.md`, `.gitignore`, and `CHANGELOG.md`.
 *
 * @remarks
 * The class depends on an instance of `FilesUtils` to perform file system operations.
 *
 * @example
 * ```typescript
 * const utils = new SetupGitRepositoryUtils();
 * await utils.setupGitRepository('/path/to/project');
 * ```
 */
export class SetupGitRepositoryUtils {
  private readonly filesUtils = new FilesUtils();

  async setupGitRepository(root: string) {
    // create docs directory
    await this.filesUtils.createDirectory(root + '/docs');

    // create README.md
    await this.filesUtils.createFile(root + '/README.md', README_TEMPLATE_CODE);

    // create .gitignore
    await this.filesUtils.createFile(root + '/.gitignore', GIT_IGNORE_TEMPLATE_CODE);

    // create CHANGELOG.md
    await this.filesUtils.createFile(root + '/CHANGELOG.md', CHANGELOG_TEMPLATE_CODE);
  }
}
