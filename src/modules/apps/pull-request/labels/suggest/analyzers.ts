/**
 * Detecta si la rama actual es un hotfix (nombre contiene 'hotfix')
 */
export const isHotfixBranch = (context: AnalysisContext): boolean => {
  if (!context.branch) return false;
  return /hotfix/i.test(context.branch);
};
import { AnalysisContext, LabelSuggestion, CommitEvidence } from './types';

/**
 * Determines the size of the change based on files and lines modified
 */
export const determineSizeLabel = (context: AnalysisContext): LabelSuggestion | null => {
  const totalLines = context.addedLines + context.deletedLines;
  const fileCount = context.changedFiles.length;

  // Calculate size based on both line changes and file count
  let size: string;
  let confidence: number;
  let color: string;

  if (totalLines < 50 && fileCount <= 3) {
    size = 'small';
    confidence = 85;
    color = '#0e8a16'; // green
  } else if (totalLines < 200 && fileCount <= 10) {
    size = 'medium';
    confidence = 75;
    color = '#fbca04'; // yellow
  } else {
    size = 'large';
    confidence = 90;
    color = '#d73a49'; // red
  }

  return {
    name: `size:${size}`,
    color,
    description: `${size.charAt(0).toUpperCase() + size.slice(1)} change: ${totalLines} lines, ${fileCount} files`,
    confidence,
  };
};

/**
 * Determines the type of change based on commit messages
 */
export const determineTypeLabels = (context: AnalysisContext): LabelSuggestion[] => {
  // Priority-based type determination following conventional commits
  const primaryType = determinePrimaryConventionalType(context);
  
  if (primaryType) {
    return [primaryType];
  }
  
  return [];
};

/**
 * Determines the release type based on git release logic
 */
export const determineReleaseLabels = (context: AnalysisContext): LabelSuggestion[] => {
  const releaseType = determinePrimaryReleaseType(context);
  
  if (releaseType) {
    return [releaseType];
  }
  
  return [];
};

/**
 * Determines the primary conventional commit type based on priority:
 * Breaking changes (!) > feat > fix > perf > refactor > docs > test > build > ci > chore
 */
