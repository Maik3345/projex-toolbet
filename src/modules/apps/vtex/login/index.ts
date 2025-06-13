import { ConfigVtexJson, log } from '@shared';
import { saveVtexConfig, serviceGetAuth } from './util';
import { Colors } from '@api';

export const login = async function (
  account: string | undefined,
  email: string | undefined,
  workspace: string | undefined,
  apiKey: string | undefined,
  apiToken: string | undefined,
  exitOnError = true, // Parámetro adicional para controlar si se debe salir en caso de error
) {
  if (!account || !email || !workspace || !apiKey || !apiToken) {
    log.error(Colors.ERROR('please provide all the required parameters to log in.'));
    if (exitOnError) {
      process.exit(1);
    } else {
      throw new Error('Missing required parameters');
    }
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
    return true;
  } else {
    log.error('error while obtaining authentication token');
    if (exitOnError) {
      process.exit(1);
    } else {
      throw new Error('Failed to obtain authentication token');
    }
  }
};
