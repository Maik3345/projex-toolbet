import { Flags } from '@oclif/core';

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
