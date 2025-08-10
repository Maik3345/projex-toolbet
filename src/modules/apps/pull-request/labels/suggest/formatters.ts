import { Colors } from '@api';
import { log } from '@shared';
import { createTable } from '@api';
import { SuggestedLabels, LabelSuggestion } from './types';

/**
 * Formats and displays the suggested labels
 */
export const formatOutput = async (
  suggestions: SuggestedLabels,
  format: 'json' | 'table' | 'list' | 'txt' | 'csv',
  verbose: boolean
): Promise<void> => {
  switch (format) {
    case 'json':
      await formatAsJson(suggestions, verbose);
      break;
    case 'table':
      await formatAsTable(suggestions, verbose);
      break;
    case 'list':
      await formatAsList(suggestions, verbose);
      break;
    case 'txt':
      await formatAsTxt(suggestions, verbose);
      break;
    case 'csv':
      await formatAsCsv(suggestions, verbose);
      break;
    default:
      await formatAsJson(suggestions, verbose);
  }
};

/**
 * Formats output as JSON
 */
const formatAsJson = async (suggestions: SuggestedLabels, verbose: boolean): Promise<void> => {
  const output = buildOutputObject(suggestions);
  
  if (verbose) {
    log.info(Colors.BLUE('Generated label suggestions:'));
  }
  
  console.log(JSON.stringify(output, null, 2));
};

/**
 * Formats output as a table
 */
const formatAsTable = async (suggestions: SuggestedLabels, verbose: boolean): Promise<void> => {
  const allLabels = getAllLabels(suggestions);
  
  if (allLabels.length === 0) {
    log.info(Colors.YELLOW('No labels suggested based on the analysis.'));
    return;
  }

  const tableData = allLabels.map(label => ({
    'Label': label.name,
    'Type': getLabelType(label.name),
    'Confidence': `${label.confidence}%`,
    'Description': label.description,
    'Evidence': label.evidenceCommit ? `${label.evidenceCommit.commitId}: ${label.evidenceCommit.message}` : 'N/A',
  }));

  if (verbose) {
    log.info(Colors.BLUE('Generated label suggestions:'));
  }

  const table = createTable({
    head: ['Label', 'Type', 'Confidence', 'Description', 'Evidence'],
  });

  tableData.forEach(row => {
    table.push([row.Label, row.Type, row.Confidence, row.Description, row.Evidence]);
  });

  console.log(table.toString());

  // Show boolean flags
  showBooleanFlags(suggestions);
};

/**
 * Formats output as a simple list
 */
const formatAsList = async (suggestions: SuggestedLabels, verbose: boolean): Promise<void> => {
  const allLabels = getAllLabels(suggestions);
  
  if (verbose) {
    log.info(Colors.BLUE('Generated label suggestions:'));
  }

  if (allLabels.length === 0) {
    log.info(Colors.YELLOW('No labels suggested based on the analysis.'));
    return;
  }

  // Group by type
  const groupedLabels = groupLabelsByType(allLabels);
  
  for (const [type, labels] of Object.entries(groupedLabels)) {
    if (labels.length > 0) {
      log.info(Colors.BLUE(`\n${type.toUpperCase()}:`));
      labels.forEach(label => {
        const confidenceColor = getConfidenceColor(label.confidence);
        const evidenceText = label.evidenceCommit 
          ? ` [${Colors.YELLOW(label.evidenceCommit.commitId)}: ${label.evidenceCommit.message}]`
          : '';
        log.info(`  • ${Colors.WHITE(label.name)} ${confidenceColor(`(${label.confidence}%)`)} - ${label.description}${evidenceText}`);
      });
    }
  }

  // Show boolean flags
  showBooleanFlags(suggestions);
};

/**
 * Formats output as plain text
 */
const formatAsTxt = async (suggestions: SuggestedLabels, verbose: boolean): Promise<void> => {
  const allLabels = getAllLabels(suggestions);
  
  if (verbose) {
    log.info(Colors.BLUE('Generated label suggestions:'));
  }

  if (allLabels.length === 0) {
    console.log('No labels suggested based on the analysis.');
    return;
  }

  // Generate plain text output
  let output = 'SUGGESTED LABELS\n';
  output += '================\n\n';

  // Group by type
  const groupedLabels = groupLabelsByType(allLabels);
  
  for (const [type, labels] of Object.entries(groupedLabels)) {
    if (labels.length > 0) {
      output += `${type.toUpperCase()}:\n`;
      labels.forEach(label => {
        const evidenceText = label.evidenceCommit 
          ? ` [${label.evidenceCommit.commitId}: ${label.evidenceCommit.message}]`
          : '';
        output += `  - ${label.name} (${label.confidence}%): ${label.description}${evidenceText}\n`;
      });
      output += '\n';
    }
  }

  // Add boolean flags
  const flags = [];
  if (suggestions.breakingChange) flags.push('Breaking Change');
  if (suggestions.dependencies) flags.push('Dependencies Updated');
  if (suggestions.documentationNeeded) flags.push('Documentation Needed');
  if (suggestions.testsNeeded) flags.push('Tests Needed');
  if (suggestions.readmeNeedUpdate) flags.push('README Update Needed');
  
  if (flags.length > 0) {
    output += 'ADDITIONAL FLAGS:\n';
    flags.forEach(flag => {
      output += `  - ${flag}\n`;
    });
    output += '\n';
  }

  // Add summary
  const summary = buildOutputObject(suggestions).summary;
  output += 'SUMMARY:\n';
  output += `  Total Labels: ${summary.totalLabels}\n`;
  output += `  High Confidence (≥80%): ${summary.highConfidence}\n`;
  output += `  Medium Confidence (60-79%): ${summary.mediumConfidence}\n`;
  output += `  Low Confidence (<60%): ${summary.lowConfidence}\n`;

  console.log(output);
};

