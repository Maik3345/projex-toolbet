export * from './types';
export * from './utils';
export * from './analyzers';
export * from './formatters';

import { Colors, getCurrentDirectory } from '@api';
import { log, checkGit, checkIfInGitRepo } from '@shared';
import { SuggestLabelsOptions, SuggestedLabels, AnalysisContext } from './types';
import { buildAnalysisContext, getCurrentBranch } from './utils';
import {
  determineSizeLabel,
  determineTypeLabels,
  determineScopeLabels,
  hasBreakingChanges,
  hasDependencyUpdates,
  needsDocumentation,
  needsTests,
  needsReadmeUpdate,
} from './analyzers';
import { formatOutput } from './formatters';

/**
 * Main function to suggest labels for pull requests
 */
export const suggestLabels = async (options: SuggestLabelsOptions): Promise<void> => {
  try {
    // Validate git environment
    checkGit();
    checkIfInGitRepo();

    const cwd = getCurrentDirectory();
    
    // Get the branch to analyze
    const branch = options.branch || getCurrentBranch(cwd);
    
    if (options.verbose) {
      log.info(Colors.BLUE(`Analyzing branch: ${Colors.WARNING(branch)}`));
      log.info(Colors.BLUE(`Target branch: ${Colors.WARNING(options.target)}`));
    }

    // Build analysis context
    const context: AnalysisContext = buildAnalysisContext(branch, options.target, cwd);
    
    if (options.verbose) {
      log.info(Colors.BLUE(`Found ${Colors.WARNING(context.changedFiles.length.toString())} changed files`));
      log.info(Colors.BLUE(`Lines: +${Colors.WARNING(context.addedLines.toString())} -${Colors.WARNING(context.deletedLines.toString())}`));
      log.info(Colors.BLUE(`Commits analyzed: ${Colors.WARNING(context.commitMessages.length.toString())}`));
    }

    // If no changes found, exit early
    if (context.changedFiles.length === 0) {
      log.info(Colors.YELLOW('No changes found between branches.'));
      return;
    }

    // Analyze and suggest labels
    const suggestions: SuggestedLabels = {
      size: determineSizeLabel(context),
      type: determineTypeLabels(context),
      scope: determineScopeLabels(context),
      breakingChange: hasBreakingChanges(context),
      dependencies: hasDependencyUpdates(context),
      documentationNeeded: needsDocumentation(context),
      testsNeeded: needsTests(context),
      readmeNeedUpdate: needsReadmeUpdate(context),
    };

    // Format and display output
    await formatOutput(suggestions, options.format, options.verbose);

  } catch (error) {
    log.error(Colors.ERROR('Failed to suggest labels'));
    if (options.verbose) {
      log.error(Colors.ERROR(error instanceof Error ? error.message : String(error)));
    }
    process.exit(1);
  }
};
