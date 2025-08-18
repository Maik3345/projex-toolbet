import { expect, describe, it, vi, beforeEach } from 'vitest';
import CloneCommand from '../../../src/commands/git/clone';
import { clone } from '../../../src/modules/apps/git/clone';

vi.mock('../../../src/modules/apps/git/clone', () => ({
  clone: vi.fn(),
}));


class MockCloneCommand extends CloneCommand {
  _mockParseResult: any = { args: { repositoryUrl: '', repositoryList: '' }, flags: { list: false } };
  protected async parse(_: any): Promise<any> {
    return this._mockParseResult;
  }
}

describe('Release Command (git clone)', () => {
  let command: MockCloneCommand;

  beforeEach(() => {
    vi.clearAllMocks();
    command = new MockCloneCommand([], {} as any);
  });

  it('should call clone with provided args', async () => {
    command._mockParseResult = { args: { repositoryUrl: 'https://repo/', repositoryList: 'a,b' }, flags: { list: false } };
    await command.run();
    expect(clone).toHaveBeenCalledWith('https://repo/', 'a,b');
  });

  it('should handle errors from clone', async () => {
    command._mockParseResult = { args: { repositoryUrl: 'https://repo/', repositoryList: 'a,b' }, flags: { list: false } };
    (clone as any).mockRejectedValue(new Error('fail'));
    await expect(command.run()).rejects.toThrow('fail');
  });
});
