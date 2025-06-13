import { Command, Flags } from '@oclif/core';
import { Colors } from '../../../api';
import { CLI_NAME } from '../../../shared/constants/commands';
import { setupConventional } from '../../../modules/apps/git/setup/conventional';
import { globalFlags } from '@shared';

export default class Release extends Command {
  static description = 'Set up conventional commits with Husky and Commitlint for selected repositories (only for Git users)';

  static examples = [
    `${Colors.PINK(`${CLI_NAME} git setup conventional`)}`,
    `${Colors.PINK(`${CLI_NAME} git setup conventional -l`)}`,
  ];

  static flags = {
    ...globalFlags,
    list: Flags.boolean({
      description: 'List all projects to select for conventional commits setup',
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