/**
 * Formats output as CSV (comma-separated labels)
 */
const formatAsCsv = async (suggestions: SuggestedLabels, verbose: boolean): Promise<void> => {
  const allLabels = getAllLabels(suggestions);
  
  if (verbose) {
    log.info(Colors.BLUE('Generated label suggestions:'));
  }

  if (allLabels.length === 0) {
    console.log('');
    return;
  }

  // Get only the label names
  const labelNames = allLabels.map(label => label.name);
  
  // Add flag-based labels if they exist
  const flagLabels = [];
  if (suggestions.breakingChange) flagLabels.push('breaking-change');
  if (suggestions.dependencies) flagLabels.push('dependencies-updated');
  if (suggestions.documentationNeeded) flagLabels.push('documentation-needed');
  if (suggestions.testsNeeded) flagLabels.push('tests-needed');
  if (suggestions.readmeNeedUpdate) flagLabels.push('readme-need-update');
  
  // Combine all labels
  const allLabelNames = [...labelNames, ...flagLabels];
  
  // Output as comma-separated values
  console.log(allLabelNames.join(','));
};

/**
 * Builds the complete output object
 */
const buildOutputObject = (suggestions: SuggestedLabels) => {
  const allLabels = getAllLabels(suggestions);
  
  return {
    labels: allLabels.map(label => ({
      name: label.name,
      color: label.color,
      description: label.description,
      confidence: label.confidence,
      ...(label.evidenceCommit && {
        evidence: {
          commitId: label.evidenceCommit.commitId,
          message: label.evidenceCommit.message,
          matchedPattern: label.evidenceCommit.matchedPattern,
        }
      })
    })),
    flags: {
      breakingChange: suggestions.breakingChange,
      dependencies: suggestions.dependencies,
      documentationNeeded: suggestions.documentationNeeded,
      testsNeeded: suggestions.testsNeeded,
      readmeNeedUpdate: suggestions.readmeNeedUpdate,
    },
    summary: {
      totalLabels: allLabels.length,
      highConfidence: allLabels.filter(l => l.confidence >= 80).length,
      mediumConfidence: allLabels.filter(l => l.confidence >= 60 && l.confidence < 80).length,
      lowConfidence: allLabels.filter(l => l.confidence < 60).length,
    },
  };
};

/**
 * Gets all labels from suggestions
 */
const getAllLabels = (suggestions: SuggestedLabels): LabelSuggestion[] => {
  const labels: LabelSuggestion[] = [];
  
  if (suggestions.size) {
    labels.push(suggestions.size);
  }
  
  labels.push(...suggestions.type);
  labels.push(...suggestions.release);
  
  return labels.sort((a, b) => b.confidence - a.confidence);
};

/**
 * Gets the type from a label name
 */
const getLabelType = (labelName: string): string => {
  const parts = labelName.split(':');
  return parts[0] || 'unknown';
};

/**
 * Groups labels by their type
 */
const groupLabelsByType = (labels: LabelSuggestion[]): Record<string, LabelSuggestion[]> => {
  return labels.reduce((groups, label) => {
    const type = getLabelType(label.name);
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(label);
    return groups;
  }, {} as Record<string, LabelSuggestion[]>);
};

/**
 * Gets color for confidence level
 */
const getConfidenceColor = (confidence: number): (text: string) => string => {
  if (confidence >= 80) return Colors.GREEN;
  if (confidence >= 60) return Colors.YELLOW;
  return Colors.ERROR;
};

/**
 * Shows boolean flags in a formatted way
 */
const showBooleanFlags = (suggestions: SuggestedLabels): void => {
  const flags = [];
  
  if (suggestions.breakingChange) flags.push('⚠️  Breaking Change');
  if (suggestions.dependencies) flags.push('📦 Dependencies Updated');
  if (suggestions.documentationNeeded) flags.push('📝 Documentation Needed');
  if (suggestions.testsNeeded) flags.push('🧪 Tests Needed');
  if (suggestions.readmeNeedUpdate) flags.push('📋 README Update Needed');
  
  if (flags.length > 0) {
    log.info(Colors.BLUE('\nAdditional Flags:'));
    flags.forEach(flag => log.info(`  ${flag}`));
  }
};
