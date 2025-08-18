import { login } from '../../../../../src/modules/apps/vtex/login/index';
import { serviceGetAuth, saveVtexConfig } from '../../../../../src/modules/apps/vtex/login/util';
import { log } from '../../../../../src/shared';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../../../../src/shared');
vi.mock('../../../../../src/modules/apps/vtex/login/util');

describe('login', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should save the credentials to the config file', async () => {
		const account = 'my-account';
		const email = 'my-email';
		const workspace = 'my-workspace';
		const apiKey = 'my-api-key';
		const apiToken = 'my-api-token';
		const authToken = 'my-auth-token';
		const serviceGetAuthMock = serviceGetAuth as any;
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

		const result = await login(account, email, workspace, apiKey, apiToken, false);
		expect(result).toBe(true);
		expect(serviceGetAuthMock).toHaveBeenCalledWith(account, apiKey, apiToken);
		expect(saveVtexConfig).toHaveBeenCalledWith({
			account,
			token: authToken,
			workspace,
			login: email,
			env: 'prod',
		});
		expect(log.info).toHaveBeenCalledWith(expect.stringContaining('authentication token'));
	});

	it('should throw an error if no token information is found', async () => {
		const account = 'my-account';
		const email = 'my-email';
		const workspace = 'my-workspace';
		const apiKey = 'my-api-key';
		const apiToken = 'my-api-token';
		const serviceGetAuthMock = serviceGetAuth as any;
		serviceGetAuthMock.mockResolvedValueOnce(undefined as any);

		await expect(login(account, email, workspace, apiKey, apiToken, false))
			.rejects.toThrow('Failed to obtain authentication token');
		expect(log.error).toHaveBeenCalledWith(expect.stringContaining('authentication token'));
	});

	it('should throw an error if any of the required parameters are missing', async () => {
		await expect(login(undefined, 'email', 'workspace', 'apiKey', 'apiToken', false))
			.rejects.toThrow('Missing required parameters');
		expect(log.error).toHaveBeenCalledWith(expect.stringContaining('required parameters'));
	});
});
// test moved from src/modules/apps/vtex/login/login.test.ts
