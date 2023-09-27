import { ColorifyConstants, CustomCommand } from "../../api";
import { login } from "../../modules";
import { TOOLBET_NAME } from "../../shared";

export default class Login extends CustomCommand {
  static description = `Command to make login in VTEX, this command use the api key and api token to get the auth token and save in the config file of vtex to allow the process to use the vtex cli`;

  static examples = [
    `${ColorifyConstants.COMMAND_OR_RELEASE_REF(
      `${TOOLBET_NAME} vtex login [YourAccount] user@email.com master [YourApiKey] [YourApiToken]]`
    )}`,
    ,
  ];

  static flags = {
    ...CustomCommand.globalFlags,
  };

  static args = [
    {
      name: "account",
      description: `Define the account to set in the config file`,
    },
    {
      name: "email",
      description: `Define the user email to set in the config file`,
    },
    {
      name: "workspace",
      description: `Define the workspace to use in the process`,
    },
    {
      name: "apiKey",
      description: `Pass your api key to use in the process`,
    },
    {
      name: "apiToken",
      description: `Pass your api token to use in the process`,
    },
  ];

  async run() {
    const {
      args: { account, email, workspace, apiKey, apiToken },
    } = this.parse(Login);
    await login(account, email, workspace, apiKey, apiToken);
  }
}
