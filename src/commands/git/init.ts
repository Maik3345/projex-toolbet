import { flags as oclifFlags } from "@oclif/command";
import { ColorifyConstants, CustomCommand } from "../../api";
import { setupGitRepository } from "../../modules";
import { TOOLBET_NAME } from "../../shared";

export default class GitSetup extends CustomCommand {
  static description =
    "(Only for git users) Add base files for manage the documentation and versioning in the  git repository";

  static examples = [
    `${ColorifyConstants.COMMAND_OR_RELEASE_REF(`${TOOLBET_NAME} git init`)}`,
  ];

  static flags = {
    ...CustomCommand.globalFlags,
    list: oclifFlags.boolean({
      description: "List all projects to select to setup.",
      char: "l",
      default: false,
    }),
  };

  async run() {
    const {
      flags: { list },
    } = this.parse(GitSetup);

    await setupGitRepository({
      list,
    });
  }
}
