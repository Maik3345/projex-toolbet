import axios, { AxiosResponse } from 'axios';
import { serviceGetAuth } from '../../../../../../../src/modules/apps/vtex/login/util/getAuth';
import { log } from '../../../../../../../src/shared';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../../../../../../src/shared');
vi.mock('axios');

describe('serviceGetAuth', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should send POST request and return status ok', async () => {
		// Mock axios
		const axiosMock = axios as any;
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
	});

	it('should return undefined and log error when apiToken is empty', async () => {
		// Call the function with empty apiToken
		const result = await serviceGetAuth('account', 'apiKey', undefined as any);

		// Check the log and result
		expect(log.error).toHaveBeenCalledWith(expect.stringContaining('account'));
		expect(result).toBeUndefined();
	});

	// Omitimos temporalmente esta prueba que está fallando
	it('should log error when there is an error in sending the POST request', async () => {
		// Mock axios to reject with a string
		const axiosMock = axios as any;
		axiosMock.mockRejectedValueOnce('Network error');

		// Call the function
		const result = await serviceGetAuth('account', 'apiKey', 'apiToken');

		// Check the logs and result
		expect(log.debug).toHaveBeenCalledWith('Network error');
		expect(log.error).toHaveBeenCalledWith(expect.stringContaining('auth token'));
		expect(result).toBeUndefined();
	});

	it('should return undefined and log error when apiKey is empty', async () => {
		// Call the function with empty apiKey
		const result = await serviceGetAuth('account', undefined as any, 'apiToken');

		// Check the log and result
		expect(log.error).toHaveBeenCalledWith(expect.stringContaining('account'));
		expect(result).toBeUndefined();
	});

	it('should return undefined and log error when account is empty', async () => {
		// Call the function with empty account
		const result = await serviceGetAuth(undefined as any, 'apiKey', 'apiToken');

		// Check the log and result
		expect(log.error).toHaveBeenCalledWith(expect.stringContaining('account'));
		expect(result).toBeUndefined();
	});
});
// test moved from src/modules/apps/vtex/login/util/getAuth/getAuth.test.ts
