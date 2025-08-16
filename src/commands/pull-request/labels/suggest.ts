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
    `${Colors.PINK(`${CLI_NAME} pull-request labels suggest`)} --target master --verbose`,
    `${Colors.PINK(`${CLI_NAME} pull-request labels suggest`)} --target main --format txt`,
    `${Colors.PINK(`${CLI_NAME} pull-request labels suggest`)} --format table --verbose`,
    `${Colors.PINK(`${CLI_NAME} pull-request labels suggest`)} --format csv --no-fetch`,
  ];

  static flags = {
    ...globalFlags,
    branch: Flags.string({
      description: 'The branch to analyze for label suggestions. Defaults to current branch.',
      char: 'b',
      required: false,
    }),
    target: Flags.string({
      description: 'The target branch to compare against. If not specified, attempts to detect the default branch (main, master, develop, etc.).',
      char: 't',
      required: false,
    }),
    format: Flags.string({
      description: 'Output format for the suggested labels.',
      char: 'f',
      required: false,
      default: 'json',
      options: ['json', 'table', 'list', 'txt', 'csv'],
    }),
    'no-fetch': Flags.boolean({
      description: 'Skip automatic fetching of target branch from remote if not available locally.',
      required: false,
      default: false,
    }),
  };

  async run() {
    const {
      flags: { branch, target, format, verbose, 'no-fetch': noFetch },
    } = await this.parse(Suggest);

    await suggestLabels({
      branch,
      target,
      format: format as 'json' | 'table' | 'list' | 'txt' | 'csv',
      verbose,
      noFetch,
    });
  }
}
