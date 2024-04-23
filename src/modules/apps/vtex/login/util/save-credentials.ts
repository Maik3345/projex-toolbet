const Configstore = require('configstore');
import { homedir } from 'os';
import { join } from 'path';
import { log, ConfigVtexJson } from '@shared';

const VTEX_FOLDER = join(homedir(), '.vtex');
const SESSION_FOLDER = join(VTEX_FOLDER, 'session');
const SESSION_STORE_PATH = join(SESSION_FOLDER, 'session.json');
const TOKEN_CACHE_STORE_PATH = join(SESSION_FOLDER, 'tokens.json');
const WORKSPACE_METADATA_STORE_PATH = join(SESSION_FOLDER, 'workspace.json');

/**
 * The `saveVtexConfig` function saves the Vtex configuration provided as input to the appropriate
 * configuration files.
 * @param {ConfigVtexJson} configuration - The `configuration` parameter is an object of type
 * `ConfigVtexJson` which contains the following properties:
 */
export const saveVtexConfig = async (configuration: ConfigVtexJson) => {
  try {
    const conf = new Configstore('vtex');
    await conf.clear();
    conf.all = {
      account: configuration.account,
      token: configuration.token,
      workspace: configuration.workspace,
      login: configuration.login,
      _nextFeedbackDate: '2050-02-25T20:14:18.430Z',
      _numberOfReactLinks: null,
      _lastLinkReactDate: '2022-02-18T20:21:11.626Z',
    };

    new Configstore('', {}, { configPath: TOKEN_CACHE_STORE_PATH }).clear();
    new Configstore(
      '',
      {
        [configuration.account]: configuration.token,
      },
      { configPath: TOKEN_CACHE_STORE_PATH },
    );
    new Configstore(
      '',
      {},
      {
        configPath: WORKSPACE_METADATA_STORE_PATH,
      },
    ).clear();
    new Configstore(
      '',
      {
        currentWorkspace: configuration.workspace,
        lastWorkspace: null,
      },
      {
        configPath: WORKSPACE_METADATA_STORE_PATH,
      },
    );
    new Configstore('', {}, { configPath: SESSION_STORE_PATH }).clear();
    new Configstore(
      '',
      {
        account: configuration.account,
        login: configuration.login,
        token: configuration.token,
      },
      { configPath: SESSION_STORE_PATH },
    );

    log.info('vtex json save successfully');
  } catch (error) {
    log.error('Error on save the vtex file', error);
    process.exit(1);
  }
};
