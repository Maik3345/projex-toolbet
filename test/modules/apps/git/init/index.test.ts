import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setupGitRepository } from '../../../../../src/modules/apps/git/init/index';
import { DirectoryUtils } from '../../../../../src/shared';
import { SetupGitRepositoryUtils } from '../../../../../src/modules/apps/git/init/utils';

// Mock dependencies
vi.mock('../../../../../src/shared', () => ({
  DirectoryUtils: vi.fn(),
}));

vi.mock('../../../../../src/modules/apps/git/init/utils', () => ({
  SetupGitRepositoryUtils: vi.fn(),
}));

describe('setupGitRepository', () => {
  const mockDirectoryUtils = {
    getFolders: vi.fn(),
    runCommandInFolders: vi.fn(),
  };

  const mockSetupUtils = {
    setupGitRepository: vi.fn(),
  };

  const MockedDirectoryUtils = vi.mocked(DirectoryUtils);
  const MockedSetupGitRepositoryUtils = vi.mocked(SetupGitRepositoryUtils);

  beforeEach(() => {
    vi.clearAllMocks();
    MockedDirectoryUtils.mockImplementation(() => mockDirectoryUtils as any);
    MockedSetupGitRepositoryUtils.mockImplementation(() => mockSetupUtils as any);
  });

  it('should setup git repository with list option from l flag', async () => {
    const folders = ['/path1', '/path2'];
    mockDirectoryUtils.getFolders.mockResolvedValue(folders);
    mockDirectoryUtils.runCommandInFolders.mockResolvedValue(undefined);

    await setupGitRepository({ l: true });

    expect(MockedDirectoryUtils).toHaveBeenCalledWith(true);
    expect(mockDirectoryUtils.getFolders).toHaveBeenCalled();
    expect(mockDirectoryUtils.runCommandInFolders).toHaveBeenCalledWith(
      folders,
      expect.any(Function)
    );
  });

  it('should setup git repository with list option from list flag', async () => {
    const folders = ['/path1'];
    mockDirectoryUtils.getFolders.mockResolvedValue(folders);
    mockDirectoryUtils.runCommandInFolders.mockResolvedValue(undefined);

    await setupGitRepository({ list: true });

    expect(MockedDirectoryUtils).toHaveBeenCalledWith(true);
    expect(mockDirectoryUtils.getFolders).toHaveBeenCalled();
    expect(mockDirectoryUtils.runCommandInFolders).toHaveBeenCalledWith(
      folders,
      expect.any(Function)
    );
  });

  it('should setup git repository without list option when flags are false', async () => {
    const folders = ['/path1'];
    mockDirectoryUtils.getFolders.mockResolvedValue(folders);
    mockDirectoryUtils.runCommandInFolders.mockResolvedValue(undefined);

    await setupGitRepository({ l: false, list: false });

    expect(MockedDirectoryUtils).toHaveBeenCalledWith(false);
    expect(mockDirectoryUtils.getFolders).toHaveBeenCalled();
    expect(mockDirectoryUtils.runCommandInFolders).toHaveBeenCalledWith(
      folders,
      expect.any(Function)
    );
  });

  it('should setup git repository with default options when no flags provided', async () => {
    const folders = ['/path1'];
    mockDirectoryUtils.getFolders.mockResolvedValue(folders);
    mockDirectoryUtils.runCommandInFolders.mockResolvedValue(undefined);

    await setupGitRepository({});

    expect(MockedDirectoryUtils).toHaveBeenCalledWith(undefined);
    expect(mockDirectoryUtils.getFolders).toHaveBeenCalled();
    expect(mockDirectoryUtils.runCommandInFolders).toHaveBeenCalledWith(
      folders,
      expect.any(Function)
    );
  });

  it('should prioritize l flag over list flag when both are provided', async () => {
    const folders = ['/path1'];
    mockDirectoryUtils.getFolders.mockResolvedValue(folders);
    mockDirectoryUtils.runCommandInFolders.mockResolvedValue(undefined);

    await setupGitRepository({ l: false, list: true });

    // Should use l flag value (false) instead of list flag (true)
    expect(MockedDirectoryUtils).toHaveBeenCalledWith(false);
  });

  it('should handle empty folders array', async () => {
    const folders: string[] = [];
    mockDirectoryUtils.getFolders.mockResolvedValue(folders);
    mockDirectoryUtils.runCommandInFolders.mockResolvedValue(undefined);

    await setupGitRepository({ list: true });

    expect(mockDirectoryUtils.runCommandInFolders).toHaveBeenCalledWith(
      folders,
      expect.any(Function)
    );
  });

  it('should pass correct bound function to runCommandInFolders', async () => {
    const folders = ['/test/path'];
    mockDirectoryUtils.getFolders.mockResolvedValue(folders);
    mockDirectoryUtils.runCommandInFolders.mockResolvedValue(undefined);

    await setupGitRepository({ list: true });

    expect(mockDirectoryUtils.runCommandInFolders).toHaveBeenCalledWith(
      folders,
      expect.any(Function)
    );
  });
});
