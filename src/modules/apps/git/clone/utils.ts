import { Colors, getCurrentDirectory } from '@api';
import { log, runCommand } from '@shared';
import chalk from 'chalk';

const fs = require('fs');

export class CloneUtils {
  private repositoryUrl: string;
  private root: string;

  constructor(repositoryUrl: string) {
    this.repositoryUrl = repositoryUrl;
    this.root = getCurrentDirectory();
  }

  public cloneRepository = (repository: string) => {
    try {
      log.info(`cloning repository ${chalk.bold(repository)}...`);
      return runCommand(`git clone ${this.repositoryUrl}${repository}`, this.root, 'Cloned');
    } catch (e: any) {
      log.error(
        Colors.ERROR(`Failed to clone repository: ${chalk.bold(repository)}.`) +
        '\nTip: Check your network connection and repository URL.'
      );
      log.error(e);
    }
  };

  public checkDirectory = (repository: string) => {
    try {
      return fs.existsSync(repository);
    } catch {
      return false;
    }
  };
}
