import { Colors } from '@api';
import { backup } from '@modules';
import { Args, Command } from '@oclif/core';
import { VTEX_CMS_DEFAULT_SITE, CLI_NAME, globalFlags } from '@shared';

export default class Backup extends Command {
  static description = `Download the files from the checkout files of a VTEX site`;

  static examples = [
    `${Colors.PINK(`${CLI_NAME} vtex cms backup`)}`,
    `${Colors.PINK(`${CLI_NAME} vtex cms backup`)} my-site`,
  ];

  static args = {
    site: Args.string({
      description: `Specify the account location to use. By default, the command uses the 'default' account of VTEX. This is useful when the account has multiple subhosts.`,
    }),
  };

  static flags = {
    ...globalFlags,
  };

  async run() {
    const { args } = await this.parse(Backup);
    const { site = VTEX_CMS_DEFAULT_SITE } = args;

    await backup(site);
  }
}
