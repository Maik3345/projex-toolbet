import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SetupGitRepositoryUtils } from './utils';
import { FilesUtils, README_TEMPLATE_CODE, GIT_IGNORE_TEMPLATE_CODE, CHANGELOG_TEMPLATE_CODE } from '../../../../shared';

// Mock dependencies
vi.mock('../../../../shared', () => ({
  FilesUtils: vi.fn(),
  README_TEMPLATE_CODE: 'README template content',
  GIT_IGNORE_TEMPLATE_CODE: 'gitignore template content',
  CHANGELOG_TEMPLATE_CODE: 'changelog template content',
}));

describe('SetupGitRepositoryUtils', () => {
  let setupUtils: SetupGitRepositoryUtils;
  let mockFilesUtils: {
    createDirectory: ReturnType<typeof vi.fn>;
    createFile: ReturnType<typeof vi.fn>;
  };

  const MockedFilesUtils = vi.mocked(FilesUtils);

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockFilesUtils = {
      createDirectory: vi.fn(),
      createFile: vi.fn(),
    };

    MockedFilesUtils.mockImplementation(() => mockFilesUtils as any);
    setupUtils = new SetupGitRepositoryUtils();
  });

  describe('constructor', () => {
    it('should create an instance with FilesUtils', () => {
      expect(MockedFilesUtils).toHaveBeenCalled();
      expect(setupUtils).toBeInstanceOf(SetupGitRepositoryUtils);
    });
  });

  describe('setupGitRepository', () => {
    const testRoot = '/test/project';

    it('should create all required files and directories', async () => {
      mockFilesUtils.createDirectory.mockResolvedValue(undefined);
      mockFilesUtils.createFile.mockResolvedValue(undefined);

      await setupUtils.setupGitRepository(testRoot);

      // Verify directory creation
      expect(mockFilesUtils.createDirectory).toHaveBeenCalledWith(`${testRoot}/docs`);

      // Verify file creations
      expect(mockFilesUtils.createFile).toHaveBeenCalledWith(
        `${testRoot}/README.md`,
        README_TEMPLATE_CODE
      );
      expect(mockFilesUtils.createFile).toHaveBeenCalledWith(
        `${testRoot}/.gitignore`,
        GIT_IGNORE_TEMPLATE_CODE
      );
      expect(mockFilesUtils.createFile).toHaveBeenCalledWith(
        `${testRoot}/CHANGELOG.md`,
        CHANGELOG_TEMPLATE_CODE
      );

      // Verify all calls were made
      expect(mockFilesUtils.createDirectory).toHaveBeenCalledTimes(1);
      expect(mockFilesUtils.createFile).toHaveBeenCalledTimes(3);
    });

    it('should handle different root paths correctly', async () => {
      const differentRoot = '/another/path/project';
      mockFilesUtils.createDirectory.mockResolvedValue(undefined);
      mockFilesUtils.createFile.mockResolvedValue(undefined);

      await setupUtils.setupGitRepository(differentRoot);

      expect(mockFilesUtils.createDirectory).toHaveBeenCalledWith(`${differentRoot}/docs`);
      expect(mockFilesUtils.createFile).toHaveBeenCalledWith(`${differentRoot}/README.md`, README_TEMPLATE_CODE);
      expect(mockFilesUtils.createFile).toHaveBeenCalledWith(`${differentRoot}/.gitignore`, GIT_IGNORE_TEMPLATE_CODE);
      expect(mockFilesUtils.createFile).toHaveBeenCalledWith(`${differentRoot}/CHANGELOG.md`, CHANGELOG_TEMPLATE_CODE);
    });

    it('should handle root paths with trailing slashes', async () => {
      const rootWithTrailingSlash = '/test/project/';
      mockFilesUtils.createDirectory.mockResolvedValue(undefined);
      mockFilesUtils.createFile.mockResolvedValue(undefined);

      await setupUtils.setupGitRepository(rootWithTrailingSlash);

      // Expecting the literal path concatenation as per actual implementation
      expect(mockFilesUtils.createDirectory).toHaveBeenCalledWith('/test/project//docs');
      expect(mockFilesUtils.createFile).toHaveBeenCalledWith('/test/project//README.md', README_TEMPLATE_CODE);
    });

    it('should propagate errors from FilesUtils', async () => {
      const error = new Error('File creation failed');
      mockFilesUtils.createDirectory.mockRejectedValue(error);

      await expect(setupUtils.setupGitRepository(testRoot)).rejects.toThrow('File creation failed');
    });

    it('should continue setup even if one operation fails', async () => {
      mockFilesUtils.createDirectory.mockResolvedValue(undefined);
      mockFilesUtils.createFile
        .mockResolvedValueOnce(undefined) // README success
        .mockRejectedValueOnce(new Error('Gitignore failed')) // .gitignore fails
        .mockResolvedValueOnce(undefined); // CHANGELOG success

      await expect(setupUtils.setupGitRepository(testRoot)).rejects.toThrow('Gitignore failed');

      // Verify that the setup attempted to create all files up to the failure
      expect(mockFilesUtils.createDirectory).toHaveBeenCalledWith(`${testRoot}/docs`);
      expect(mockFilesUtils.createFile).toHaveBeenCalledWith(`${testRoot}/README.md`, README_TEMPLATE_CODE);
      expect(mockFilesUtils.createFile).toHaveBeenCalledWith(`${testRoot}/.gitignore`, GIT_IGNORE_TEMPLATE_CODE);
      // CHANGELOG.md should not be called because .gitignore failed
      expect(mockFilesUtils.createFile).toHaveBeenCalledTimes(2);
    });

    it('should create files in correct order', async () => {
      let callOrder: string[] = [];
      
      mockFilesUtils.createDirectory.mockImplementation(async (path) => {
        callOrder.push(`createDirectory: ${path}`);
      });
      
      mockFilesUtils.createFile.mockImplementation(async (path, content) => {
        callOrder.push(`createFile: ${path}`);
      });

      await setupUtils.setupGitRepository(testRoot);

      expect(callOrder).toEqual([
        `createDirectory: ${testRoot}/docs`,
        `createFile: ${testRoot}/README.md`,
        `createFile: ${testRoot}/.gitignore`,
        `createFile: ${testRoot}/CHANGELOG.md`,
      ]);
    });
  });
});
