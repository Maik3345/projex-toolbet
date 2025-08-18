import { Colors } from '@api';
import { COMMIT_LINT_SETTINGS_CODE, FilesUtils, HUSKY_COMMIT_MESSAGE_CODE, log, runCommand } from '@shared';
import * as path from 'path';

/**
 * Utility class for setting up Conventional Commits tooling in a Node.js project.
 *
 * The `SetupConventionalUtil` automates the installation and configuration of Husky and Commitlint,
 * ensuring that commit messages follow the Conventional Commits specification. It detects the project's
 * package manager (npm, yarn, or pnpm), installs necessary dependencies, configures scripts, and sets up
 * Husky Git hooks and Commitlint configuration files.
 *
 * @remarks
 * This utility is intended to be used in Node.js project environments and assumes that the project
 * already contains a `package.json` file. It handles differences between Yarn v1 and v2+ when configuring
 * scripts and ensures that all Husky hooks have the correct executable permissions.
 *
 * @example
 * ```typescript
 * const util = new SetupConventionalUtil();
 * await util.setupConventional('/path/to/project');
 * ```
 */
export class SetupConventionalUtil {
  private readonly filesUtils: FilesUtils;

  constructor() {
    this.filesUtils = new FilesUtils();
  }

  /**
   * Sets up Conventional Commits tooling in a Node.js project at the specified root directory.
   *
   * This method performs the following steps:
   * 1. Detects the package manager in use (npm, yarn, or pnpm).
   * 2. Installs Husky for Git hooks management.
   * 3. Configures the `prepare` script in `package.json` to initialize Husky, handling differences between Yarn v1 and v2+.
   * 4. Runs the `prepare` script to set up Husky.
   * 5. Installs Commitlint and its conventional config for commit message linting.
   * 6. Initializes the `.husky` directory and removes any existing `commit-msg` hook and `commitlint.config.js`.
   * 7. Creates a new `commitlint.config.js` and Husky `commit-msg` hook with the appropriate content.
   * 8. Ensures Husky hooks have executable permissions.
   *
   * @param root - The root directory of the Node.js project where Conventional Commits tooling should be set up.
   * @returns A Promise that resolves when the setup is complete.
   */
  async setupConventional(root: string) {
    // Detect package manager
    const fs = require('fs');
    let pkgManager = 'npm';
    if (fs.existsSync(path.join(root, 'pnpm-lock.yaml'))) {
      pkgManager = 'pnpm';
    } else if (fs.existsSync(path.join(root, 'yarn.lock'))) {
      pkgManager = 'yarn';
    }

    // Helper for commands
    const getCmd = (npmCmd: string, yarnCmd: string, pnpmCmd: string) => {
      if (pkgManager === 'yarn') return yarnCmd;
      if (pkgManager === 'pnpm') return pnpmCmd;
      return npmCmd;
    };

    // install husky
    await runCommand(
      getCmd('npm install husky -D', 'yarn add husky -D', 'pnpm add husky -D'),
      root,
      'install husky package',
    );

    // configure husky prepare
    if (pkgManager === 'yarn') {
      // Detect yarn version
      let yarnVersion = '1';
      try {
        const { execSync } = require('child_process');
        yarnVersion = execSync('yarn --version', { cwd: root, encoding: 'utf8' }).trim();
      } catch (e) {
        log.warn(Colors.WARNING('⚠️ Could not determine Yarn version, defaulting to 1.x.'));
        log.info(Colors.YELLOW('💡 Tip: Make sure Yarn is installed and available in your PATH.'));
        log.warn(e);
      }
      if (yarnVersion.startsWith('1.')) {
        // Edit package.json directly
        const pkgPath = path.join(root, 'package.json');
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        pkg.scripts = pkg.scripts || {};
        pkg.scripts.prepare = 'npx husky';
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
      } else {
        // yarn v2+
        await runCommand(
          'yarn pkg set scripts.prepare="npx husky"',
          root,
          'husky prepare script added in the package.json',
        );
      }
    } else {
      await runCommand(
        getCmd(
          'npm pkg set scripts.prepare="npx husky"',
          '', // yarn handled above
          'pnpm pkg set scripts.prepare="npx husky"',
        ),
        root,
        'husky prepare script added in the package.json',
      );
    }

    // run husky prepare
    await runCommand(getCmd('npm run prepare', 'yarn prepare', 'pnpm prepare'), root, 'run prepare script');

    // install commitlint
    await runCommand(
      getCmd(
        'npm install @commitlint/cli @commitlint/config-conventional -D -W',
        'yarn add @commitlint/cli @commitlint/config-conventional -D',
        'pnpm add @commitlint/cli @commitlint/config-conventional -D',
      ),
      root,
      'commitlint installation complete',
    );

    // Ejecutar husky install para inicializar la carpeta .husky si no existe
    await runCommand(
      getCmd('npx husky install', 'yarn husky install', 'pnpm husky install'),
      root,
      'husky install para inicializar .husky',
    );

    // Asegurar que la carpeta .husky existe antes de manipular hooks
    const huskyDir = path.join(root, '.husky');
    if (!fs.existsSync(huskyDir)) {
      fs.mkdirSync(huskyDir);
    }
    // delete .husky/commit-msg
    await runCommand('rm -rf .husky/commit-msg', root, 'commit-msg deleted');
    // delete commitlint.config.js
    await runCommand('rm -rf ./commitlint.config.js', root, 'commitlint.config.js deleted');

    // create commitlint.config.js
    await this.filesUtils.createFile(path.join(root, 'commitlint.config.js'), COMMIT_LINT_SETTINGS_CODE);

    // create .husky/commit-msg
    try {
      await this.filesUtils.createFile(path.join(root, '.husky/commit-msg'), HUSKY_COMMIT_MESSAGE_CODE);
    } catch (err) {
      log.warn(Colors.WARNING('⚠️ Could not create Husky commit-msg hook.'));
      log.info(Colors.YELLOW('💡 Tip: Check permissions for the .husky folder and try again.'));
      log.warn(err);
    }

    // add husky hook for prepare-commit-msg
    await runCommand('chmod ug+x .husky/*', root, 'husky hooks permissions set');
  }
}
