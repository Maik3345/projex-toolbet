import { describe, it, expect } from 'vitest';
import {
  determineSizeLabel,
  determineTypeLabels,
  determineReleaseLabels,
  hasBreakingChanges,
  hasDependencyUpdates,
  needsDocumentation,
  needsTests,
  needsReadmeUpdate
} from './analyzers';
import type { AnalysisContext, LabelSuggestion } from './types';

const createMockContext = (overrides: Partial<AnalysisContext> = {}): AnalysisContext => ({
  changedFiles: ['src/components/Button.ts', 'src/utils/helper.ts'],
  addedLines: 50,
  deletedLines: 10,
  commitMessages: ['feat: add new button component', 'fix: resolve helper bug'],
  commits: [
    { id: 'abc123', message: 'feat: add new button component', fullMessage: 'feat: add new button component\n\nAdded a reusable button component for the UI' },
    { id: 'def456', message: 'fix: resolve helper bug', fullMessage: 'fix: resolve helper bug\n\nFixed critical bug in helper function' }
  ],
  branch: 'feature/button-component',
  target: 'main',
  ...overrides
});

describe('determineSizeLabel', () => {
  it('should return small size for minimal changes', () => {
    const context = createMockContext({
      changedFiles: ['src/small.ts'],
      addedLines: 20,
      deletedLines: 5
    });

    const result = determineSizeLabel(context);

    expect(result).toEqual(
      expect.objectContaining({
        name: 'size:small',
        confidence: 85,
        description: expect.stringContaining('Small change: 25 lines, 1 files')
      })
    );
  });

  it('should return medium size for moderate changes', () => {
    const context = createMockContext({
      changedFiles: ['src/file1.ts', 'src/file2.ts', 'src/file3.ts'],
      addedLines: 80,
      deletedLines: 20
    });

    const result = determineSizeLabel(context);

    expect(result).toEqual(
      expect.objectContaining({
        name: 'size:medium',
        confidence: 75,
        description: expect.stringContaining('Medium change: 100 lines, 3 files')
      })
    );
  });

  it('should return large size for extensive changes', () => {
    const context = createMockContext({
      changedFiles: Array.from({ length: 15 }, (_, i) => `src/file${i}.ts`),
      addedLines: 300,
      deletedLines: 50
    });

    const result = determineSizeLabel(context);

    expect(result).toEqual(
      expect.objectContaining({
        name: 'size:large',
        confidence: 90,
        description: expect.stringContaining('Large change: 350 lines, 15 files')
      })
    );
  });

  it('should handle zero changes', () => {
    const context = createMockContext({
      changedFiles: [],
      addedLines: 0,
      deletedLines: 0
    });

    const result = determineSizeLabel(context);

    expect(result).toEqual(
      expect.objectContaining({
        name: 'size:small',
        confidence: 85
      })
    );
  });
});

describe('determineTypeLabels', () => {
  it('should detect feature type from feat commits', () => {
    const context = createMockContext({
      commitMessages: ['feat: add new feature', 'feat(ui): improve button'],
      commits: [
        { id: 'abc', message: 'feat: add new feature', fullMessage: 'feat: add new feature' },
        { id: 'def', message: 'feat(ui): improve button', fullMessage: 'feat(ui): improve button' }
      ]
    });

    const result = determineTypeLabels(context);

    expect(result).toEqual([
      expect.objectContaining({
        name: 'type:feat'
      })
    ]);
  });
});

