import { log } from '../logger';

const inquirer = require('inquirer');

export class PromptsUtils {
  /* The `continuePrompt` function is a method of the `PromptsUtils` class. It takes a `message`
  parameter of type string. */
  continuePrompt = async (message: string) => {
    const prompt = await inquirer.prompt({
      name: 'proceed',
      message: message,
      type: 'confirm',
    });
    const proceed = prompt.proceed;

    if (!proceed) {
      log.info('process finished successfully.');
      process.exit();
    }
  };
}
