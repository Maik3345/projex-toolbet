import { Colors } from '@api';
import { log } from '@shared';

import { gt, parse, ReleaseType, valid } from 'semver';
import {
  releaseTypesToUpdateChangelogList,
  supportedReleaseTypesList,
  supportedTagNamesList,
  tagNamesToUpdateChangelog,
} from './constants';

/**
 * Determines whether the changelog should be updated based on the provided release type and optional tag name.
 *
 * The changelog is updated if:
 * - The `releaseType` exists in `releaseTypesToUpdateChangelogList` and the `tagName` exists in `tagNamesToUpdateChangelog`, or
 * - The `releaseType` is considered valid according to the `valid` function.
 *
 * @param releaseType - The type of the release to evaluate.
 * @param tagName - (Optional) The tag name associated with the release.
 * @returns `true` if the changelog should be updated, otherwise `false`.
 */
export const shouldUpdateChangelog = (releaseType: ReleaseType, tagName?: string) => {
  return (
    (releaseTypesToUpdateChangelogList.indexOf(releaseType) >= 0 &&
      tagName &&
      tagNamesToUpdateChangelog.indexOf(tagName) >= 0) ||
    valid(releaseType)
  );
};

/**
 * Validates and determines the next version for a release based on the current version, release type, and optional tag name.
 *
 * - If `releaseType` is a valid semantic version, checks that it is greater than `oldVersion`.
 * - If `releaseType` is a standard release type (e.g., "major", "minor", "patch"), validates it against supported types.
 * - Optionally validates the provided `tagName` against supported tag names.
 * - Throws an error with a descriptive message if validation fails.
 *
 * @param oldVersion - The current version string (semver).
 * @param releaseType - The release type or a specific version string.
 * @param tagName - (Optional) The release tag to validate.
 * @returns A tuple containing the old version and the new version if a specific version is provided.
 * @throws {Error} If the new version is not greater than the old version, or if the release type or tag name is invalid.
 */
export const validateVersion = (oldVersion: string, releaseType: ReleaseType, tagName?: string) => {
  if (valid(releaseType)) {
    const parsedVersion = parse(releaseType);
    const newVersion = parsedVersion?.version;

    if (!newVersion || !gt(newVersion, oldVersion)) {
      const errorMessage =
        `❌ The new version (${Colors.BLUE(newVersion || '')}) must be greater than the previous version (${Colors.BLUE(
          oldVersion || '',
        )}).\n` + Colors.YELLOW('💡 Tip: Check the version number you are trying to release.');
      log.error(Colors.ERROR(errorMessage));
      throw new Error(errorMessage);
    }

    return [oldVersion, newVersion];
  }

  if (!supportedReleaseTypesList.includes(releaseType)) {
    const validReleaseTypes = supportedReleaseTypesList.join(', ');
    const errorMessage =
      `❌ Invalid release type: ${releaseType}\nValid types: ${validReleaseTypes}.\n` +
      Colors.YELLOW('💡 Tip: Use one of the valid release types.');
    log.error(Colors.ERROR(errorMessage));
    throw new Error(errorMessage);
  }

  if (tagName && !supportedTagNamesList.includes(tagName)) {
    const validTagNames = supportedTagNamesList.join(', ');
    const errorMessage =
      `❌ Invalid release tag: ${tagName}\nValid tags: ${validTagNames}.\n` +
      Colors.YELLOW('💡 Tip: Use one of the valid release tags.');
    log.error(Colors.ERROR(errorMessage));
    throw new Error(errorMessage);
  }
};

enum ChangelogSection {
  BreakingChanges = '⚠ BREAKING CHANGES',
  Features = 'Features',
  BugFixes = 'Bug Fixes',
  PerformanceImprovements = 'Performance Improvements',
  Reverts = 'Reverts',
  MiscellaneousChores = 'Miscellaneous Chores',
  Documentation = 'Documentation',
  Styles = 'Styles',
  CodeRefactoring = 'Code Refactoring',
  Tests = 'Tests',
  BuildSystem = 'Build System',
  ContinuousIntegration = 'Continuous Integration',
}

