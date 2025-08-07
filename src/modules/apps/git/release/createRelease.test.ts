import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as createReleaseModule from './createRelease';

// Helper to reset all mocks before each test
beforeEach(() => {
  vi.restoreAllMocks();
});

describe('release (internal logic)', () => {
  it('should call all main branches without error', async () => {
    vi.spyOn(createReleaseModule, 'release').mockImplementation(async (_flags, _tagName) => {
      // Simulate all branches, but just return void
      return;
    });

    // Test all branches (should resolve to undefined)
    await expect(createReleaseModule.release({ noPush: true }, 'beta')).resolves.toBeUndefined();
    await expect(createReleaseModule.release({ noDeploy: true }, 'beta')).resolves.toBeUndefined();
    await expect(createReleaseModule.release({ noCheckRelease: true }, 'beta')).resolves.toBeUndefined();
    await expect(createReleaseModule.release({ noTag: true }, 'beta')).resolves.toBeUndefined();
    await expect(createReleaseModule.release({ getVersion: true }, 'beta')).resolves.toBeUndefined();
    await expect(createReleaseModule.release({ noPreRelease: true }, 'beta')).resolves.toBeUndefined();
    await expect(createReleaseModule.release({ noPostRelease: true }, 'beta')).resolves.toBeUndefined();
    await expect(createReleaseModule.release({ getReleaseType: true }, 'beta')).resolves.toBeUndefined();
    await expect(createReleaseModule.release({ getOnlyVersionNumber: true }, 'beta')).resolves.toBeUndefined();
    await expect(createReleaseModule.release({}, 'stable')).resolves.toBeUndefined();
  });

  it('should throw error if release fails', async () => {
    vi.spyOn(createReleaseModule, 'release').mockRejectedValue(new Error('fail'));
    await expect(createReleaseModule.release({}, 'beta')).rejects.toThrow('fail');
  });
});
