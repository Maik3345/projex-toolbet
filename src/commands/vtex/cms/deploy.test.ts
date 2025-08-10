import { expect, describe, it, vi, beforeEach } from 'vitest';
import Deploy from './deploy';
import { deploy } from '../../../modules/apps/vtex/cms/deploy';

vi.mock('../../../modules/apps/vtex/cms/deploy', () => ({
  deploy: vi.fn(),
}));

class MockDeploy extends Deploy {
  _mockParseResult: any = { args: { extension: '', site: '' }, flags: { yes: false } };
  protected async parse(_: any): Promise<any> {
    return this._mockParseResult;
  }
}

describe('Deploy Command (vtex cms deploy)', () => {
  let command: MockDeploy;

  beforeEach(() => {
    vi.clearAllMocks();
    command = new MockDeploy([], {} as any);
  });

  it('should call deploy with provided extension, site, and yes flag', async () => {
    command._mockParseResult = { args: { extension: 'ext', site: 'my-site' }, flags: { yes: true } };
    await command.run();
    expect(deploy).toHaveBeenCalledWith('ext', 'my-site', { yes: true });
  });

  it('should call deploy with default site and no extension', async () => {
    command._mockParseResult = { args: { extension: undefined, site: undefined }, flags: { yes: false } };
    await command.run();
    expect(deploy).toHaveBeenCalledWith(undefined, expect.any(String), { yes: false });
  });

  it('should handle errors from deploy', async () => {
    command._mockParseResult = { args: { extension: 'fail', site: 'fail' }, flags: { yes: true } };
    (deploy as any).mockRejectedValue(new Error('fail'));
    await expect(command.run()).rejects.toThrow('fail');
  });
});