const determinePrimaryConventionalType = (context: AnalysisContext): LabelSuggestion | null => {
  const allMessages = context.commitMessages.join(' ').toLowerCase();
  const changedFiles = context.changedFiles.join(' ').toLowerCase();
  const allContent = `${allMessages} ${changedFiles}`;

  // Define conventional commit types with priority order (highest to lowest)
  const typeDefinitions: TypeDefinition[] = [
    // FEAT (High Priority)
    {
      type: 'feat',
      patterns: [
        /\bfeat:/i,
        /\bfeat\(/i,
        /\b(feature|add|new)\b/i,
        /\b(implement|introduce)\b/i,
        /\b(enhance|improvement)\b/i,
      ],
      color: '#0075ca',
      description: 'New feature',
      confidence: 85,
    },

    // FIX (High Priority)
    {
      type: 'fix',
      patterns: [
        /\bfix:/i,
        /\bfix\(/i,
        /\b(fix|bug|hotfix|patch)\b/i,
        /\b(resolve|close|fixes)\s+#?\d+/i,
        /\b(correct|repair)\b/i,
      ],
      color: '#d73a49',
      description: 'Bug fix',
      confidence: 85,
    },
    
    // PERF (Medium Priority)
    {
      type: 'perf',
      patterns: [
        /\bperf:/i,
        /\bperf\(/i,
        /\b(performance|optimize|faster)\b/i,
        /\b(speed|efficiency)\b/i,
      ],
      color: '#28a745',
      description: 'Performance improvement',
      confidence: 80,
    },

    // REFACTOR (Medium Priority)
    {
      type: 'refactor',
      patterns: [
        /\brefactor:/i,
        /\brefactor\(/i,
        /\b(refactor|restructure|reorganize)\b/i,
        /\b(cleanup|clean)\b/i,
        /\brewrite/i,
      ],
      color: '#28a745',
      description: 'Code refactoring',
      confidence: 75,
    },

    // DOCS (Medium Priority)
    {
      type: 'docs',
      patterns: [
        /\bdocs:/i,
        /\bdocs\(/i,
        /\b(docs?|documentation|readme)\b/i,
        /\b(comment|javadoc)\b/i,
        /\.md$/i,
      ],
      color: '#0366d6',
      description: 'Documentation',
      confidence: 75,
    },

    // TEST (Medium Priority)
    {
      type: 'test',
      patterns: [
        /\btest:/i,
        /\btest\(/i,
        /\b(test|spec|coverage)\b/i,
        /\b(unit|integration|e2e)\b/i,
        /\.test\.|\.spec\./i,
      ],
      color: '#6f42c1',
      description: 'Testing',
      confidence: 75,
    },

    // BUILD (Lower Priority)
    {
      type: 'build',
      patterns: [
        /\bbuild:/i,
        /\bbuild\(/i,
        /package\.json$/i,
        /package-lock\.json$/i,
        /yarn\.lock$/i,
        /pnpm-lock\.yaml$/i,
        /\b(webpack|rollup|vite|gulp|grunt|broccoli)\.config\./i,
        /\b(deps|dependencies|devdependencies)\b/i,
        /\b(npm|yarn|pnpm)\b/i,
        /\bbuild/i,
      ],
      color: '#1f883d',
      description: 'Build system',
      confidence: 70,
    },

    // CI (Lower Priority)
    {
      type: 'ci',
      patterns: [
        /\bci:/i,
        /\bci\(/i,
        /\.github\/workflows/i,
        /\.github\/actions/i,
        /\.travis\.yml$/i,
        /\.circleci/i,
        /jenkins/i,
        /\b(travis|circle|browserstack|saucelabs)\b/i,
        /\b(workflow|action|pipeline)\b/i,
        /\bci\b/i,
        /\bcd\b/i,
      ],
      color: '#0969da',
      description: 'CI/CD',
      confidence: 70,
    },

    // CHORE (Lowest Priority)
    {
      type: 'chore',
      patterns: [
        /\bchore:/i,
        /\bchore\(/i,
        /\b(chore|maintenance|update)\b/i,
        /\b(version)\b/i,
      ],
      color: '#586069',
      description: 'Maintenance',
      confidence: 65,
    },
  ];

  // Find the first type that matches (highest priority)
  for (const typeDef of typeDefinitions) {
    const evidence = findCommitEvidence(typeDef.patterns, context);
    if (evidence) {
      // Check if this is a breaking change for this type
      const breakingPatterns = [
        /!:/,  // feat!: or fix!: pattern
        /\bbreaking\s+change/i,
        /\bbreaking:/i,
        /\bmajor\s+change/i,
        /\bincompatible/i,
      ];
      
      const isBreaking = breakingPatterns.some(pattern => 
        pattern.test(evidence.message) ||
        context.commits.some(commit => 
          pattern.test(commit.message) || pattern.test(commit.fullMessage)
        )
      );
      
      // Calculate enhanced confidence based on multiple factors
      const enhancedConfidence = calculateEnhancedConfidence(typeDef, allContent, context);
      
      const typeLabel = isBreaking ? `${typeDef.type}!` : typeDef.type;
      const description = isBreaking ? `${typeDef.description} (breaking change)` : typeDef.description;
      const color = isBreaking ? '#d73a49' : typeDef.color; // Red for breaking changes
      
      return {
        name: `type:${typeLabel}`,
        color,
        description,
        confidence: isBreaking ? Math.min(enhancedConfidence + 10, 100) : enhancedConfidence,
        evidenceCommit: evidence,
      };
    }
  }

  // Default fallback if no specific pattern matches
  // Analyze file changes to make an educated guess
  if (context.changedFiles.length > 0) {
    const hasTestFiles = context.changedFiles.some(file => /\.(test|spec)\./i.test(file));
    const hasDocFiles = context.changedFiles.some(file => /\.(md|txt|rst)$/i.test(file));
    
    if (hasTestFiles) {
      return {
        name: 'type:test',
        color: '#6f42c1',
        description: 'Testing',
        confidence: 60,
      };
    }
    
    if (hasDocFiles) {
      return {
        name: 'type:docs',
        color: '#0366d6',
        description: 'Documentation',
        confidence: 60,
      };
    }
  }

  // Ultimate fallback
  return {
    name: 'type:chore',
    color: '#586069',
    description: 'Maintenance',
    confidence: 50,
  };
};

/**
 * Determines the primary release type based on git release logic:
 * 1. Breaking changes = breaking (highest priority)
 * 2. Features/enhancements = minor 
 * 3. Bug fixes = patch (lowest priority)
 */
const determinePrimaryReleaseType = (context: AnalysisContext): LabelSuggestion | null => {
  const allMessages = context.commitMessages.join(' ').toLowerCase();
  const changedFiles = context.changedFiles.join(' ').toLowerCase();
  const allContent = `${allMessages} ${changedFiles}`;

  // Check for breaking changes first (highest priority)
  const breakingPatterns = [
    /\bbreaking\s+change/i,
    /\bbreaking:/i,
    /!:/,  // feat!: or fix!: pattern
    /\bmajor\s+change/i,
    /\bincompatible/i,
  ];
  
  const breakingEvidence = findCommitEvidence(breakingPatterns, context);
  if (breakingEvidence) {
    return {
      name: 'release:breaking-change',
      color: '#d73a49',
      description: 'Breaking change requiring major version bump',
      confidence: 95,
      evidenceCommit: breakingEvidence,
    };
  }

  // Check for features/non-bugfix changes (minor)
  const minorPatterns = [
    /\bfeat:/i,
    /\bfeat\(/i,
    /\b(feature|add|new)\b/i,
    /\b(implement|introduce)\b/i,
    /\b(enhance|improvement)\b/i,
    /\bperf:/i,
    /\bperf\(/i,
    /\b(performance|optimize)\b/i,
    /\brefactor:/i,
    /\brefactor\(/i,
    /\b(refactor|restructure)\b/i,
  ];

  const minorEvidence = findCommitEvidence(minorPatterns, context);
  if (minorEvidence) {
    return {
      name: 'release:minor',
      color: '#0075ca',
      description: 'Minor version bump for new features',
      confidence: 85,
      evidenceCommit: minorEvidence,
    };
  }

  // Everything else is patch (bug fixes, docs, tests, chores)
  const patchEvidence = context.commits.length > 0 ? {
    commitId: context.commits[0].id,
    message: context.commits[0].message,
    matchedPattern: 'default patch classification',
  } : undefined;

  return {
    name: 'release:patch',
    color: '#28a745',
    description: 'Patch version bump for bug fixes and minor changes',
    confidence: 75,
    evidenceCommit: patchEvidence,
  };
};

interface TypeDefinition {
  type: string;
  patterns: RegExp[];
  color: string;
  description: string;
  confidence: number;
}

/**
 * Finds commit evidence for the given patterns
 */
const findCommitEvidence = (patterns: RegExp[], context: AnalysisContext): CommitEvidence | undefined => {
  // First check commits for direct matches
  for (const commit of context.commits) {
    for (const pattern of patterns) {
      if (pattern.test(commit.message) || pattern.test(commit.fullMessage)) {
        return {
          commitId: commit.id,
          message: commit.message,
          matchedPattern: pattern.source,
        };
      }
    }
  }

  // If no direct commit match, check file names
  const changedFiles = context.changedFiles.join(' ').toLowerCase();
  for (const pattern of patterns) {
    if (pattern.test(changedFiles)) {
      // Return the first commit as representative
      if (context.commits.length > 0) {
        return {
          commitId: context.commits[0].id,
          message: context.commits[0].message,
          matchedPattern: `file pattern: ${pattern.source}`,
        };
      }
    }
  }

  return undefined;
};

/**
 * Calculates enhanced confidence based on multiple factors
 */
const calculateEnhancedConfidence = (typeDef: TypeDefinition, content: string, context: AnalysisContext): number => {
  let confidence = typeDef.confidence;

  // Boost confidence if multiple patterns match
  const matchingPatterns = typeDef.patterns.filter((pattern: RegExp) => pattern.test(content));
  if (matchingPatterns.length > 1) {
    confidence += Math.min(matchingPatterns.length * 5, 15);
  }

  // Boost confidence based on file types
  if (typeDef.type === 'test' && context.changedFiles.some((f) => /\.(test|spec)\./i.test(f))) {
    confidence += 10;
  }

  if (typeDef.type === 'docs' && context.changedFiles.some((f) => /\.(md|txt|rst)$/i.test(f))) {
    confidence += 10;
  }

  // Boost confidence for conventional commit format
  const hasConventionalFormat = typeDef.patterns.some(
    (pattern: RegExp) => pattern.toString().includes(':') && pattern.test(content),
  );
  if (hasConventionalFormat) {
    confidence += 10;
  }

  return Math.min(confidence, 100);
};

/**
 * Checks for breaking changes
 */
export const hasBreakingChanges = (context: AnalysisContext): boolean => {
  const breakingPatterns = [
    /\bBREAKING CHANGE\b/i,
    /\bbreaking\b.*\bchange\b/i,
    /\bmajor\b.*\bversion\b/i,
    /\bincompatible\b/i,
    /\bremove\b.*\bapi\b/i,
    /\bremove\b.*\bmethod\b/i,
    /\bremove\b.*\bfunction\b/i,
  ];

  const allMessages = context.commitMessages.join(' ');
  return breakingPatterns.some((pattern) => pattern.test(allMessages));
};

/**
 * Checks for dependency updates
 */
export const hasDependencyUpdates = (context: AnalysisContext): boolean => {
  const depFiles = [
    'package.json',
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    'requirements.txt',
    'Pipfile',
    'Pipfile.lock',
    'composer.json',
    'composer.lock',
    'Gemfile',
    'Gemfile.lock',
    'go.mod',
    'go.sum',
  ];

  return context.changedFiles.some((file) => depFiles.some((depFile) => file.includes(depFile)));
};

/**
 * Checks if documentation is needed
 */
export const needsDocumentation = (context: AnalysisContext): boolean => {
  // DEBUG: Log all changed files
  if (process.env.PROJEX_DEBUG === '1') {
    // eslint-disable-next-line no-console
    console.log('[needsDocumentation] changedFiles:', context.changedFiles);
  }

  const IGNORED_DIRS = ['.github/', '.vscode/'];
  const isIgnored = (file: string) => IGNORED_DIRS.some(dir => file.replace(/\\/g, '/').includes(dir));

  const hasCodeChanges = context.changedFiles.some((file) =>
    /\.(ts|js|tsx|jsx|py|go|java|c|cpp|cs|php|rb)$/i.test(file)
  );


  const hasDocChanges = context.changedFiles.some(
    (file) => {
      if (isIgnored(file)) {
        if (process.env.PROJEX_DEBUG === '1') {
          // eslint-disable-next-line no-console
          console.log('[needsDocumentation] Ignored doc file:', file);
        }
        return false;
      }
      const isDoc = /\.(md|txt|doc|docx|rst)$/i.test(file) || file.toLowerCase().includes('doc');
      if (isDoc && process.env.PROJEX_DEBUG === '1') {
        // eslint-disable-next-line no-console
        console.log('[needsDocumentation] Detected doc file:', file);
      }
      return isDoc;
    }
  );

  return hasCodeChanges && !hasDocChanges;
};

/**
 * Checks if tests are needed
 */
export const needsTests = (context: AnalysisContext): boolean => {
  const hasCodeChanges = context.changedFiles.some(
    (file) =>
      /\.(ts|js|tsx|jsx|py|go|java|c|cpp|cs|php|rb)$/i.test(file) && !file.includes('test') && !file.includes('spec'),
  );

  const hasTestChanges = context.changedFiles.some(
    (file) => /\.(test|spec)\./i.test(file) || file.includes('__tests__') || file.includes('/test/'),
  );

  return hasCodeChanges && !hasTestChanges;
};

/**
 * Checks if README needs update
 */
export const needsReadmeUpdate = (context: AnalysisContext): boolean => {
  const hasNewDocumentation = context.changedFiles.some(
    (file) =>
      /\.md$/i.test(file) && !file.toLowerCase().includes('readme') && context.addedLines > context.deletedLines, // More additions than deletions (new content)
  );

  const hasReadmeUpdate = context.changedFiles.some((file) => file.toLowerCase().includes('readme'));

  return hasNewDocumentation && !hasReadmeUpdate;
};
