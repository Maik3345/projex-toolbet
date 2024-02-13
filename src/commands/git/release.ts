import { flags as oclifFlags } from "@oclif/command";
import { ColorifyConstants, CustomCommand } from "../../api";
import { release } from "../../modules";
import {
  releaseTypeAliases,
  supportedChangelogTypes,
  supportedReleaseTypes,
  supportedTagNames,
} from "../../modules/apps/git/release/constants";
import { TOOLBET_NAME } from "../../shared";

export default class Release extends CustomCommand {
  static description =
    "(Only for git users) Bumps the app version, commits, and pushes to remote the app in the current directory.";

  static examples = [
    `${ColorifyConstants.COMMAND_OR_RELEASE_REF(
      `${TOOLBET_NAME} git  release`
    )}`,
    `${ColorifyConstants.COMMAND_OR_RELEASE_REF(
      `${TOOLBET_NAME} git release`
    )} patch`,
    `${ColorifyConstants.COMMAND_OR_RELEASE_REF(
      `${TOOLBET_NAME} git release`
    )} patch beta`,
    `${ColorifyConstants.COMMAND_OR_RELEASE_REF(
      `${TOOLBET_NAME} git release`
    )} minor stable`,
    `${ColorifyConstants.COMMAND_OR_RELEASE_REF(
      `${TOOLBET_NAME} git release`
    )} pre`,
    `${ColorifyConstants.COMMAND_OR_RELEASE_REF(
      `${TOOLBET_NAME} git release prerelease stable Major "["test-change-01, "test-change-02"]"`
    )}`,
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
    "no-tag": oclifFlags.boolean({
      description: "Automatic tag the release.",
      default: false,
    }),
    "get-version": oclifFlags.boolean({
      description: "Only get the current version.",
      default: false,
    }),
  };

  static args = [
    {
      name: "releaseType",
      required: false,
      default: "patch",
      options: [
        ...Object.keys(releaseTypeAliases),
        ...Object.keys(supportedReleaseTypes),
      ],
      description: `Release type.`,
    },
    {
      name: "tagName",
      required: false,
      default: "beta",
      options: Object.keys(supportedTagNames),
      description: `Tag name.`,
    },
    {
      name: "changeLogReleaseType",
      required: false,
      default: supportedChangelogTypes.Changed,
      options: [...Object.keys(supportedChangelogTypes)],
      description: `Changelog release type.`,
    },
    {
      name: "changelogContent",
      required: false,
      default: "",
      description: `Pass the list of comments in a string, this content is used to generate the changelog file changes without use the git rev-list, example: "["test-change-01, "test-change-02"]"`,
    },
  ];

  async run() {
    const {
      flags: { yes },
      flags,
      args: { releaseType, tagName, changeLogReleaseType, changelogContent },
    } = this.parse(Release);

    await release(
      releaseType,
      tagName,
      changeLogReleaseType,
      changelogContent,
      {
        yes,
        noDeploy: flags["no-deploy"],
        noPush: flags["no-push"],
        noCheckRelease: flags["no-check-release"],
        noTag: flags["no-tag"],
        getVersion: flags["get-version"],
      }
    );
  }
}
