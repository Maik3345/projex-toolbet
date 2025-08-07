import { AnalysisContext, LabelSuggestion } from './types';

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
  const typePatterns = {
    bug: {
      patterns: [/\b(fix|bug|hotfix|patch)\b/i, /\b(resolve|close|fixes)\s+#?\d+/i],
      color: '#d73a49',
      description: 'Bug fix or error correction',
    },
    feature: {
      patterns: [/\b(feat|feature|add|new)\b/i, /\b(implement|introduce)\b/i],
      color: '#0075ca',
      description: 'New feature or enhancement',
    },
    docs: {
      patterns: [/\b(docs?|documentation|readme)\b/i, /\b(comment|javadoc)\b/i],
      color: '#0366d6',
      description: 'Documentation changes',
    },
    refactor: {
      patterns: [/\b(refactor|restructure|reorganize)\b/i, /\b(cleanup|clean)\b/i],
      color: '#28a745',
      description: 'Code refactoring without functional changes',
    },
    test: {
      patterns: [/\b(test|spec|coverage)\b/i, /\b(unit|integration|e2e)\b/i],
      color: '#6f42c1',
      description: 'Testing related changes',
    },
    chore: {
      patterns: [/\b(chore|maintenance|update)\b/i, /\b(deps|dependencies|version)\b/i],
      color: '#586069',
      description: 'Maintenance and housekeeping',
    },
  };

  const allMessages = context.commitMessages.join(' ').toLowerCase();
  const suggestions: LabelSuggestion[] = [];

  for (const [type, config] of Object.entries(typePatterns)) {
    const matches = config.patterns.some(pattern => pattern.test(allMessages));
    if (matches) {
      const confidence = calculateTypeConfidence(type, allMessages, context);
      suggestions.push({
        name: `type:${type}`,
        color: config.color,
        description: config.description,
        confidence,
      });
    }
  }

  return suggestions;
};

/**
 * Determines the scope based on modified files
 */
export const determineScopeLabels = (context: AnalysisContext): LabelSuggestion[] => {
  const scopePatterns = {
    api: {
      patterns: [/\bapi\b/i, /\bendpoint/i, /\bcontroller/i, /\broute/i, /\bservice/i],
      color: '#f9d71c',
      description: 'API related changes',
    },
    ui: {
      patterns: [/\bui\b/i, /\bcomponent/i, /\bview/i, /\bpage/i, /\btemplate/i, /\.(vue|jsx?|tsx?)$/i, /\.(css|scss|sass|less)$/i],
      color: '#ff6b6b',
      description: 'User interface changes',
    },
    docs: {
      patterns: [/\bdocs?\b/i, /\breadme/i, /\.md$/i, /\bchangelog/i],
      color: '#0366d6',
      description: 'Documentation changes',
    },
    tests: {
      patterns: [/\btest/i, /\bspec/i, /\.(test|spec)\./i, /__tests__/i],
      color: '#6f42c1',
      description: 'Test related changes',
    },
    ci: {
      patterns: [/\.github/i, /\bci\b/i, /\bcd\b/i, /\bworkflow/i, /\baction/i, /\bjenkins/i, /\bdocker/i],
      color: '#28a745',
      description: 'CI/CD related changes',
    },
  };

  const suggestions: LabelSuggestion[] = [];
  const allPaths = context.changedFiles.join(' ').toLowerCase();

  for (const [scope, config] of Object.entries(scopePatterns)) {
    const matches = config.patterns.some(pattern => pattern.test(allPaths));
    if (matches) {
      const confidence = calculateScopeConfidence(scope, context);
      suggestions.push({
        name: `scope:${scope}`,
        color: config.color,
        description: config.description,
        confidence,
      });
    }
  }

  return suggestions;
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
  return breakingPatterns.some(pattern => pattern.test(allMessages));
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

  return context.changedFiles.some(file => 
    depFiles.some(depFile => file.includes(depFile))
  );
};

/**
 * Checks if documentation is needed
 */
export const needsDocumentation = (context: AnalysisContext): boolean => {
  const hasCodeChanges = context.changedFiles.some(file => 
    /\.(ts|js|tsx|jsx|py|go|java|c|cpp|cs|php|rb)$/i.test(file)
  );

  const hasDocChanges = context.changedFiles.some(file => 
    /\.(md|txt|doc|docx|rst)$/i.test(file) || 
    file.toLowerCase().includes('doc')
  );

  return hasCodeChanges && !hasDocChanges;
};

/**
 * Checks if tests are needed
 */
export const needsTests = (context: AnalysisContext): boolean => {
  const hasCodeChanges = context.changedFiles.some(file => 
    /\.(ts|js|tsx|jsx|py|go|java|c|cpp|cs|php|rb)$/i.test(file) &&
    !file.includes('test') && 
    !file.includes('spec')
  );

  const hasTestChanges = context.changedFiles.some(file => 
    /\.(test|spec)\./i.test(file) || 
    file.includes('__tests__') ||
    file.includes('/test/')
  );

  return hasCodeChanges && !hasTestChanges;
};

/**
 * Checks if README needs update
 */
export const needsReadmeUpdate = (context: AnalysisContext): boolean => {
  const hasNewDocumentation = context.changedFiles.some(file => 
    /\.md$/i.test(file) && 
    !file.toLowerCase().includes('readme') &&
    context.addedLines > context.deletedLines // More additions than deletions (new content)
  );

  const hasReadmeUpdate = context.changedFiles.some(file => 
    file.toLowerCase().includes('readme')
  );

  return hasNewDocumentation && !hasReadmeUpdate;
};

// Helper functions
function calculateTypeConfidence(type: string, messages: string, context: AnalysisContext): number {
  let confidence = 60;
  
  // Increase confidence based on file patterns
  if (type === 'docs' && context.changedFiles.some(f => /\.md$/i.test(f))) confidence += 20;
  if (type === 'test' && context.changedFiles.some(f => /\.(test|spec)\./i.test(f))) confidence += 20;
  if (type === 'feature' && context.addedLines > context.deletedLines * 2) confidence += 15;
  if (type === 'bug' && context.deletedLines > context.addedLines) confidence += 10;
  
  return Math.min(confidence, 95);
}

function calculateScopeConfidence(scope: string, context: AnalysisContext): number {
  let confidence = 70;
  
  const relevantFiles = context.changedFiles.filter(file => {
    switch (scope) {
      case 'ui': return /\.(vue|jsx?|tsx?|css|scss|sass|less)$/i.test(file);
      case 'api': return /\bapi\b/i.test(file) || /\b(controller|service|route)\b/i.test(file);
      case 'docs': return /\.md$/i.test(file);
      case 'tests': return /\.(test|spec)\./i.test(file);
      case 'ci': return /\.github/i.test(file) || /\b(docker|jenkins)\b/i.test(file);
      default: return false;
    }
  });
  
  const percentage = relevantFiles.length / context.changedFiles.length;
  confidence += Math.round(percentage * 25);
  
  return Math.min(confidence, 95);
}
