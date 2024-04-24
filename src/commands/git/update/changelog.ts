import { Colors } from '@api';
import { changelogUpdate, supportedChangelogTypes } from '@modules';
import { Args, Command } from '@oclif/core';
import { CLI_NAME, globalFlags } from '@shared';

export default class UpdateChangelog extends Command {
  static description =
    'Update the changelog file with the latest changes in the current branch or with the provided content. (Only for git users)';

  static examples = [
    `${Colors.PINK(`${CLI_NAME} git update changelog`)} [releaseType]`,
    `${Colors.PINK(`${CLI_NAME} git update changelog`)} Major '${'test-change-01\\ntest-change-02'}'`,
  ];

  static flags = {
    ...globalFlags,
  };

  static args = {
    releaseType: Args.string({
      required: false,
      default: supportedChangelogTypes.Changed,
      options: [...Object.keys(supportedChangelogTypes)],
      description: `The type of release for the changelog.`,
    }),
    changelogContent: Args.string({
      required: false,
      default: '',
      description: `Pass the list of comments in a string. This content is used to generate the changelog file changes without using git rev-list. Example: 'test-change-01\\ntest-change-02'. Use '\\\\n' to separate the comments without adding space between them.`,
    }),
  };

  async run() {
    const {
      args: { releaseType, changelogContent },
    } = await this.parse(UpdateChangelog);

    await changelogUpdate(releaseType, changelogContent);
  }
}
