import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getDefaultBranch,
  ensureBranchAvailable,
  getCurrentBranch,
  getChangedFiles,
  getLineChanges,
  getCommitMessages,
  getDetailedCommits,
  buildAnalysisContext,
} from '../../../../../../src/modules/apps/pull-request/labels';
import { runCommand } from '../../../../../../src/shared';

// Mock the runCommand function (path must match import)
vi.mock('../../../../../../src/shared', async () => {
  const actual = await vi.importActual('../../../../../../src/shared');
  return {
    ...actual,
    runCommand: vi.fn(),
  };
});

const mockedRunCommand = runCommand as any;

describe('getDefaultBranch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return main when main branch exists locally', () => {
    mockedRunCommand.mockImplementationOnce(() => ''); // main branch exists

    const result = getDefaultBranch('/test/path');

    expect(result).toBe('main');
    expect(mockedRunCommand).toHaveBeenCalledWith(
      'git show-ref --verify --quiet refs/heads/main',
      '/test/path',
      '',
      true,
      0,
      true,
    );
  });

  it('should return master when main does not exist but master exists locally', () => {
    mockedRunCommand
      .mockImplementationOnce(() => {
        throw new Error('main not found');
      }) // main branch doesn't exist
      .mockImplementationOnce(() => {
        throw new Error('main not found in remote');
      }) // main branch doesn't exist in remote
      .mockImplementationOnce(() => ''); // master branch exists

    const result = getDefaultBranch('/test/path');

    expect(result).toBe('master');
  });

  it('should return develop when main and master do not exist but develop exists', () => {
    mockedRunCommand
      .mockImplementationOnce(() => {
        throw new Error('main not found');
      })
      .mockImplementationOnce(() => {
        throw new Error('main not found in remote');
      })
      .mockImplementationOnce(() => {
        throw new Error('master not found');
      })
      .mockImplementationOnce(() => {
        throw new Error('master not found in remote');
      })
      .mockImplementationOnce(() => ''); // develop branch exists

    const result = getDefaultBranch('/test/path');

    expect(result).toBe('develop');
  });

  it('should return branch from remote HEAD when common branches do not exist', () => {
    mockedRunCommand.mockImplementation((cmd: string) => {
      if (cmd.includes('show-ref')) {
        throw new Error('branch not found');
      }
      if (cmd.includes('symbolic-ref')) {
        return 'refs/remotes/origin/development';
      }
      throw new Error('unknown command');
    });

    const result = getDefaultBranch('/test/path');

    expect(result).toBe('development');
  });

  it('should fallback to main when no branches are found', () => {
    mockedRunCommand.mockImplementation(() => {
      throw new Error('not found');
    });

    const result = getDefaultBranch('/test/path');

    expect(result).toBe('main');
  });

  it('should return main when remote branch exists even if local does not', () => {
    mockedRunCommand
      .mockImplementationOnce(() => {
        throw new Error('main not found locally');
      }) // main branch doesn't exist locally
      .mockImplementationOnce(() => ''); // main branch exists in remote

    const result = getDefaultBranch('/test/path');

    expect(result).toBe('main');
  });
});

