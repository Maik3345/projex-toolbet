import { expect, describe, it, vi, beforeEach } from 'vitest';
import Release from './conventional';
import { setupConventional } from '../../../modules/apps/git/setup/conventional';

vi.mock('../../../modules/apps/git/setup/conventional', () => ({
  setupConventional: vi.fn(),
}));

class MockRelease extends Release {
  _mockParseResult: any = { flags: { list: false } };
  protected async parse(_: any): Promise<any> {
    return this._mockParseResult;
  }
}

describe('Release Command (git setup conventional)', () => {
  let command: MockRelease;

  beforeEach(() => {
    vi.clearAllMocks();
    command = new MockRelease([], {} as any);
  });

  it('should call setupConventional with list=false by default', async () => {
    command._mockParseResult = { flags: { list: false } };
    await command.run();
    expect(setupConventional).toHaveBeenCalledWith({ list: false });
  });

  it('should call setupConventional with list=true when flag is set', async () => {
    command._mockParseResult = { flags: { list: true } };
    await command.run();
    expect(setupConventional).toHaveBeenCalledWith({ list: true });
  });

  it('should handle errors from setupConventional', async () => {
    command._mockParseResult = { flags: { list: false } };
    (setupConventional as any).mockRejectedValue(new Error('fail'));
    await expect(command.run()).rejects.toThrow('fail');
  });
});
