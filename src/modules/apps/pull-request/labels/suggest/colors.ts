// Centralized label color palette for PR label suggestion
// All label types and flags should use this map for color assignment

export const LABEL_COLORS: Record<string, string> = {
  // Size labels
  'size:small': '#2ecc40',      // Green
  'size:medium': '#f1c40f',     // Yellow
  'size:large': '#e74c3c',      // Red
  // Type labels
  'type:bug': '#d73a4a',        // GitHub bug red
  'type:feat': '#1abc9c',       // Teal (alias de feature)
  'type:feature': '#1abc9c',    // Teal
  'type:docs': '#6f42c1',       // Purple
  'type:refactor': '#ff9800',   // Orange
  'type:test': '#fbca04',       // Gold
  'type:chore': '#bdbdbd',      // Gray
  'type:perf': '#f67280',       // Pink
  'type:style': '#8e44ad',      // Deep purple
  'type:ci': '#2980b9',         // Blue
  'type:build': '#34495e',      // Dark blue/gray
  'type:main': '#2d3436',       // Dark gray
  'type:other': '#95a5a6',      // Light gray
  // Release labels
  'release:major': '#e74c3c',      // Red
  'release:minor': '#f1c40f',      // Yellow
  'release:patch': '#2ecc40',      // Green
  'release:prerelease': '#b2bec3', // Light gray
  // Scope labels (examples)
  'scope:api': '#0366d6',       // Blue
  'scope:ui': '#a2eeef',        // Light blue
  'scope:ci': '#e99695',        // Pink
  // Flags
  'breaking-change': '#e11d21', // Strong red
  'dependencies-updated': '#0366d6', // Blue
  'documentation-needed': '#6f42c1', // Purple
  'tests-needed': '#fbca04',    // Gold
  'readme-need-update': '#0e8a16', // Green
  'hotfix': '#ff8800',          // Orange
};
