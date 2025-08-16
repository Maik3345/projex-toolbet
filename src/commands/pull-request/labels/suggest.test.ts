import { expect, describe, it, vi, beforeEach } from 'vitest';
import Suggest from './suggest';
import { suggestLabels } from '../../../../src/modules/apps/pull-request/labels/suggest';

vi.mock('../../../../src/modules/apps/pull-request/labels/suggest', () => ({
  suggestLabels: vi.fn(),
}));

class MockSuggest extends Suggest {
  _mockParseResult: any = { flags: { branch: '', target: '', format: 'json', verbose: false, 'no-fetch': false } };
  protected async parse(_: any): Promise<any> {
    return this._mockParseResult;
  }
}

describe('Suggest Command (pull-request labels suggest)', () => {
  let command: MockSuggest;

  beforeEach(() => {
    vi.clearAllMocks();
    command = new MockSuggest([], {} as any);
  });

  it('should call suggestLabels with all flags', async () => {
    command._mockParseResult = { flags: { branch: 'feature', target: 'main', format: 'csv', verbose: true, 'no-fetch': true } };
    await command.run();
    expect(suggestLabels).toHaveBeenCalledWith({
      branch: 'feature',
      target: 'main',
      format: 'csv',
      verbose: true,
      noFetch: true,
    });
  });

  it('should call suggestLabels with default flags', async () => {
    command._mockParseResult = { flags: { branch: undefined, target: undefined, format: 'json', verbose: false, 'no-fetch': false } };
    await command.run();
    expect(suggestLabels).toHaveBeenCalledWith({
      branch: undefined,
      target: undefined,
      format: 'json',
      verbose: false,
      noFetch: false,
    });
  });

  it('should handle errors from suggestLabels', async () => {
    command._mockParseResult = { flags: { branch: 'fail', target: 'fail', format: 'json', verbose: false, 'no-fetch': false } };
    (suggestLabels as any).mockRejectedValue(new Error('fail'));
    await expect(command.run()).rejects.toThrow('fail');
  });
});
