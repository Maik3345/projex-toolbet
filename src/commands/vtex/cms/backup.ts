import { Colors } from '@api';
import { Args, Command } from '@oclif/core';
import { CLI_NAME, globalFlags, VTEX_CMS_DEFAULT_SITE } from '@shared';

export default class Backup extends Command {
  public static readonly description = `Download all checkout files from a VTEX site for backup or migration. Useful for versioning, disaster recovery, or moving between accounts. Shows clear output and actionable tips if something fails.`;

  public static readonly examples = [
    `${Colors.PINK(CLI_NAME + ' vtex cms backup')}   # Backup files from the default VTEX site`,
    `${Colors.PINK(CLI_NAME + ' vtex cms backup my-site')}   # Backup files from a specific site`,
  ];

  public static readonly args = {
    site: Args.string({
      description: `The VTEX site/account to back up. Defaults to 'default'. Useful for multi-account setups.`,
    }),
  };

  public static readonly flags = {
    ...globalFlags,
  };

  async run() {
    const { args } = await this.parse(Backup);
    const { site = VTEX_CMS_DEFAULT_SITE } = args;

    const { backup } = await import('@modules');
    await backup(site);
  }
}
