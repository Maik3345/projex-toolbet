import { Colors } from '@api';
import { clone } from '@modules';
import { Args, Command } from '@oclif/core';
import { CLI_NAME, globalFlags } from '@shared';

export default class Release extends Command {
  static description = 'Clone the specified repositories (Only for git users)';

  static examples = [
    `${Colors.PINK(`${CLI_NAME} git clone 'https://dev.azure.com/Team/Project/_git/' 'my-project-1, my-project-2'`)}`,
  ];

  static flags = {
    ...globalFlags,
  };

  static args = {
    repositoryUrl: Args.string({
      required: true,
      default: '',
      description: `Specify the base repository URL`,
    }),
    repositoryList: Args.string({
      required: true,
      default: '',
      description: `Specify the list of repositories to be cloned, separated by commas`,
    }),
  };

  async run() {
    const {
      args: { repositoryUrl, repositoryList },
    } = await this.parse(Release);

    await clone(repositoryUrl, repositoryList);
  }
}
