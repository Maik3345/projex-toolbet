import { Command, Flags } from '@oclif/core';
import { Colors } from '../../../api';
import { CLI_NAME } from '../../../shared/constants/commands';
import { setupHusky } from '../../../modules/apps/git/setup/husky';

export default class Release extends Command {
  static description = 'Set up Husky for selected repositories (only for Git users)';

  static examples = [
    `${Colors.COMMAND_OR_RELEASE_REF(`${CLI_NAME} git setup husky`)}`,
    `${Colors.COMMAND_OR_RELEASE_REF(`${CLI_NAME} git setup husky -l`)}`,
  ];

  static flags = {
    list: Flags.boolean({
      description: 'List all projects to select for Husky setup',
      char: 'l',
      default: false,
    }),
  };

  async run() {
    const {
      flags: { list },
    } = await this.parse(Release);

    await setupHusky({
      list,
    });
  }
}