const CHANGELOG_SECTIONS = [
  { type: 'feat', section: ChangelogSection.Features },
  { type: 'fix', section: ChangelogSection.BugFixes },
  { type: 'perf', section: ChangelogSection.PerformanceImprovements },
  { type: 'revert', section: ChangelogSection.Reverts },
  { type: 'chore', section: ChangelogSection.MiscellaneousChores },
  { type: 'docs', section: ChangelogSection.Documentation },
  { type: 'style', section: ChangelogSection.Styles },
  { type: 'refactor', section: ChangelogSection.CodeRefactoring },
  { type: 'test', section: ChangelogSection.Tests },
  { type: 'build', section: ChangelogSection.BuildSystem },
  { type: 'ci', section: ChangelogSection.ContinuousIntegration },
  { type: 'breaking', section: ChangelogSection.BreakingChanges },
];

/**
 * Normalizes an array of commit strings into formatted changelog entries.
 *
 * Each commit string is expected to have the first 40 characters as the commit hash,
 * followed by the commit message. The function formats each commit message as a bullet point.
 * For sections other than `ChangelogSection.BreakingChanges`, it appends a markdown link to the commit.
 *
 * @param commits - An array of commit strings, each starting with a 40-character commit hash.
 * @param originUrl - The base URL of the repository, used to construct commit links.
 * @param section - The changelog section type, used to determine formatting.
 * @returns An array of formatted changelog entry strings.
 */
const normalizeCommit = (commits: string[], originUrl: string, section: ChangelogSection) => {
  return commits.map((commit) => {
    const commitMessage = commit.slice(41);
    const message = `* ${commitMessage}`;

    if (section === ChangelogSection.BreakingChanges) {
      return message;
    }

    const commitId = commit.slice(0, 40);
    return `${message} ([${commitId.slice(0, 8)}](${originUrl}/commit/${commitId}))`;
  });
};

/**
 * Extracts the scope from a commit message and formats it in bold Markdown.
 *
 * The function looks for a scope in the format `(scope)` within the commit message.
 * If a scope is found, it returns the scope wrapped in double asterisks and followed by a colon and space (e.g., `**scope**: `).
 * If no scope is found, it returns an empty string.
 *
 * @param commit - The commit message string to extract the scope from.
 * @returns The formatted scope string if found, otherwise an empty string.
 */
const getScopeInCommit = (commit: string) => {
  let regex = /\(([\w\s-]*)\)/;
  let match = regex.exec(commit);

  if (match) {
    const scope = match[1];
    return scope ? `**${scope}**: ` : '';
  } else {
    return '';
  }
};

/**
 * Generates a URL to a pull request or pull request equivalent based on the repository origin URL.
 *
 * If the origin URL contains 'github', the link will point to the GitHub pull request page.
 * Otherwise, it assumes the repository uses a different platform (e.g., Azure DevOps) and constructs the link accordingly.
 *
 * @param originUrl - The base URL of the repository's origin (e.g., 'https://github.com/user/repo').
 * @param pullRequestId - The identifier of the pull request.
 * @returns The full URL to the pull request page.
 */
const getPullRequestLink = (originUrl: string, pullRequestId: string) => {
  let page = '';
  if (originUrl.includes('github')) {
    page = 'pull';
  } else {
    page = 'pullrequest';
  }

  return `${originUrl}/${page}/${pullRequestId}`;
};

/**
 * Extracts the pull request ID from an Azure DevOps commit message and formats the commit message
 * to include a Markdown link to the pull request.
 *
 * The function looks for commit messages containing the pattern "Merged PR <number>" (case-insensitive),
 * removes this prefix, and appends a Markdown link to the pull request using the provided origin URL.
 * If the pattern is not found, the original commit message is returned unchanged.
 *
 * @param commit - The commit message string to parse.
 * @param originUrl - The repository origin URL used to construct the pull request link.
 * @returns The formatted commit message with a pull request link if a PR ID is found, otherwise the original commit message.
 */
const getPullRequestIdFromAzure = (commit: string, originUrl: string) => {
  let regex = /merged pr\s+(\d+)(\s|:\s)/;
  let match = regex.exec(commit);
  if (match) {
    const text = match[0];
    const pullRequestId = match[1];

    // Remove "Merged PR" text
    const withoutMergedText = commit.replace(text, '');
    const url = getPullRequestLink(originUrl, pullRequestId);
    return `${withoutMergedText} ([#${pullRequestId}](${url}))`;
  } else {
    return commit;
  }
};

