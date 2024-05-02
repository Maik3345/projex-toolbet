const GET_TOKEN = 'vtex local token';
const GET_ACCOUNT = 'vtex whoami';
export const unreleased = '## [Unreleased]';

export const Commands = {
  GET_ACCOUNT,
  GET_TOKEN,
};

export const ERROR_EXECUTION = ['[31merror[39m:', 'Error: Expected stable to be one of', 'See more help with --help'];

export const ERROR_TO_EXCLUDE = [
  'Failed to get dependencies GraphQL',
  'failed to install dependencies through yarn',
  'Connection to debug log server has failed with status',
  'Connection to event server has failed with',
  'ErrorID:',
];

export const SUCCESS_EXECUTION = ['Successfully deployed', 'You can deploy it with:'];

export const PROMPT_CONTINUE = ['(Y/n)'];

export const CLI_NAME = 'projex';
