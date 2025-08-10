import { expect, describe, it, vi, beforeEach } from 'vitest';
import Release from './release';
import { release } from '../../modules/apps/git/release/createRelease';

vi.mock('../../modules/apps/git/release/createRelease', () => ({
  release: vi.fn(),
}));

class MockRelease extends Release {
  _mockParseResult: any = { flags: {}, args: { tagName: '' } };
  protected async parse(_: any): Promise<any> {
    return this._mockParseResult;
  }
}

describe('Release Command (git release)', () => {
  let command: MockRelease;

  beforeEach(() => {
    vi.clearAllMocks();
    command = new MockRelease([], {} as any);
  });

  it('should call release with default flags and args', async () => {
    command._mockParseResult = { flags: { yes: true }, args: { tagName: 'beta' } };
    await command.run();
    expect(release).toHaveBeenCalledWith(
      expect.objectContaining({ yes: true }),
      'beta'
    );
  });

  it('should call release with all flags', async () => {
    const flags = {
      yes: true,
      'no-push': true,
      'no-deploy': true,
      'no-check-release': true,
      'no-tag': true,
      'get-version': true,
      'no-pre-release': true,
      'no-post-release': true,
      'get-release-type': true,
      'get-only-version-number': true,
    };
    command._mockParseResult = { flags, args: { tagName: 'stable' } };
    await command.run();
    expect(release).toHaveBeenCalledWith(
      expect.objectContaining({
        yes: true,
        noPush: true,
        noDeploy: true,
        noCheckRelease: true,
        noTag: true,
        getVersion: true,
        noPreRelease: true,
        noPostRelease: true,
        getReleaseType: true,
        getOnlyVersionNumber: true,
      }),
      'stable'
    );
  });

  it('should handle errors from release', async () => {
    command._mockParseResult = { flags: { yes: true }, args: { tagName: 'beta' } };
    (release as any).mockRejectedValue(new Error('fail'));
    await expect(command.run()).rejects.toThrow('fail');
  });
});
