import { ColorifyConstants, CustomCommand } from "../../api";
import { vtexRunCommand } from "../../modules";
import { TOOLBET_NAME } from "../../shared";

export default class Browse extends CustomCommand {
  static description = `Run a command and accept the ask question by default with yes "y"`;

  static examples = [
    `${ColorifyConstants.COMMAND_OR_RELEASE_REF(
      `${TOOLBET_NAME} vtex run`
    )} 'vtex release minor stable' or ${ColorifyConstants.COMMAND_OR_RELEASE_REF(
      `${TOOLBET_NAME} vtex run`
    )} 'git status'`,
  ];

  static flags = {
    ...CustomCommand.globalFlags,
  };

  static args = [
    {
      name: "command",
      description: `Define the command to run ${ColorifyConstants.ID(
        "vtex release minor stable"
      )}, when you use this command we detect any message with the question "Yes/Not" and we response "y" automatically or if the command finish with errors whe finish with a Throw error to finish all process`,
    },
  ];

  async run() {
    const {
      args: { command },
    } = this.parse(Browse);
    await vtexRunCommand(command);
  }
}
