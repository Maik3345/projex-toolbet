import { Colors } from '@api';
import { Command, Flags } from '@oclif/core';
import { CLI_NAME, globalFlags } from '@shared';
export default class Release extends Command {
  public static readonly description =
    'Add all required files and folders for Azure DevOps CI/CD setup. Instantly create templates, pipelines, and configuration files for best practices and automation.';

  public static readonly examples = [
    `${Colors.PINK(CLI_NAME + ' git setup devops template')}   # Add Azure DevOps templates to the current project`,
    `${Colors.PINK(CLI_NAME + ' git setup devops template --list')}   # Select from multiple projects to add templates`,
  ];

  public static readonly flags = {
    ...globalFlags,
    list: Flags.boolean({
      description: 'Show a list of all detected projects and select where to add DevOps templates.',
      char: 'l',
      default: false,
    }),
  };

  async run() {
    const {
      flags: { list },
    } = await this.parse(Release);

    const { setupDevopsTemplates } = await import('@modules');
    await setupDevopsTemplates({
      list,
    });
  }
}
