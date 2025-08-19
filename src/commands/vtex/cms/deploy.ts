import { Colors } from '@api';
import { Args, Command, Flags } from '@oclif/core';
import { CLI_NAME, globalFlags, VTEX_CMS_DEFAULT_SITE } from '@shared';

export default class Deploy extends Command {
  public static readonly description = `Deploy local files to the checkout of a VTEX site. Useful for updating themes, assets, or custom code. Supports batch deploy, auto-confirmation, and clear error output.`;

  public static readonly examples = [
    `${Colors.PINK(CLI_NAME + ' vtex cms deploy')}   # Deploy to the default VTEX site`,
    `${Colors.PINK(CLI_NAME + ' vtex cms deploy my-site')}   # Deploy to a specific site`,
    `${Colors.PINK(CLI_NAME + ' vtex cms deploy --yes')}   # Deploy and auto-confirm all prompts`,
  ];

  public static readonly args = {
    extension: Args.string({
      description: `File extension or type to deploy (optional).`,
    }),
    site: Args.string({
      description: `The VTEX site/account to deploy to. Defaults to 'default'. Useful for multi-site setups.`,
    }),
  };

  public static readonly flags = {
    ...globalFlags,
    yes: Flags.boolean({
      description: 'Automatically answer yes to all prompts (non-interactive mode).',
      char: 'y',
      default: false,
      required: false,
    }),
  };

  async run() {
    const { args, flags } = await this.parse(Deploy);
    const { yes } = flags;
    const { site = VTEX_CMS_DEFAULT_SITE, extension } = args;

    const { deploy } = await import('@modules');
    await deploy(extension, { yes }, site);
  }
}
