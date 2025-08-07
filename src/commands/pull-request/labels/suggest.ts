import { Colors } from '@api';
import { suggestLabels } from '@modules';
import { Command, Flags } from '@oclif/core';
import { CLI_NAME, globalFlags } from '@shared';

export default class Suggest extends Command {
  static description =
    'Suggests labels for pull requests based on git changes, commit messages, and modified files.';

  static examples = [
    `${Colors.PINK(`${CLI_NAME} pull-request labels suggest`)}`,
    `${Colors.PINK(`${CLI_NAME} pull-request labels suggest`)} --branch feature/new-component`,
    `${Colors.PINK(`${CLI_NAME} pull-request labels suggest`)} --target main --verbose`,
    `${Colors.PINK(`${CLI_NAME} pull-request labels suggest`)} --format txt`,
    `${Colors.PINK(`${CLI_NAME} pull-request labels suggest`)} --format table --verbose`,
    `${Colors.PINK(`${CLI_NAME} pull-request labels suggest`)} --format csv`,
  ];

  static flags = {
    ...globalFlags,
    branch: Flags.string({
      description: 'The branch to analyze for label suggestions. Defaults to current branch.',
      char: 'b',
      required: false,
    }),
    target: Flags.string({
      description: 'The target branch to compare against. Defaults to main.',
      char: 't',
      required: false,
      default: 'main',
    }),
    format: Flags.string({
      description: 'Output format for the suggested labels.',
      char: 'f',
      required: false,
      default: 'json',
      options: ['json', 'table', 'list', 'txt', 'csv'],
    }),
  };

  async run() {
    const {
      flags: { branch, target, format, verbose },
    } = await this.parse(Suggest);

    await suggestLabels({
      branch,
      target,
      format: format as 'json' | 'table' | 'list' | 'txt' | 'csv',
      verbose,
    });
  }
}
