import { flags as oclifFlags } from "@oclif/command";
import { TOOLBET_NAME } from "../../../../shared";
import { ColorifyConstants, CustomCommand } from "../../../../api";
import { setupDevopsTemplates } from "../../../../modules";

export default class Release extends CustomCommand {
  static description =
    "Add the .azuredevops folder and create the PULL_REQUEST_TEMPLATE.md file";

  static examples = [
    `${ColorifyConstants.COMMAND_OR_RELEASE_REF(
      `${TOOLBET_NAME} git setup devops template`
    )}`,
  ];

  static flags = {
    ...CustomCommand.globalFlags,
    list: oclifFlags.boolean({
      description: "List all projects to select to setup the template.",
      char: "l",
      default: false,
    }),
  };

  async run() {
    const {
      flags: { list },
    } = this.parse(Release);

    await setupDevopsTemplates({
      list,
    });
  }
}
