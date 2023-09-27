import { flags as oclifFlags } from "@oclif/command";
import { TOOLBET_NAME } from "../../..//shared";
import { ColorifyConstants, CustomCommand } from "../../../api";
import { setupHusky } from "../../../modules";

export default class Release extends CustomCommand {
  static description =
    "(Only for git users) Add the husky setup to the selected repositories";

  static examples = [
    `${ColorifyConstants.COMMAND_OR_RELEASE_REF(
      `${TOOLBET_NAME} git setup husky`
    )}`,
  ];

  static flags = {
    ...CustomCommand.globalFlags,
    list: oclifFlags.boolean({
      description: "List all projects to select to setup husky.",
      char: "l",
      default: false,
    }),
  };

  async run() {
    const {
      flags: { list },
    } = this.parse(Release);

    await setupHusky({
      list,
    });
  }
}
