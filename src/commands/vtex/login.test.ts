import { expect, describe, it, vi, beforeEach } from 'vitest';
import Login from './login';
import { login } from '../../modules/apps/vtex/login';

vi.mock('../../modules/apps/vtex/login', () => ({
  login: vi.fn(),
}));

class MockLogin extends Login {
  _mockParseResult: any = { args: { account: '', email: '', workspace: '', apiKey: '', apiToken: '' } };
  protected async parse(_: any): Promise<any> {
    return this._mockParseResult;
  }
}

describe('Login Command (vtex login)', () => {
  let command: MockLogin;

  beforeEach(() => {
    vi.clearAllMocks();
    command = new MockLogin([], {} as any);
  });

  it('should call login with all args', async () => {
    command._mockParseResult = { args: { account: 'acc', email: 'mail', workspace: 'ws', apiKey: 'key', apiToken: 'token' } };
    await command.run();
    expect(login).toHaveBeenCalledWith('acc', 'mail', 'ws', 'key', 'token');
  });

  it('should handle errors from login', async () => {
    command._mockParseResult = { args: { account: 'acc', email: 'mail', workspace: 'ws', apiKey: 'key', apiToken: 'token' } };
    (login as any).mockRejectedValue(new Error('fail'));
    await expect(command.run()).rejects.toThrow('fail');
  });
});
