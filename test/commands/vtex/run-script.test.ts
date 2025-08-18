import { expect, describe, it, vi, beforeEach } from 'vitest';
import Browse from '../../../src/commands/vtex/run-script';
import { vtexRunScript } from '../../../src/modules/apps/vtex/run-script';

vi.mock('../../../src/modules/apps/vtex/run-script', () => ({
  vtexRunScript: vi.fn(),
}));

class MockBrowse extends Browse {
  _mockParseResult: any = { args: { script: '' } };
  protected async parse(_: any): Promise<any> {
    return this._mockParseResult;
  }
}

describe('Browse Command (vtex run-script)', () => {
  let command: MockBrowse;

  beforeEach(() => {
    vi.clearAllMocks();
    command = new MockBrowse([], {} as any);
  });

  it('should call vtexRunScript with provided script', async () => {
    command._mockParseResult = { args: { script: 'prerelease' } };
    await command.run();
    expect(vtexRunScript).toHaveBeenCalledWith('prerelease');
  });

  it('should handle errors from vtexRunScript', async () => {
    command._mockParseResult = { args: { script: 'fail' } };
    (vtexRunScript as any).mockRejectedValue(new Error('fail'));
    await expect(command.run()).rejects.toThrow('fail');
  });
});
