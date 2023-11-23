import {
  FilesUtils,
  COMMIT_LINT_SETTINGS_CODE,
  HUSKY_COMMIT_MESSAGE_CODE,
  runCommand,
} from "../../../../../shared";

export class SetupHuskyUtil {
  private filesUtils: FilesUtils;

  constructor() {
    this.filesUtils = new FilesUtils();
  }

  /* The `setupHusky` function is responsible for setting up Husky and Commitlint in a given project
  directory. Here's a breakdown of what it does: */
  async setupHusky(root: string) {
    // install husky
    await runCommand("yarn add husky -D", root, "install husky package");

    // configure husky prepare
    await runCommand(
      'npm pkg set scripts.prepare="npx husky install"',
      root,
      "husky prepare script added in the package.json"
    );

    // run husky prepare
    await runCommand("npm run prepare", root, "run prepare script");

    // install commitlint
    await runCommand(
      "yarn add @commitlint/cli @commitlint/config-conventional -D",
      root,
      "commitlint installation complete"
    );

    // delete .husky/commit-msg
    await runCommand("rm -rf .husky/commit-msg", root, "commit-msg deleted");
    // delete commitlint.config.js
    await runCommand(
      "rm -rf ./commitlint.config.js",
      root,
      "commitlint.config.js deleted"
    );

    // create commitlint.config.js
    await this.filesUtils.createFile(
      root + "/commitlint.config.js",
      COMMIT_LINT_SETTINGS_CODE
    );

    // create .husky/commit-msg
    await this.filesUtils.createFile(
      root + "/.husky/commit-msg",
      HUSKY_COMMIT_MESSAGE_CODE
    );

    // add husky hook for prepare-commit-msg
    await runCommand(
      "chmod ug+x .husky/*",
      root,
      "husky hooks permissions set"
    );
  }
}
