import { Colors } from '@api';
import { setupGitRepository } from '@modules';
import { Command, Flags } from '@oclif/core';
import { CLI_NAME, globalFlags } from '@shared';

export default class GitSetup extends Command {
  static description = 'Quickly set up essential files for documentation and versioning in your Git repository. Creates README, CHANGELOG, .gitignore, and docs folder with best practices.';

  static examples = [
    `${Colors.PINK(`${CLI_NAME} git init`)}   # Set up docs and changelog in the current repo`,
    `${Colors.PINK(`${CLI_NAME} git init`)} --list   # Select from multiple projects to initialize`,
  ];

  static flags = {
    ...globalFlags,
    list: Flags.boolean({
      description: 'Show a list of all detected projects and select where to initialize base files.',
      char: 'l',
      default: false,
    }),
  };

  async run() {
    const {
      flags: { list },
    } = await this.parse(GitSetup);

    await setupGitRepository({
      list,
    });
  }
}
