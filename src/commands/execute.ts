import { CustomCommand } from "../api/oclif/CustomCommand";
import { execute } from "../modules/apps";

import { ColorifyConstants } from "../api/constants/Colors";

export default class Browse extends CustomCommand {
  static description = `Run a command and accept the ask question by default with yes "y"`;

  static examples = [
    `${ColorifyConstants.COMMAND_OR_VTEX_REF(
      "puntoscolombia execute "
    )} 'vtex release minor stable' or ${ColorifyConstants.COMMAND_OR_VTEX_REF(
      "puntoscolombia execute "
    )} 'git status'`,
  ];

  static flags = {
    ...CustomCommand.globalFlags,
  };

  static args = [
    {
      name: "command",
      description: `Define the command to execute ${ColorifyConstants.ID(
        "vtex release minor stable"
      )}, when you use this command we detect any message with the question "Yes/Not" and we response "y" automatically`,
    },
  ];

  async run() {
    const {
      args: { command },
    } = this.parse(Browse);
    await execute(command);
  }
}
