import { Command, Flags } from '@oclif/core';
import { Colors } from '../../../api';
import { CLI_NAME } from '../../../shared/constants/commands';
import { setupConventional } from '../../../modules/apps/git/setup/conventional';
import { globalFlags } from '@shared';

export default class Release extends Command {
  static description = 'Set up Conventional Commits, Husky hooks, and Commitlint in your project for standardized commit messages and automated changelog. Great for teams and CI/CD.';

  static examples = [
    `${Colors.PINK(CLI_NAME + ' git setup conventional')}   # Set up in the current project`,
    `${Colors.PINK(CLI_NAME + ' git setup conventional -l')}   # Select from multiple projects`,
  ];

  static flags = {
    ...globalFlags,
    list: Flags.boolean({
      description: 'Show a list of all detected projects and select where to set up Conventional Commits.',
      char: 'l',
      default: false,
    }),
  };

  async run() {
    const {
      flags: { list },
    } = await this.parse(Release);

    await setupConventional({
      list,
    });
  }
}
