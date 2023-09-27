import {
  CHANGELOG_TEMPLATE_CODE,
  FilesUtils,
  GIT_IGNORE_TEMPLATE_CODE,
  README_TEMPLATE_CODE,
} from "../../../../shared";

export class SetupGitRepositoryUtils {
  private filesUtils = new FilesUtils();

  constructor() {}

  async setupGitRepository(root: string) {
    // create docs directory
    await this.filesUtils.createDirectory(root + "/docs");

    // create README.md
    await this.filesUtils.createFile(root + "/README.md", README_TEMPLATE_CODE);

    // create .gitignore
    await this.filesUtils.createFile(
      root + "/.gitignore",
      GIT_IGNORE_TEMPLATE_CODE
    );

    // create CHANGELOG.md
    await this.filesUtils.createFile(
      root + "/CHANGELOG.md",
      CHANGELOG_TEMPLATE_CODE
    );
  }
}
