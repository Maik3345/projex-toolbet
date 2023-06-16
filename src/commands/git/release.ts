import { CustomCommand } from "../../api/oclif/CustomCommand";

import { ColorifyConstants } from "../../api/constants/Colors";
import appsRelease, {
  releaseTypeAliases,
  supportedReleaseTypes,
  supportedTagNames,
} from "../../modules/apps/git/release";
import { flags as oclifFlags } from "@oclif/command";

export default class Release extends CustomCommand {
  static description =
    "(Only for git users) Bumps the app version, commits, and pushes to remote the app in the current directory.";

  static examples = [
    `${ColorifyConstants.COMMAND_OR_VTEX_REF("vtex release")}`,
    `${ColorifyConstants.COMMAND_OR_VTEX_REF("vtex release")} patch`,
    `${ColorifyConstants.COMMAND_OR_VTEX_REF("vtex release")} patch beta`,
    `${ColorifyConstants.COMMAND_OR_VTEX_REF("vtex release")} minor stable`,
    `${ColorifyConstants.COMMAND_OR_VTEX_REF("vtex release")} pre`,
  ];

  static flags = {
    ...CustomCommand.globalFlags,
    yes: oclifFlags.boolean({
      description: "Answers yes to all prompts.",
      char: "y",
      default: false,
    }),
    "no-push": oclifFlags.boolean({
      description: "Automatic push all changes?.",
      default: false,
    }),
    "no-deploy": oclifFlags.boolean({
      description: "Automatic run preRelease script from the manifest file.",
      default: false,
    }),
    "no-check-release": oclifFlags.boolean({
      description:
        "Automatic check if the release is valid and not have local changes.",
      default: false,
    }),
  };

  static args = [
    {
      name: "releaseType",
      required: false,
      default: "patch",
      options: [...Object.keys(releaseTypeAliases), ...supportedReleaseTypes],
      description: `Release type.`,
    },
    {
      name: "tagName",
      required: false,
      default: "beta",
      options: supportedTagNames,
      description: `Tag name.`,
    },
  ];

  async run() {
    const {
      flags: { yes },
      flags,
      args: { releaseType, tagName },
    } = this.parse(Release);

    await appsRelease(releaseType, tagName, {
      yes,
      noDeploy: flags["no-deploy"],
      noPush: flags["no-push"],
      noCheckRelease: flags["no-check-release"],
    });
  }
}
