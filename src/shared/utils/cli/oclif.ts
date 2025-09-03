import { Flags } from '@oclif/core';

/**
 * Defines global CLI flags for Oclif commands.
 *
 * @property {boolean} verbose - Enables debug level logging when set.
 * @property {boolean} help - Displays the help message for the command.
 *
 * These flags can be included in any Oclif command to provide consistent
 * global options for verbosity and help output.
 */
export const globalFlags = {
  verbose: Flags.boolean({
    char: 'v',
    description: 'Shows debug level logs.',
    default: false,
  }),
  help: Flags.help({
    char: 'h',
    description: 'Shows this help message.',
  }),
};

/**
 * Additional oclif flag utilities can be added here.
 */
