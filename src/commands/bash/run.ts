import { flags as oclifFlags } from "@oclif/command";
import { ColorifyConstants, CustomCommand } from "../../api";
import { bashRunCommand } from "../../modules";
import { TOOLBET_NAME } from "../../shared";

export default class Browse extends CustomCommand {
  static description = `Run a command in the current directory or select multiple directories`;

  static examples = [
    `${ColorifyConstants.COMMAND_OR_RELEASE_REF(
      `${TOOLBET_NAME} bash run`
    )} 'git add . && git push'`,
  ];

  static flags = {
    ...CustomCommand.globalFlags,
    list: oclifFlags.boolean({
      description: "List all projects to run the command.",
      char: "l",
      default: false,
    }),
  };

  static args = [
    {
      name: "command",
      description: `Define the command to run ${ColorifyConstants.ID(
        "git add . && git push"
      )}`,
    },
  ];

  async run() {
    const {
      flags: { list },
      args: { command },
    } = this.parse(Browse);
    await bashRunCommand(command, { list });
  }
}
