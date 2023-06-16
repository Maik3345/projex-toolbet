import { ColorifyConstants } from "../../../api/constants/Colors";
import { CustomCommand } from "../../../api/oclif/CustomCommand";
import { backup } from "../../../modules/apps";
import { DEFAULT_SITE_TO_UPLOAD } from "../../../shared";

export default class Backup extends CustomCommand {
  static description = `Download the files from the checkout files of vtex`;

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
      name: "site",
      description: `Define the account location to use, for default use ${ColorifyConstants.ID(
        "default"
      )} account of vtex, this is used when the account have multiple sub hosts`,
    },
  ];


  static flags = {
    ...CustomCommand.globalFlags,
  }

  async run() {
    const {
      args: { site = DEFAULT_SITE_TO_UPLOAD },
    } = this.parse(Backup);
    await backup(site);
  }
}
