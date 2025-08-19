import { Colors } from '@api';
import { Command, Flags } from '@oclif/core';
import { CLI_NAME, globalFlags } from '@shared';

export default class Suggest extends Command {
  public static readonly description =
    'Automatically suggest smart labels for your pull requests based on code changes, commit messages, and file types. Supports size/type/scope labels, color output, and multiple formats. Great for CI/CD and team consistency.';

  public static readonly examples = [
    `${Colors.PINK(CLI_NAME + ' pull-request labels suggest')}   # Suggest labels for current branch`,
    `${Colors.PINK(
      CLI_NAME + ' pull-request labels suggest --branch feature/new-component',
    )}   # Analyze a specific branch`,
    `${Colors.PINK(
      CLI_NAME + ' pull-request labels suggest --target main --format table',
    )}   # Output as table comparing to main`,
    `${Colors.PINK(
      CLI_NAME + ' pull-request labels suggest --format csv --colors',
    )}   # Output as CSV with color codes`,
    `${Colors.PINK(CLI_NAME + ' pull-request labels suggest --no-fetch')}   # Skip fetching remote branches`,
  ];

  public static readonly flags = {
    ...globalFlags,
    branch: Flags.string({
      description: 'Branch to analyze for label suggestions. Defaults to the current branch.',
      char: 'b',
      required: false,
    }),
    target: Flags.string({
      description: 'Target branch to compare against. Auto-detects main, master, develop, etc. if not specified.',
      char: 't',
      required: false,
    }),
    format: Flags.string({
      description: 'Output format for suggested labels: json, table, list, txt, or csv.',
      char: 'f',
      required: false,
      default: 'json',
      options: ['json', 'table', 'list', 'txt', 'csv'],
    }),
    colors: Flags.boolean({
      description: 'Include recommended color for each label (useful for GitHub/GitLab automation).',
      required: false,
      default: false,
    }),
    'no-fetch': Flags.boolean({
      description: 'Do not fetch target branch from remote if not available locally.',
      required: false,
      default: false,
    }),
  };

  async run() {
    const {
      flags: { branch, target, format, verbose, colors, 'no-fetch': noFetch },
    } = await this.parse(Suggest);

    const { suggestLabels } = await import('@modules');
    await suggestLabels({
      branch,
      target,
      format: format as 'json' | 'table' | 'list' | 'txt' | 'csv',
      verbose,
      colors,
      noFetch,
    });
  }
}
