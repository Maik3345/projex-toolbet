import { Colors } from '@api';
import { login } from '@modules';
import { Args, Command } from '@oclif/core';
import { CLI_NAME, globalFlags } from '@shared';

export default class Login extends Command {
  static description = `Command to log in to VTEX. This command uses the API key and API token to obtain the authentication token and save it in the VTEX config file, allowing the process to use the VTEX CLI.`;

  static examples = [
    `${Colors.PINK(`${CLI_NAME} vtex login [YourAccount] [YourEmail] [YourWorkspace] [YourApiKey] [YourApiToken]`)}`,
  ];

  static args = {
    account: Args.string({
      description: `Specify the account to set in the config file.`,
    }),
    email: Args.string({
      description: `Specify the user email to set in the config file.`,
    }),
    workspace: Args.string({
      description: `Specify the workspace to use in the process.`,
    }),
    apiKey: Args.string({
      description: `Specify your API key to use in the process.`,
    }),
    apiToken: Args.string({
      description: `Specify your API token to use in the process.`,
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
