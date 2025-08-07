import { expect, describe, it, vi, beforeEach } from 'vitest';
import Backup from './backup';
import { backup } from '../../../modules/apps/vtex/cms/backup';

vi.mock('../../../modules/apps/vtex/cms/backup', () => ({
  backup: vi.fn(),
}));

vi.mock('../../../../modules/apps/vtex/cms/backup', () => ({
  backup: vi.fn(),
}));

class MockBackup extends Backup {
  _mockParseResult: any = { args: { site: '' } };
  protected async parse(_: any): Promise<any> {
    return this._mockParseResult;
  }
}

describe('Backup Command (vtex cms backup)', () => {
  let command: MockBackup;

  beforeEach(() => {
    vi.clearAllMocks();
    command = new MockBackup([], {} as any);
  });

  it('should call backup with provided site', async () => {
    command._mockParseResult = { args: { site: 'my-site' } };
    await command.run();
    expect(backup).toHaveBeenCalledWith('my-site');
  });

  it('should call backup with default site', async () => {
    command._mockParseResult = { args: { site: undefined } };
    await command.run();
    expect(backup).toHaveBeenCalledWith(expect.any(String));
  });

  it('should handle errors from backup', async () => {
    command._mockParseResult = { args: { site: 'fail' } };
    (backup as any).mockRejectedValue(new Error('fail'));
    await expect(command.run()).rejects.toThrow('fail');
  });
});
