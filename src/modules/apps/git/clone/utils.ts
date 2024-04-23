import { getCurrentDirectory } from '@api';
import { log, runCommand } from '@shared';

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
      log.info(`Cloning repository: ${repository}`);
      return runCommand(`git clone ${this.repositoryUrl}${repository}`, this.root, 'Cloned');
    } catch (e: any) {
      log.error(`Clone repository ${repository} failed: ${e.message}`);
      log.verbose(e);
    }
  };

  public checkDirectory = (repository: string) => {
    try {
      return fs.existsSync(repository);
    } catch (error) {
      return false;
    }
  };
}
