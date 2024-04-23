const chalk = require('chalk');
const ora = require('ora');
import { ConfigVtexJson, log } from '@shared';
import { saveVtexConfig, serviceGetAuth } from './util';

export const login = async function (
  account: string | undefined,
  email: string | undefined,
  workspace: string | undefined,
  apiKey: string | undefined,
  apiToken: string | undefined,
) {
  if (!account || !email || !workspace || !apiKey || !apiToken) {
    log.error('Please provide all the required arguments.');
    process.exit(1);
  }

  const spinner = ora('Getting authentication token...').start();
  spinner.stop();
  const auth = await serviceGetAuth(account, apiKey, apiToken);
  spinner.start();

  if (auth) {
    const authToken: string = auth.data.token;

    // Print information
    spinner.succeed(`Authentication token obtained: ${chalk.redBright(authToken.slice(1, 20))}...`);

    log.info('vtex json save successfully');

    // Options for the config.json file
    const options: ConfigVtexJson = {
      account: account,
      token: authToken,
      workspace,
      login: email,
      env: 'prod',
    };
    // 1. Overwrite the config file from Vtex
    await saveVtexConfig(options);

    spinner.succeed(`You are now logged in to Vtex!`);
  } else {
    spinner.fail('Error while obtaining authentication token');
    log.error('Error while obtaining authentication token');
    process.exit(1);
  }
};
