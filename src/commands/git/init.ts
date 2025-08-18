import { Colors } from '@api';
import { Command, Flags } from '@oclif/core';
import { CLI_NAME, globalFlags } from '@shared';

export default class GitSetup extends Command {
  public static readonly description =
    'Quickly set up essential files for documentation and versioning in your Git repository. Creates README, CHANGELOG, .gitignore, and docs folder with best practices.';

  public static readonly examples = [
    Colors.PINK(CLI_NAME + ' git init') + '   # Set up docs and changelog in the current repo',
    Colors.PINK(CLI_NAME + ' git init') + ' --list   # Select from multiple projects to initialize',
  ];

  public static readonly flags = {
    ...globalFlags,
    list: Flags.boolean({
      description: 'Show a list of all detected projects and select where to initialize base files.',
      char: 'l',
      default: false,
    }),
  };

  async run() {
    const {
      flags: { list },
    } = await this.parse(GitSetup);

    const { setupGitRepository } = await import('@modules');
    await setupGitRepository({
      list,
    });
  }
}
