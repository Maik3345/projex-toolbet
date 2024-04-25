import { ConfigVtexJson, log } from '@shared';
import { saveVtexConfig, serviceGetAuth } from './util';
import { Colors } from '@api';

export const login = async function (
  account: string | undefined,
  email: string | undefined,
  workspace: string | undefined,
  apiKey: string | undefined,
  apiToken: string | undefined,
) {
  if (!account || !email || !workspace || !apiKey || !apiToken) {
    log.error(Colors.ERROR('please provide all the required parameters to log in.'));
    process.exit(1);
  }

  const auth = await serviceGetAuth(account, apiKey, apiToken);

  if (auth) {
    const authToken: string = auth.data.token;

    log.info('saving the authentication token in the VTEX config file...');

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
  } else {
    log.error('error while obtaining authentication token');
    process.exit(1);
  }
};
