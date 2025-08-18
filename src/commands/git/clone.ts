import { Colors } from '@api';
import { Args, Command } from '@oclif/core';
import { CLI_NAME, globalFlags } from '@shared';

export default class Release extends Command {
  public static readonly description =
    'Clone one or more repositories from a base URL. Useful for onboarding, monorepos, or batch cloning. Shows progress and actionable tips if cloning fails.';

  public static readonly examples = [
    `${Colors.PINK(
      CLI_NAME + ' git clone',
    )} 'https://dev.azure.com/Team/Project/_git/' 'my-project-1, my-project-2'   # Clone two Azure DevOps repos`,
    `${Colors.PINK(
      CLI_NAME + ' git clone',
    )} 'https://github.com/myorg/' 'repo1,repo2,repo3'   # Clone multiple GitHub repos`,
  ];

  public static readonly flags = {
    ...globalFlags,
  };

  public static readonly args = {
    repositoryUrl: Args.string({
      required: true,
      default: '',
      description: `The base URL for the repositories. Example: https://github.com/myorg/ or https://dev.azure.com/Team/Project/_git/`,
    }),
    repositoryList: Args.string({
      required: true,
      default: '',
      description: `Comma-separated list of repository names to clone. Example: repo1,repo2,repo3`,
    }),
  };

  async run() {
    const {
      args: { repositoryUrl, repositoryList },
    } = await this.parse(Release);

    const { clone } = await import('@modules');
    await clone(repositoryUrl, repositoryList);
  }
}
