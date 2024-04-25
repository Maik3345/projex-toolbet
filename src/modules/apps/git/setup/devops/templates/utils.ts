import { DEVOPS_TEMPLATE_CODE, FilesUtils } from '@shared';

export class SetupDevopsTemplatesUtils {
  private filesUtils = new FilesUtils();

  constructor() {}

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
