export interface LabelSuggestion {
  name: string;
  color: string;
  description: string;
  confidence: number; // 0-100
  evidenceCommit?: CommitEvidence;
}

export interface CommitEvidence {
  commitId: string;
  message: string;
  matchedPattern: string;
}

export interface SuggestedLabels {
  size: LabelSuggestion | null;
  type: LabelSuggestion[];
  release: LabelSuggestion[];
  breakingChange: boolean;
  dependencies: boolean;
  documentationNeeded: boolean;
  testsNeeded: boolean;
  readmeNeedUpdate: boolean;
  hotfix: boolean;
}

export interface AnalysisContext {
  changedFiles: string[];
  addedLines: number;
  deletedLines: number;
  commitMessages: string[];
  commits: CommitInfo[];
  branch: string;
  target: string;
}

export interface CommitInfo {
  id: string;
  message: string;
  fullMessage: string;
}

export interface SuggestLabelsOptions {
  branch?: string;
  target?: string;
  format: 'json' | 'table' | 'list' | 'txt' | 'csv';
  verbose: boolean;
  noFetch?: boolean;
}
