import { ColorifyConstants, CustomCommand } from "../../../api";
import { changelogUpdate } from "../../../modules";
import { supportedChangelogTypes } from "../../../modules/apps/git/changelog/constants";
import { TOOLBET_NAME } from "../../../shared";

export default class UpdateChangelog extends CustomCommand {
  static description =
    "(Only for git users) Update the changelog file with the latest changes in the current branch or with the provided content.";

  static examples = [
    `${ColorifyConstants.COMMAND_OR_RELEASE_REF(
      `${TOOLBET_NAME} git update changelog`
    )} Changed`,
    `${ColorifyConstants.COMMAND_OR_RELEASE_REF(
      `${TOOLBET_NAME} git update changelog`
    )} Major "["test-change-01, "test-change-02"]"`,
  ];

  static flags = {
    ...CustomCommand.globalFlags,
  };

  static args = [
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
      args: { changeLogReleaseType, changelogContent },
    } = this.parse(UpdateChangelog);

    await changelogUpdate(changeLogReleaseType, changelogContent);
  }
}
