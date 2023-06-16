import { ColorifyConstants } from "../../../api/constants/Colors";
import { CustomCommand } from "../../../api/oclif/CustomCommand";
import { deploy } from "../../../modules/apps";
import { DEFAULT_SITE_TO_UPLOAD } from "../../../shared";
import { flags as oclifFlags } from "@oclif/command";

export default class Deploy extends CustomCommand {
  static description = `Deploy a local files in the checkout of the current account`;

  static examples = [
    `${ColorifyConstants.COMMAND_OR_VTEX_REF(
      "puntoscolombia vtex cms backup"
    )}`,
    `${ColorifyConstants.COMMAND_OR_VTEX_REF(
      "untoscolombia vtex cms backup"
    )} puntoscolombiaio`,
  ];

  static args = [
    {
      name: "extension",
      description: `Define the account location to use, for default use ${ColorifyConstants.ID(
        "default"
      )} account of vtex, this is used when the account have multiple sub hosts`,
    },
    {
      name: "site",
      description: `Define the account location to use, for default use ${ColorifyConstants.ID(
        "default"
      )} account of vtex, this is used when the account have multiple sub hosts`,
    },
  ];

  static flags = {
    ...CustomCommand.globalFlags,
    yes: oclifFlags.boolean({
      description: "Answers yes to all prompts.",
      char: "y",
      default: false,
    }),
  };

  async run() {
    const {
      flags: { yes },
      args: { site = DEFAULT_SITE_TO_UPLOAD, extension },
    } = this.parse(Deploy);
    await deploy(extension, site, { yes });
  }
}
