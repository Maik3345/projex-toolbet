import { Colors } from '@api';
import { setupGitRepository } from '@modules';
import { Command, Flags } from '@oclif/core';
import { CLI_NAME, globalFlags } from '@shared';

export default class GitSetup extends Command {
  static description = 'Initialize base files for managing documentation and versioning in a Git repository';

  static examples = [`${Colors.PINK(`${CLI_NAME} git init`)}`];

  static flags = {
    ...globalFlags,
    list: Flags.boolean({
      description: 'List all projects to select from for setup',
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