/**
 * Extracts the pull request ID from a commit message and replaces it with a Markdown link to the pull request on GitHub.
 *
 * The function searches for a pull request reference in the format `(#123)` within the commit message.
 * If found, it generates a Markdown link to the pull request using the provided GitHub repository URL.
 * The original reference in the commit message is replaced with the Markdown link.
 * If no pull request reference is found, the original commit message is returned unchanged.
 *
 * @param commit - The commit message potentially containing a pull request reference.
 * @param originUrl - The GitHub repository URL used to construct the pull request link.
 * @returns The commit message with the pull request reference replaced by a Markdown link, or the original message if no reference is found.
 */
const getPullRequestIdFromGithub = (commit: string, originUrl: string) => {
  let regex = /\(#(\d+)\)/;
  let match = regex.exec(commit);
  if (match) {
    const text = match[0];
    // remove parentheses
    const withoutParentheses = text.replace(/[\(\)]/g, '');
    // remove # symbol
    const pullRequestId = withoutParentheses.replace('#', '');
    const url = getPullRequestLink(originUrl, pullRequestId);
    return commit.replace(text, `([${withoutParentheses}](${url}))`);
  } else {
    return commit;
  }
};

/**
 * Retrieves the pull request identifier associated with a given commit.
 *
 * This function attempts to extract the pull request ID from the commit message or metadata,
 * prioritizing GitHub-style pull request references. If a GitHub pull request ID is not found,
 * it falls back to extracting an Azure DevOps pull request ID.
 *
 * @param commit - The commit hash or message to analyze for pull request information.
 * @param originUrl - The remote repository URL, used to determine the hosting provider.
 * @returns The pull request identifier if found; otherwise, returns the original commit or an Azure pull request ID.
 */
const getPullRequestCommit = (commit: string, originUrl: string) => {
  const commitWithGithubId = getPullRequestIdFromGithub(commit, originUrl);

  if (commitWithGithubId != commit) {
    return commitWithGithubId;
  } else {
    return getPullRequestIdFromAzure(commit, originUrl);
  }
};

/**
 * Extracts the unreleased changes from the provided changelog content.
 *
 * This function scans the changelog content line by line and collects all lines
 * that appear before the first line matching the release pattern (e.g., `release v1.2.3`).
 * If no unreleased changes are found (i.e., all lines are after the first release entry),
 * the function logs an error and exits the process.
 *
 * @param changelogContent - The full content of the changelog as a string.
 * @returns A string containing all unreleased changes found before the first release entry.
 * @throws Exits the process with an error if no unreleased changes are found.
 */
const getUnReleasedChanges = (changelogContent: string) => {
  let regex = /.*:\s*release\s*(v\d+\.\d+\.\d+)(\s+.*|$)/;
  let lines = changelogContent.split('\n');
  let result = '';

  for (let line of lines) {
    if (regex.test(line)) {
      break;
    }
    result += line + '\n';
  }

  if (!result || result == '') {
    log.error(Colors.ERROR('❌ No unreleased changes found, please check your commits.'));
    log.info(Colors.YELLOW('💡 Tip: Make sure you have new commits since the last release.'));
    process.exit(1);
  }

  return result;
};

/**
 * Generates a formatted changelog section for a given title.
 *
 * @param section - The title of the changelog section (e.g., "Features", "Bug Fixes").
 * @param commits - An array of commit messages to include in the section.
 * @param originUrl - The origin URL of the repository, used for normalizing commit references.
 * @returns A string containing the formatted changelog section with the provided commits.
 */
const generateChangelogSectionForTitle = (section: ChangelogSection, commits: string[], originUrl: string) => {
  const normalizedCommits = normalizeCommit(commits, originUrl, section).join('\n');
  return `
### ${section}

${normalizedCommits}
`;
};

/**
 * Generates a formatted changelog section string by grouping commits according to their changelog section.
 *
 * @param changes - An array of objects representing commit messages and their associated changelog sections.
 * @param originUrl - The origin URL of the repository, used for generating commit links.
 * @returns A formatted changelog section as a string, containing grouped commit messages by section.
 */
const generateChangelogSection = (
  changes: {
    commit: string;
    section: ChangelogSection;
  }[],
  originUrl: string,
): string => {
  const sections = new Map<ChangelogSection, string[]>();
  CHANGELOG_SECTIONS.forEach((section) => sections.set(section.section, []));

  changes.forEach((change) => {
    const section = sections.get(change.section);
    if (section) {
      section.push(change.commit);
    }
  });

  let changelog = '';

  sections.forEach((commits, section) => {
    if (commits.length > 0) {
      changelog += generateChangelogSectionForTitle(section, commits, originUrl);
    }
  });

  return changelog;
};

/**
 * Analyzes a commit message and determines its changelog section(s) based on predefined types and breaking change indicators.
 *
 * Iterates through all `CHANGELOG_SECTIONS` to match the commit message against each section's type.
 * - If a match is found, adds an entry with the corresponding section and a modified commit message.
 * - If a breaking change is detected (using the `!:` syntax), adds an entry to the `BreakingChanges` section and also to the original section type if applicable.
 * - If no matches are found, defaults to the `Features` section.
 *
 * @param commit - The commit message to analyze.
 * @returns An array of objects, each containing the processed commit message and its associated `ChangelogSection`.
 */
const determineTypeChange = (commit: string) => {
  const changes: {
    commit: string;
    section: ChangelogSection;
  }[] = [];

  for (let section of CHANGELOG_SECTIONS) {
    // Get the type of the commit
    let regex = new RegExp(`(${section.type})(\\([\\w\\s-]*\\))?:\\s*`);
    let match = regex.exec(commit);

    // Get the breaking change
    let breakingChangeRegex = new RegExp(`(${section.type})(\\([\\w\\s-]*\\))?!:\\s*`);
    let breakingChangeMatch = breakingChangeRegex.exec(commit);
    const scope = getScopeInCommit(commit);

    if (match) {
      changes.push({
        section: section.section,
        commit: commit.replace(match[0], scope),
      });
    }
    if (breakingChangeMatch) {
      changes.push({
        commit: commit.replace(breakingChangeMatch[0], scope),
        section: ChangelogSection.BreakingChanges,
      });

      const typeChange = breakingChangeMatch[1];
      const typeBreakingChange = CHANGELOG_SECTIONS.find((section) => section.type === typeChange);

      if (typeBreakingChange) {
        changes.push({
          commit: commit.replace(breakingChangeMatch[0], scope),
          section: typeBreakingChange.section,
        });
      }
    }
  }

  if (!changes.length) {
    changes.push({
      commit,
      section: ChangelogSection.Features,
    });
  }

  return changes;
};

/**
 * Determines the semantic version release type ('major', 'minor', or 'patch') based on the provided changelog sections.
 *
 * - Returns `'major'` if any change is in the `BreakingChanges` section.
 * - Returns `'minor'` if there are changes in any section other than `BugFixes` and `BreakingChanges`.
 * - Returns `'patch'` if all changes are only in the `BugFixes` section.
 *
 * @param changes - An array of change objects, each containing a `section` property of type `ChangelogSection`.
 * @returns The determined release type as a string: `'major'`, `'minor'`, or `'patch'`.
 */
const determineReleaseType = (changes: { section: ChangelogSection }[]): ReleaseType => {
  const haveBreakingChanges = changes.some((change) => change.section === ChangelogSection.BreakingChanges);
  const haveChangesExcludingBugFixes = changes.some(
    (change) => change.section !== ChangelogSection.BugFixes && change.section !== ChangelogSection.BreakingChanges,
  );

  if (haveBreakingChanges) {
    return 'major';
  } else if (haveChangesExcludingBugFixes) {
    return 'minor';
  } else {
    return 'patch';
  }
};

/**
 * Organizes raw commit messages into a structured changelog and determines the release type.
 *
 * This function processes a string of commit messages, filters unreleased changes,
 * categorizes each commit by its type (e.g., feature, fix, breaking change), and
 * generates a formatted changelog section. It also determines the appropriate release
 * type (e.g., major, minor, patch) based on the categorized changes.
 *
 * @param commits - A string containing commit messages, typically separated by newlines.
 * @param originUrl - The origin URL of the repository, used to generate links for pull requests or commits.
 * @returns An object containing the generated changelog section and the determined release type.
 */
export const organizeCommitsToChangelog = (commits: string, originUrl: string) => {
  const unReleasedCommits = getUnReleasedChanges(commits);

  const changes: {
    commit: string;
    section: ChangelogSection;
    breakingChange?: boolean | undefined;
  }[] = [];

  // Split commits by line and group them by type
  unReleasedCommits.split('\n').forEach((commit) => {
    if (commit === '') return;

    commit = commit.toLowerCase();
    commit = getPullRequestCommit(commit, originUrl);

    changes.push(...determineTypeChange(commit));
  });

  const changelog = generateChangelogSection(changes, originUrl);
  const releaseType = determineReleaseType(changes);

  return {
    changelog,
    releaseType,
  };
};
