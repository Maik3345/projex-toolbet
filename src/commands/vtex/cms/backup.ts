import { Colors } from '@api';
import { backup } from '@modules';
import { Args, Command } from '@oclif/core';
import { VTEX_CMS_DEFAULT_SITE, CLI_NAME, globalFlags } from '@shared';

export default class Backup extends Command {
  static description = `Download all checkout files from a VTEX site for backup or migration. Useful for versioning, disaster recovery, or moving between accounts. Shows clear output and actionable tips if something fails.`;

  static examples = [
    `${Colors.PINK(CLI_NAME + ' vtex cms backup')}   # Backup files from the default VTEX site`,
    `${Colors.PINK(CLI_NAME + ' vtex cms backup my-site')}   # Backup files from a specific site`,
  ];

  static args = {
    site: Args.string({
      description: `The VTEX site/account to back up. Defaults to 'default'. Useful for multi-account setups.`,
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
