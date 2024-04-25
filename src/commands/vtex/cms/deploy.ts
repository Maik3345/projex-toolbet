import { Colors } from '@api';
import { deploy } from '@modules';
import { Args, Command, Flags } from '@oclif/core';
import { VTEX_CMS_DEFAULT_SITE, CLI_NAME, globalFlags } from '@shared';

export default class Deploy extends Command {
  static description = `Deploy local files in the checkout of the current account`;

  static examples = [
    `${Colors.PINK(`${CLI_NAME} vtex cms deploy`)}`,
    `${Colors.PINK(`${CLI_NAME} vtex cms deploy`)} my-site`,
  ];

  static args = {
    extension: Args.string({
      description: `Specify the account location to use. By default, the ${Colors.GREEN(
        'default',
      )} account of VTEX is used. This is used when the account has multiple sub hosts.`,
    }),
    site: Args.string({
      description: `Specify the site to deploy to. By default, the ${Colors.GREEN(
        'default',
      )} site is used. This is used when the account has multiple sites.`,
    }),
  };

  static flags = {
    ...globalFlags,
    yes: Flags.boolean({
      description: 'Answer yes to all prompts.',
      char: 'y',
      default: false,
      required: false,
    }),
  };

  async run() {
    const { args, flags } = await this.parse(Deploy);
    const { yes } = flags;
    const { site = VTEX_CMS_DEFAULT_SITE, extension } = args;

    await deploy(extension, site, { yes });
  }
}
