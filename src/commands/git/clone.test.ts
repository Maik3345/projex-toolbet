import { expect, describe, it, vi, beforeEach } from 'vitest';
import Release from './clone';
import { clone } from '../../modules/apps/git/clone';

vi.mock('../../modules/apps/git/clone', () => ({
  clone: vi.fn(),
}));

class MockRelease extends Release {
  _mockParseResult: any = { args: { repositoryUrl: '', repositoryList: '' } };
  protected async parse(_: any): Promise<any> {
    return this._mockParseResult;
  }
}

describe('Release Command (git clone)', () => {
  let command: MockRelease;

  beforeEach(() => {
    vi.clearAllMocks();
    command = new MockRelease([], {} as any);
  });

  it('should call clone with provided args', async () => {
    command._mockParseResult = { args: { repositoryUrl: 'https://repo/', repositoryList: 'a,b' } };
    await command.run();
    expect(clone).toHaveBeenCalledWith('https://repo/', 'a,b');
  });

  it('should handle errors from clone', async () => {
    command._mockParseResult = { args: { repositoryUrl: 'https://repo/', repositoryList: 'a,b' } };
    (clone as any).mockRejectedValue(new Error('fail'));
    await expect(command.run()).rejects.toThrow('fail');
  });
});