// Coverage tests for analyzers utility functions
describe('analyzers utility coverage', () => {
  it('needsTests: returns true when code changes but no test changes', () => {
    const context = createMockContext({
      changedFiles: ['src/foo.ts', 'src/bar.js'],
    });
    expect(needsTests(context)).toBe(true);
  });

  it('needsTests: returns false when test changes present', () => {
    const context = createMockContext({
      changedFiles: ['src/foo.ts', 'src/bar.test.ts'],
    });
    expect(needsTests(context)).toBe(false);
  });

  it('needsDocumentation: returns true when code changes but no doc changes', () => {
    const context = createMockContext({
      changedFiles: ['src/foo.ts'],
    });
    expect(needsDocumentation(context)).toBe(true);
  });

  it('needsDocumentation: returns false when doc changes present', () => {
    const context = createMockContext({
      changedFiles: ['src/foo.ts', 'docs/readme.md'],
    });
    expect(needsDocumentation(context)).toBe(false);
  });

  it('needsReadmeUpdate: returns true when new doc added but no readme update', () => {
    const context = createMockContext({
      changedFiles: ['docs/feature.md'],
      addedLines: 10,
      deletedLines: 2,
    });
    expect(needsReadmeUpdate(context)).toBe(true);
  });

  it('needsReadmeUpdate: returns false when readme updated', () => {
    const context = createMockContext({
      changedFiles: ['docs/feature.md', 'README.md'],
      addedLines: 10,
      deletedLines: 2,
    });
    expect(needsReadmeUpdate(context)).toBe(false);
  });

  it('hasDependencyUpdates: returns true when dependency file changed', () => {
    const context = createMockContext({
      changedFiles: ['package.json'],
    });
    expect(hasDependencyUpdates(context)).toBe(true);
  });

  it('hasDependencyUpdates: returns false when no dependency file changed', () => {
    const context = createMockContext({
      changedFiles: ['src/foo.ts'],
    });
    expect(hasDependencyUpdates(context)).toBe(false);
  });

  it('hasBreakingChanges: returns true when commit message contains BREAKING CHANGE', () => {
    const context = createMockContext({
      commitMessages: ['feat: something\nBREAKING CHANGE: api removed'],
    });
    expect(hasBreakingChanges(context)).toBe(true);
  });

  it('hasBreakingChanges: returns false when no breaking change in commit messages', () => {
    const context = createMockContext({
      commitMessages: ['fix: typo'],
    });
    expect(hasBreakingChanges(context)).toBe(false);
  });
});

describe('determineReleaseLabels', () => {
  it('should detect breaking change release for feat! commits', () => {
    const context = createMockContext({
      commitMessages: ['feat!: breaking change'],
      commits: [
        { 
          id: 'abc', 
          message: 'feat!: breaking change', 
          fullMessage: 'feat!: breaking change\n\nBREAKING CHANGE: API changed' 
        }
      ]
    });

    const result = determineReleaseLabels(context);

    expect(result).toEqual([
      expect.objectContaining({
        name: 'release:breaking-change',
        description: 'Breaking change requiring major version bump',
        confidence: 95
      })
    ]);
  });

  it('should detect minor release for new features', () => {
    const context = createMockContext({
      commitMessages: ['feat: add new feature'],
      commits: [
        { id: 'abc', message: 'feat: add new feature', fullMessage: 'feat: add new feature' }
      ]
    });

    const result = determineReleaseLabels(context);

    expect(result).toEqual([
      expect.objectContaining({
        name: 'release:minor',
        description: 'Minor version bump for new features',
        confidence: 85
      })
    ]);
  });

  it('should detect patch release for bug fixes', () => {
    const context = createMockContext({
      commitMessages: ['fix: resolve critical bug'],
      commits: [
        { id: 'abc', message: 'fix: resolve critical bug', fullMessage: 'fix: resolve critical bug' }
      ]
    });

    const result = determineReleaseLabels(context);

    expect(result).toEqual([
      expect.objectContaining({
        name: 'release:patch',
        description: 'Patch version bump for bug fixes and minor changes',
        confidence: 75
      })
    ]);
  });

  it('should prioritize breaking changes over features', () => {
    const context = createMockContext({
      commitMessages: ['feat: add feature', 'feat!: breaking change'],
      commits: [
        { id: 'abc', message: 'feat: add feature', fullMessage: 'feat: add feature' },
        { 
          id: 'def', 
          message: 'feat!: breaking change', 
          fullMessage: 'feat!: breaking change\n\nBREAKING CHANGE: removed old API' 
        }
      ]
    });

    const result = determineReleaseLabels(context);

    expect(result).toEqual([
      expect.objectContaining({
        name: 'release:breaking-change',
        confidence: 95
      })
    ]);
  });

  it('should handle empty commits', () => {
    const context = createMockContext({
      commitMessages: [],
      commits: []
    });

    const result = determineReleaseLabels(context);

    expect(result).toEqual([
      expect.objectContaining({
        name: 'release:patch',
        confidence: 75
      })
    ]);
  });
});

