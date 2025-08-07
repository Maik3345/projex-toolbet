import { expect, describe, it, vi, beforeEach } from 'vitest';
import Browse from './run';
import { vtexRunCommand } from '../../modules/apps/vtex/run';

vi.mock('../../modules/apps/vtex/run', () => ({
  vtexRunCommand: vi.fn(),
}));

class MockBrowse extends Browse {
  _mockParseResult: any = { args: { command: '' } };
  protected async parse(_: any): Promise<any> {
    return this._mockParseResult;
  }
}

describe('Browse Command (vtex run)', () => {
  let command: MockBrowse;

  beforeEach(() => {
    vi.clearAllMocks();
    command = new MockBrowse([], {} as any);
  });

  it('should call vtexRunCommand with provided command', async () => {
    command._mockParseResult = { args: { command: 'vtex publish' } };
    await command.run();
    expect(vtexRunCommand).toHaveBeenCalledWith('vtex publish');
  });

  it('should handle errors from vtexRunCommand', async () => {
    command._mockParseResult = { args: { command: 'fail' } };
    (vtexRunCommand as any).mockRejectedValue(new Error('fail'));
    await expect(command.run()).rejects.toThrow('fail');
  });
});