describe('ensureBranchAvailable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should do nothing when branch exists locally', () => {
    mockedRunCommand.mockImplementationOnce(() => ''); // branch exists locally

    expect(() => ensureBranchAvailable('main', '/test/path')).not.toThrow();
    expect(mockedRunCommand).toHaveBeenCalledWith(
      'git show-ref --verify --quiet refs/heads/main',
      '/test/path',
      '',
      true,
      0,
      true,
    );
  });

  it('should do nothing when branch exists in remote tracking', () => {
    mockedRunCommand
      .mockImplementationOnce(() => {
        throw new Error('not local');
      }) // branch doesn't exist locally
      .mockImplementationOnce(() => ''); // branch exists in remote tracking

    expect(() => ensureBranchAvailable('main', '/test/path')).not.toThrow();
  });

  it('should fetch branch when not available locally', () => {
    mockedRunCommand
      .mockImplementationOnce(() => {
        throw new Error('not local');
      }) // branch doesn't exist locally
      .mockImplementationOnce(() => {
        throw new Error('not in remote tracking');
      }) // branch doesn't exist in remote tracking
      .mockImplementationOnce(() => ''); // fetch succeeds

    expect(() => ensureBranchAvailable('main', '/test/path')).not.toThrow();
    expect(mockedRunCommand).toHaveBeenCalledWith('git fetch origin main:main', '/test/path', '', false, 0, false);
  });

  it('should throw error when noFetch is true and branch not available', () => {
    mockedRunCommand
      .mockImplementationOnce(() => {
        throw new Error('not local');
      }) // branch doesn't exist locally
      .mockImplementationOnce(() => {
        throw new Error('not in remote tracking');
      }); // branch doesn't exist in remote tracking

    expect(() => ensureBranchAvailable('main', '/test/path', true)).toThrow(
      "Branch 'main' not found locally and --no-fetch flag is set",
    );
  });

  it('should fallback to fetch origin when direct fetch fails', () => {
    mockedRunCommand
      .mockImplementationOnce(() => {
        throw new Error('not local');
      }) // branch doesn't exist locally
      .mockImplementationOnce(() => {
        throw new Error('not in remote tracking');
      }) // branch doesn't exist in remote tracking
      .mockImplementationOnce(() => {
        throw new Error('direct fetch failed');
      }) // direct fetch fails
      .mockImplementationOnce(() => '') // general fetch succeeds
      .mockImplementationOnce(() => ''); // branch now available in remote

    expect(() => ensureBranchAvailable('main', '/test/path')).not.toThrow();
    expect(mockedRunCommand).toHaveBeenCalledWith('git fetch origin', '/test/path', '', false, 0, false);
  });

  it('should handle verbose output correctly', () => {
    mockedRunCommand.mockImplementationOnce(() => ''); // branch exists locally

    expect(() => ensureBranchAvailable('main', '/test/path', false, true)).not.toThrow();
  });

  it('should throw error when remote branch not found after general fetch', () => {
    mockedRunCommand
      .mockImplementationOnce(() => {
        throw new Error('not local');
      })
      .mockImplementationOnce(() => {
        throw new Error('not in remote tracking');
      })
      .mockImplementationOnce(() => {
        throw new Error('direct fetch failed');
      })
      .mockImplementationOnce(() => '') // general fetch succeeds
      .mockImplementationOnce(() => {
        throw new Error('still not found');
      }); // branch still not available

    expect(() => ensureBranchAvailable('main', '/test/path')).toThrow("Branch 'main' not found in remote repository");
  });

  it('should handle general fetch failure', () => {
    mockedRunCommand
      .mockImplementationOnce(() => {
        throw new Error('not local');
      })
      .mockImplementationOnce(() => {
        throw new Error('not in remote tracking');
      })
      .mockImplementationOnce(() => {
        throw new Error('direct fetch failed');
      })
      .mockImplementationOnce(() => {
        throw new Error('general fetch failed');
      });

    expect(() => ensureBranchAvailable('main', '/test/path')).toThrow(
      'Failed to fetch from remote: general fetch failed',
    );
  });
});

describe('getCurrentBranch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return current branch name', () => {
    mockedRunCommand.mockReturnValue('feature/test-branch\n');

    const result = getCurrentBranch('/test/path');

    expect(result).toBe('feature/test-branch');
    expect(mockedRunCommand).toHaveBeenCalledWith('git rev-parse --abbrev-ref HEAD', '/test/path', '', true, 0, true);
  });

  it('should throw error when git command fails', () => {
    mockedRunCommand.mockImplementation(() => {
      throw new Error('git error');
    });

    expect(() => getCurrentBranch('/test/path')).toThrow();
  });
});

describe('getChangedFiles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return changed files from successful diff', () => {
    mockedRunCommand.mockReturnValue('file1.ts\nfile2.ts\nfile3.ts\n');

    const result = getChangedFiles('feature', 'main', '/test/path');

    expect(result).toEqual(['file1.ts', 'file2.ts', 'file3.ts']);
  });

  it('should try alternative commands when first fails', () => {
    mockedRunCommand
      .mockImplementationOnce(() => {
        throw new Error('first failed');
      })
      .mockImplementationOnce(() => 'file1.ts\nfile2.ts\n');

    const result = getChangedFiles('feature', 'main', '/test/path', true);

    expect(result).toEqual(['file1.ts', 'file2.ts']);
    expect(mockedRunCommand).toHaveBeenCalledTimes(2);
  });

  it('should handle empty diff output', () => {
    mockedRunCommand.mockReturnValue('');

    const result = getChangedFiles('feature', 'main', '/test/path');

    expect(result).toEqual([]);
  });

  it('should throw error when all attempts fail', () => {
    mockedRunCommand.mockImplementation(() => {
      throw new Error('all failed');
    });

    expect(() => getChangedFiles('feature', 'main', '/test/path')).toThrow();
  });
});

