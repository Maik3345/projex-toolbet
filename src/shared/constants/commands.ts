const GET_TOKEN = "vtex local token";
const GET_ACCOUNT = "vtex whoami";

export const Commands = {
  GET_ACCOUNT,
  GET_TOKEN,
};

export const ERROR_EXECUTION = [
  "[31merror[39m:",
  "Error: Expected stable to be one of",
  "See more help with --help",
];

export const SUCCESS_EXECUTION = [
  "Successfully deployed",
  "You can deploy it with:",
];

export const PROMPT_CONTINUE = ["(Y/n)"];
