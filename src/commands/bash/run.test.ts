import { expect, describe, it, vi, beforeEach } from 'vitest';
import Browse from './run';
import { bashRunCommand } from '../../modules/apps/bash/run';

vi.mock('../../modules/apps/bash/run', () => ({
  bashRunCommand: vi.fn(),
}));

class MockBrowse extends Browse {
  _mockParseResult: any = { flags: { list: false }, args: { command: '' } };
  protected async parse(_: any): Promise<any> {
    return this._mockParseResult;
  }
}

describe('Browse Command (bash run)', () => {
  let command: MockBrowse;

  beforeEach(() => {
    vi.clearAllMocks();
    command = new MockBrowse([], {} as any);
  });

  it('should call bashRunCommand with provided command and list=false', async () => {
    command._mockParseResult = { flags: { list: false }, args: { command: 'echo test' } };
    await command.run();
    expect(bashRunCommand).toHaveBeenCalledWith('echo test', { list: false });
  });

  it('should call bashRunCommand with list=true', async () => {
    command._mockParseResult = { flags: { list: true }, args: { command: 'npm install' } };
    await command.run();
    expect(bashRunCommand).toHaveBeenCalledWith('npm install', { list: true });
  });

  it('should handle errors from bashRunCommand', async () => {
    command._mockParseResult = { flags: { list: false }, args: { command: 'fail' } };
    (bashRunCommand as any).mockRejectedValue(new Error('fail'));
    await expect(command.run()).rejects.toThrow('fail');
  });
});