describe('getLineChanges', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should parse line changes correctly', () => {
    mockedRunCommand.mockReturnValue('3 files changed, 25 insertions(+), 10 deletions(-)');

    const result = getLineChanges('feature', 'main', '/test/path');

    expect(result).toEqual({ added: 25, deleted: 10 });
  });

  it('should handle only insertions', () => {
    mockedRunCommand.mockReturnValue('2 files changed, 15 insertions(+)');

    const result = getLineChanges('feature', 'main', '/test/path');

    expect(result).toEqual({ added: 15, deleted: 0 });
  });

  it('should handle only deletions', () => {
    mockedRunCommand.mockReturnValue('1 file changed, 5 deletions(-)');

    const result = getLineChanges('feature', 'main', '/test/path');

    expect(result).toEqual({ added: 0, deleted: 5 });
  });

  it('should handle no changes', () => {
    mockedRunCommand.mockReturnValue('no changes');

    const result = getLineChanges('feature', 'main', '/test/path');

    expect(result).toEqual({ added: 0, deleted: 0 });
  });

  it('should fallback when all commands fail', () => {
    mockedRunCommand.mockImplementation(() => {
      throw new Error('all failed');
    });

    const result = getLineChanges('feature', 'main', '/test/path');

    expect(result).toEqual({ added: 0, deleted: 0 });
  });
});

describe('getCommitMessages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return commit messages', () => {
    mockedRunCommand.mockReturnValue('feat: add new feature\nfix: resolve bug\nchore: update deps\n');

    const result = getCommitMessages('feature', 'main', '/test/path');

    expect(result).toEqual(['feat: add new feature', 'fix: resolve bug', 'chore: update deps']);
  });

  it('should handle empty output', () => {
    mockedRunCommand.mockReturnValue('');

    const result = getCommitMessages('feature', 'main', '/test/path');

    expect(result).toEqual([]);
  });

  it('should fallback when commands fail', () => {
    mockedRunCommand.mockImplementation(() => {
      throw new Error('all failed');
    });

    const result = getCommitMessages('feature', 'main', '/test/path');

    expect(result).toEqual([]);
  });
});

describe('getDetailedCommits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return detailed commit information', () => {
    mockedRunCommand.mockReturnValue(
      'abc123|feat: add feature|feat: add new feature\n\nDetailed description\n\ndef456|fix: bug fix|fix: resolve critical bug\n\nFix description',
    );

    const result = getDetailedCommits('feature', 'main', '/test/path');

    expect(result).toEqual([
      {
        id: 'abc123',
        message: 'feat: add feature',
        fullMessage: 'feat: add feature', // Corregido según la lógica real
      },
      {
        id: 'def456',
        message: 'fix: bug fix',
        fullMessage: 'fix: bug fix', // Corregido según la lógica real
      },
    ]);
  });

  it('should handle commits without detailed messages', () => {
    mockedRunCommand.mockReturnValue('abc123|feat: simple commit|feat: simple commit\n\n');

    const result = getDetailedCommits('feature', 'main', '/test/path');

    expect(result).toEqual([
      {
        id: 'abc123',
        message: 'feat: simple commit',
        fullMessage: 'feat: simple commit',
      },
    ]);
  });

  it('should handle empty output', () => {
    mockedRunCommand.mockReturnValue('');

    const result = getDetailedCommits('feature', 'main', '/test/path');

    expect(result).toEqual([]);
  });

  it('should fallback when commands fail', () => {
    mockedRunCommand.mockImplementation(() => {
      throw new Error('all failed');
    });

    const result = getDetailedCommits('feature', 'main', '/test/path');

    expect(result).toEqual([]);
  });
});

describe('buildAnalysisContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should build complete analysis context', () => {
    mockedRunCommand
      .mockReturnValueOnce('file1.ts\nfile2.ts\n') // getChangedFiles
      .mockReturnValueOnce('2 files changed, 25 insertions(+), 10 deletions(-)') // getLineChanges
      .mockReturnValueOnce('feat: add feature\nfix: bug fix\n') // getCommitMessages
      .mockReturnValueOnce(
        'abc123|feat: add feature|feat: add new feature\n\ndef456|fix: bug fix|fix: resolve bug\n\n',
      ); // getDetailedCommits

    const result = buildAnalysisContext('feature', 'main', '/test/path', true);

    expect(result).toEqual({
      changedFiles: ['file1.ts', 'file2.ts'],
      addedLines: 25,
      deletedLines: 10,
      commitMessages: ['feat: add feature', 'fix: bug fix'],
      commits: [
        { id: 'abc123', message: 'feat: add feature', fullMessage: 'feat: add feature' },
        { id: 'def456', message: 'fix: bug fix', fullMessage: 'fix: bug fix' },
      ],
      branch: 'feature',
      target: 'main',
    });
  });
});
