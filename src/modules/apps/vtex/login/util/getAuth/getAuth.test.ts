import axios, { AxiosResponse } from 'axios';
import { serviceGetAuth } from '.';
import { log } from '@shared';

jest.mock('@shared');
jest.mock('axios');

describe('serviceGetAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send POST request and return status ok', async () => {
    // Mock axios
    const axiosMock = axios as jest.MockedFunction<typeof axios>;
    const mockResponse = {
      data: {},
      status: 200,
      statusText: 'ok',
    } as AxiosResponse;
    axiosMock.mockResolvedValue(mockResponse);

    // Call the function
    const result = await serviceGetAuth('account', 'apiKey', 'apiToken');

    // Check the axios call arguments
    expect(axiosMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: '{"appkey":"apiKey","apptoken":"apiToken"}',
        headers: {
          'Content-Type': 'application/json, application/json',
          Referer: '',
        },
        method: 'post',
        url: undefined,
      }),
    );

    // Check the result
    expect(result).toEqual(mockResponse);

    // Restore the axios mock
    axiosMock.mockRestore();
  });

  it('should throw error and log when apiToken is empty', async () => {
    // Call the function with empty apiToken
    await serviceGetAuth('account', 'apiKey', undefined as any);

    // Check the log
    expect(log.error).toHaveBeenCalledWith('no account, apiToken or apiKey');
  });

  it('should throw error and log when there is an error in sending the POST request', async () => {
    // Mock axios
    const axiosMock = axios as jest.MockedFunction<typeof axios>;
    const mockResponse = { response: { status: 401 } };
    axiosMock.mockRejectedValue(mockResponse);

    // Call the function
    const result = serviceGetAuth('account', 'apiKey', 'apiToken');

    // Check the result
    await expect(result).rejects.toEqual(mockResponse);

    // Check the axios call arguments
    expect(axiosMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: '{"appkey":"apiKey","apptoken":"apiToken"}',
        headers: {
          'Content-Type': 'application/json, application/json',
          Referer: '',
        },
        method: 'post',
        url: undefined,
      }),
    );

    // Restore the axios mock
    axiosMock.mockRestore();
  });

  it('should throw error and log when apiKey is empty', async () => {
    // Call the function with empty apiKey
    await serviceGetAuth('account', undefined as any, 'apiToken');

    // Check the log
    expect(log.error).toHaveBeenCalledWith('no account, apiToken or apiKey');
  });

  it('should throw error and log when account is empty', async () => {
    // Call the function with empty account
    await serviceGetAuth(undefined as any, 'apiKey', 'apiToken');

    // Check the log
    expect(log.error).toHaveBeenCalledWith('no account, apiToken or apiKey');
  });
});
