import { Colors } from '@api';
import { setupDevopsTemplates } from '@modules';
import { Command, Flags } from '@oclif/core';
import { CLI_NAME } from '@shared';
export default class Release extends Command {
  static description = 'Add necessary files and folders for Azure DevOps setup';

  static examples = [
    `${Colors.COMMAND_OR_RELEASE_REF(`${CLI_NAME} git setup devops template`)}`,
    `This command adds the required files and folders for setting up Azure DevOps.`,
  ];

  static flags = {
    list: Flags.boolean({
      description: 'List all projects to select for template setup',
      char: 'l',
      default: false,
    }),
  };

  async run() {
    const {
      flags: { list },
    } = await this.parse(Release);

    await setupDevopsTemplates({
      list,
    });
  }
}
