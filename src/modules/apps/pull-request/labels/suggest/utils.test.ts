import { getDefaultBranch, ensureBranchAvailable } from './utils';
import { runCommand } from '../../../../../shared';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the runCommand function
vi.mock('../../../../../shared', async () => {
  const actual = await vi.importActual('../../../../../shared');
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
      true
    );
  });

  it('should return master when main does not exist but master exists locally', () => {
    mockedRunCommand
      .mockImplementationOnce(() => { throw new Error('main not found'); }) // main branch doesn't exist
      .mockImplementationOnce(() => { throw new Error('main not found in remote'); }) // main branch doesn't exist in remote
      .mockImplementationOnce(() => ''); // master branch exists
    
    const result = getDefaultBranch('/test/path');
    
    expect(result).toBe('master');
  });

  it('should return develop when main and master do not exist but develop exists', () => {
    mockedRunCommand
      .mockImplementationOnce(() => { throw new Error('main not found'); })
      .mockImplementationOnce(() => { throw new Error('main not found in remote'); })
      .mockImplementationOnce(() => { throw new Error('master not found'); })
      .mockImplementationOnce(() => { throw new Error('master not found in remote'); })
      .mockImplementationOnce(() => ''); // develop branch exists
    
    const result = getDefaultBranch('/test/path');
    
    expect(result).toBe('develop');
  });

  it('should return branch from remote HEAD when common branches do not exist', () => {
    mockedRunCommand
      .mockImplementation((cmd: string) => {
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
    mockedRunCommand.mockImplementation(() => { throw new Error('not found'); });
    
    const result = getDefaultBranch('/test/path');
    
    expect(result).toBe('main');
  });

  it('should return main when remote branch exists even if local does not', () => {
    mockedRunCommand
      .mockImplementationOnce(() => { throw new Error('main not found locally'); }) // main branch doesn't exist locally
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
      true
    );
  });

  it('should do nothing when branch exists in remote tracking', () => {
    mockedRunCommand
      .mockImplementationOnce(() => { throw new Error('not local'); }) // branch doesn't exist locally
      .mockImplementationOnce(() => ''); // branch exists in remote tracking
    
    expect(() => ensureBranchAvailable('main', '/test/path')).not.toThrow();
  });

  it('should fetch branch when not available locally', () => {
    mockedRunCommand
      .mockImplementationOnce(() => { throw new Error('not local'); }) // branch doesn't exist locally
      .mockImplementationOnce(() => { throw new Error('not in remote tracking'); }) // branch doesn't exist in remote tracking
      .mockImplementationOnce(() => ''); // fetch succeeds
    
    expect(() => ensureBranchAvailable('main', '/test/path')).not.toThrow();
    expect(mockedRunCommand).toHaveBeenCalledWith(
      'git fetch origin main:main',
      '/test/path',
      '',
      false,
      0,
      false
    );
  });

  it('should throw error when noFetch is true and branch not available', () => {
    mockedRunCommand
      .mockImplementationOnce(() => { throw new Error('not local'); }) // branch doesn't exist locally
      .mockImplementationOnce(() => { throw new Error('not in remote tracking'); }) // branch doesn't exist in remote tracking
    
    expect(() => ensureBranchAvailable('main', '/test/path', true)).toThrow(
      "Branch 'main' not found locally and --no-fetch flag is set"
    );
  });

  it('should fallback to fetch origin when direct fetch fails', () => {
    mockedRunCommand
      .mockImplementationOnce(() => { throw new Error('not local'); }) // branch doesn't exist locally
      .mockImplementationOnce(() => { throw new Error('not in remote tracking'); }) // branch doesn't exist in remote tracking
      .mockImplementationOnce(() => { throw new Error('direct fetch failed'); }) // direct fetch fails
      .mockImplementationOnce(() => '') // general fetch succeeds
      .mockImplementationOnce(() => ''); // branch now available in remote
    
    expect(() => ensureBranchAvailable('main', '/test/path')).not.toThrow();
    expect(mockedRunCommand).toHaveBeenCalledWith(
      'git fetch origin',
      '/test/path',
      '',
      false,
      0,
      false
    );
  });
});