describe('hasBreakingChanges', () => {
  it('should detect breaking changes from commit messages', () => {
    const context = createMockContext({
      commitMessages: ['feat: new feature\n\nBREAKING CHANGE: API has changed']
    });

    const result = hasBreakingChanges(context);

    expect(result).toBe(true);
  });

  it('should detect breaking changes from various patterns', () => {
    const testCases = [
      'BREAKING CHANGE: removed method',
      'breaking change in API',
      'major version update',
      'incompatible with previous',
      'remove api endpoint',
      'remove method from class'
    ];

    testCases.forEach(message => {
      const context = createMockContext({
        commitMessages: [message]
      });

      const result = hasBreakingChanges(context);

      expect(result).toBe(true);
    });
  });

  it('should not detect breaking changes when not present', () => {
    const context = createMockContext({
      commitMessages: ['feat: add new feature', 'fix: resolve bug']
    });

    const result = hasBreakingChanges(context);

    expect(result).toBe(false);
  });
});

describe('hasDependencyUpdates', () => {
  it('should detect dependency updates from package files', () => {
    const depFiles = [
      'package.json',
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml',
      'requirements.txt',
      'Pipfile',
      'composer.json',
      'Gemfile',
      'go.mod'
    ];

    depFiles.forEach(file => {
      const context = createMockContext({
        changedFiles: [`project/${file}`, 'src/component.ts']
      });

      const result = hasDependencyUpdates(context);

      expect(result).toBe(true);
    });
  });

  it('should not detect dependency updates when no dep files changed', () => {
    const context = createMockContext({
      changedFiles: ['src/component.ts', 'src/utils.ts', 'README.md']
    });

    const result = hasDependencyUpdates(context);

    expect(result).toBe(false);
  });
});

describe('needsDocumentation', () => {
  it('should detect when documentation is needed for code changes', () => {
    const context = createMockContext({
      changedFiles: ['src/api/new-feature.ts', 'src/components/NewComponent.tsx']
    });

    const result = needsDocumentation(context);

    expect(result).toBe(true);
  });

  it('should not suggest documentation when docs are included', () => {
    const context = createMockContext({
      changedFiles: ['src/api/feature.ts', 'docs/api.md', 'README.md']
    });

    const result = needsDocumentation(context);

    expect(result).toBe(false);
  });

  it('should not suggest documentation for non-code changes', () => {
    const context = createMockContext({
      changedFiles: ['docs/guide.md', 'README.md', 'CHANGELOG.md']
    });

    const result = needsDocumentation(context);

    expect(result).toBe(false);
  });
});

describe('needsTests', () => {
  it('should detect when tests are needed for code changes', () => {
    const context = createMockContext({
      changedFiles: ['src/utils/helper.ts', 'src/services/api.ts']
    });

    const result = needsTests(context);

    expect(result).toBe(true);
  });

  it('should not suggest tests when tests are included', () => {
    const context = createMockContext({
      changedFiles: ['src/utils/helper.ts', 'src/utils/helper.test.ts']
    });

    const result = needsTests(context);

    expect(result).toBe(false);
  });

  it('should not suggest tests for test files', () => {
    const context = createMockContext({
      changedFiles: ['src/utils.test.ts', 'src/component.spec.tsx']
    });

    const result = needsTests(context);

    expect(result).toBe(false);
  });
});

describe('needsReadmeUpdate', () => {
  it('should detect when README update is needed for new docs', () => {
    const context = createMockContext({
      changedFiles: ['docs/new-feature.md', 'docs/api/endpoints.md'],
      addedLines: 50,
      deletedLines: 5
    });

    const result = needsReadmeUpdate(context);

    expect(result).toBe(true);
  });

  it('should not suggest README update when README is included', () => {
    const context = createMockContext({
      changedFiles: ['docs/feature.md', 'README.md'],
      addedLines: 30,
      deletedLines: 2
    });

    const result = needsReadmeUpdate(context);

    expect(result).toBe(false);
  });

  it('should not suggest README update for existing docs changes', () => {
    const context = createMockContext({
      changedFiles: ['docs/existing.md'],
      addedLines: 5,
      deletedLines: 10 // More deletions than additions
    });

    const result = needsReadmeUpdate(context);

    expect(result).toBe(false);
  });
});
