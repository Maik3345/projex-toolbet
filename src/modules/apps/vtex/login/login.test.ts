import { login } from '../index';
import { serviceGetAuth, saveVtexConfig } from './util';
import { log } from '@shared';

jest.mock('@shared');
jest.mock('./util');

describe('login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should save the credentials to the config file', async () => {
    const account = 'my-account';
    const email = 'my-email';
    const workspace = 'my-workspace';
    const apiKey = 'my-api-key';
    const apiToken = 'my-api-token';
    const authToken = 'my-auth-token';
    const serviceGetAuthMock = serviceGetAuth as jest.MockedFunction<typeof serviceGetAuth>;
    serviceGetAuthMock.mockResolvedValueOnce({
      data: { token: authToken },
      status: 200,
      statusText: 'OK',
      config: {
        headers: {} as any,
        url: 'https://api.vtex.com',
      },
      headers: {} as any,
    });

    await login(account, email, workspace, apiKey, apiToken);
    saveVtexConfig({
      account,
      token: authToken,
      workspace,
      login: email,
      env: 'prod',
    });
    expect(serviceGetAuthMock).toHaveBeenCalledWith(account, apiKey, apiToken);
    expect(log.info).toHaveBeenCalledWith('saving the authentication token in the VTEX config file...');
  });

  it('should log an error message and exit if no token information is found', async () => {
    const account = 'my-account';
    const email = 'my-email';
    const workspace = 'my-workspace';
    const apiKey = 'my-api-key';
    const apiToken = 'my-api-token';
    const processExitSpy = jest.spyOn(process, 'exit').mockImplementationOnce(() => {
      throw new Error('process.exit() was called.');
    });
    const serviceGetAuthMock = serviceGetAuth as jest.MockedFunction<typeof serviceGetAuth>;
    serviceGetAuthMock.mockResolvedValueOnce(undefined as any);

    await expect(login(account, email, workspace, apiKey, apiToken)).rejects.toThrowError('process.exit() was called.');
    expect(log.error).toHaveBeenCalledWith('error while obtaining authentication token');
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
