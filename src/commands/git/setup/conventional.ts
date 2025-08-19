import { Command, Flags } from '@oclif/core';
import { globalFlags } from '@shared';
import { Colors } from '../../../api';
import { CLI_NAME } from '../../../shared/constants/commands';

export default class Release extends Command {
  public static readonly description =
    'Set up Conventional Commits, Husky hooks, and Commitlint in your project for standardized commit messages and automated changelog. Great for teams and CI/CD.';

  public static readonly examples = [
    `${Colors.PINK(CLI_NAME + ' git setup conventional')}   # Set up in the current project`,
    `${Colors.PINK(CLI_NAME + ' git setup conventional -l')}   # Select from multiple projects`,
  ];

  public static readonly flags = {
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

    const { setupConventional } = await import('../../../modules/apps/git/setup/conventional');
    await setupConventional({
      list,
    });
  }
}
