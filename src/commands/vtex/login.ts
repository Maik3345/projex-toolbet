import { Colors } from '@api';
import { login } from '@modules';
import { Args, Command } from '@oclif/core';
import { CLI_NAME, globalFlags } from '@shared';

export default class Login extends Command {
  static description = `Log in to VTEX using your account, email, workspace, API key, and API token. Stores credentials in the VTEX config file for seamless CLI usage and automation.`;

  static examples = [
    `${Colors.PINK(CLI_NAME + ' vtex login myaccount user@email.com dev myapikey myapitoken')}   # Log in to VTEX with all parameters`,
    `${Colors.PINK(CLI_NAME + ' vtex login myaccount user@email.com dev')}   # Log in with just account, email, and workspace`,
  ];

  static args = {
    account: Args.string({
      description: `Your VTEX account name.`,
    }),
    email: Args.string({
      description: `Your VTEX user email.`,
    }),
    workspace: Args.string({
      description: `Workspace to use (e.g. dev, master).`,
    }),
    apiKey: Args.string({
      description: `API key for authentication (optional).`,
    }),
    apiToken: Args.string({
      description: `API token for authentication (optional).`,
    }),
  };

  static flags = {
    ...globalFlags,
  };

  async run() {
    const { args } = await this.parse(Login);
    const { account, email, workspace, apiKey, apiToken } = args;
    await login(account, email, workspace, apiKey, apiToken);
  }
}
