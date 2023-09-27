import chalk from "chalk";
import ora from "ora";
import { log, ConfigVtexJson } from "../../../../shared";
import { saveVtexConfig } from "./util/save-credentials";
import { serviceGetAuth } from "./util";

export const login = async function (
  account: string,
  email: string,
  workspace: string,
  apiKey: string,
  apiToken: string
) {
  const spinner = ora("Getting auth token \n").start();
  spinner.stop();
  const auth = await serviceGetAuth(account, apiKey, apiToken);
  spinner.start();

  if (auth) {
    const authToken: string = auth.data.token;

    // print information
    spinner.succeed(
      `auth token to use: ${chalk.redBright(authToken.slice(1, 20))}...`
    );

    log.info(
      `Credentials for use ${chalk.redBright(account)} as ${chalk.redBright(
        email
      )} at workspace ${chalk.redBright(workspace)}`
    );

    // options for the file config.json
    const options: ConfigVtexJson = {
      account: account,
      token: authToken,
      workspace,
      login: email,
      env: "prod",
    };
    // 1. Overrite the config file from vtex
    await saveVtexConfig(options);

    spinner.succeed(`Now you logged in Vtex!!`);
  } else {
    spinner.fail("Error on get auth token");
    log.error("Error on get auth token");
    process.exit(1);
  }
};
