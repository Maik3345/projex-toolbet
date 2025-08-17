import { FilesUtils, runCommand, COMMIT_LINT_SETTINGS_CODE, HUSKY_COMMIT_MESSAGE_CODE } from '@shared';
import * as path from 'path';

export class SetupConventionalUtil {
  private filesUtils: FilesUtils;

  constructor() {
    this.filesUtils = new FilesUtils();
  }

  /* The `setupConventional` function is responsible for setting up Husky, Commitlint and CHANGELOG.md in a given project
  directory. Here's a breakdown of what it does: */
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
        console.warn('Could not determine Yarn version, defaulting to 1.x');
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
      // Si falla, mostrar advertencia pero no detener el flujo
      console.warn('No se pudo crear el hook commit-msg:', err);
    }

    // add husky hook for prepare-commit-msg
    await runCommand('chmod ug+x .husky/*', root, 'husky hooks permissions set');
  }
}
