export interface LabelSuggestion {
  name: string;
  color: string;
  description: string;
  confidence: number; // 0-100
}

export interface SuggestedLabels {
  size: LabelSuggestion | null;
  type: LabelSuggestion[];
  scope: LabelSuggestion[];
  breakingChange: boolean;
  dependencies: boolean;
  documentationNeeded: boolean;
  testsNeeded: boolean;
  readmeNeedUpdate: boolean;
}

export interface AnalysisContext {
  changedFiles: string[];
  addedLines: number;
  deletedLines: number;
  commitMessages: string[];
  branch: string;
  target: string;
}

export interface SuggestLabelsOptions {
  branch?: string;
  target: string;
  format: 'json' | 'table' | 'list' | 'txt' | 'csv';
  verbose: boolean;
}
