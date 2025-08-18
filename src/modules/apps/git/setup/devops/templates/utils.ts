import { DEVOPS_TEMPLATE_CODE, FilesUtils } from '@shared';

/**
 * Utility class for setting up default Azure DevOps templates within a project directory.
 *
 * @remarks
 * This class provides methods to automate the creation of standard Azure DevOps template directories
 * and files, such as pull request templates, to streamline DevOps onboarding and consistency.
 *
 * @public
 */
export class SetupDevopsTemplatesUtils {
  private readonly filesUtils = new FilesUtils();

  /**
   * Sets up the default Azure DevOps templates in the specified root directory.
   *
   * This method performs the following actions:
   * - Creates a `.azuredevops` directory at the given root path.
   * - Creates a `pull_request_template` subdirectory within `.azuredevops`.
   * - Creates a `PULL_REQUEST_TEMPLATE.md` file inside the `pull_request_template` directory,
   *   populating it with the contents of `DEVOPS_TEMPLATE_CODE`.
   *
   * @param root - The root directory where the Azure DevOps templates should be set up.
   * @returns A promise that resolves when all directories and files have been created.
   */
  async setupDevopsTemplates(root: string) {
    // create .azuredevops directory
    await this.filesUtils.createDirectory(root + '/.azuredevops');
    // create .azuredevops/pull_request_template directory
    await this.filesUtils.createDirectory(root + '/.azuredevops/pull_request_template');
    // create .azuredevops/pull_request_template/PULL_REQUEST_TEMPLATE.md
    await this.filesUtils.createFile(
      root + '/.azuredevops/pull_request_template/PULL_REQUEST_TEMPLATE.md',
      DEVOPS_TEMPLATE_CODE,
    );
  }
}
