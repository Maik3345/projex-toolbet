import { ReleaseType, valid, parse, gt } from 'semver';
import {
  releaseTypesToUpdateChangelogList,
  supportedReleaseTypesList,
  supportedTagNamesList,
  tagNamesToUpdateChangelog,
} from './constants';
import { log } from '@shared';
import { Colors } from '@api';
import chalk from 'chalk';

export const shouldUpdateChangelog = (releaseType: ReleaseType, tagName?: string) => {
  return (
    (releaseTypesToUpdateChangelogList.indexOf(releaseType) >= 0 &&
      tagName &&
      tagNamesToUpdateChangelog.indexOf(tagName) >= 0) ||
    valid(releaseType)
  );
};

export const validateVersion = (oldVersion: string, releaseType: ReleaseType, tagName?: string) => {
  if (valid(releaseType)) {
    // If `releaseType` is a valid (semver) version, use it.
    const parsedVersion = parse(releaseType);
    const newVersion = parsedVersion?.version;

    if (!newVersion || !gt(newVersion, oldVersion)) {
      const errorMessage = `the new version (${chalk.bold(
        newVersion,
      )}) must be greater than the old version (${chalk.bold(oldVersion)})`;
      log.error(Colors.ERROR(errorMessage));
      throw new Error(errorMessage);
    }

    return [oldVersion, newVersion];
  }

  // Else `releaseType` is just a regular release type. Then we increment the actual version.

  // Check if releaseType is valid.
  if (!supportedReleaseTypesList.includes(releaseType)) {
    const validReleaseTypes = supportedReleaseTypesList.join(', ');
    throw new Error(`Invalid release type: ${releaseType}\nValid release types are: ${validReleaseTypes}`);
  }

  // Check if tagName is valid.
  if (tagName && !supportedTagNamesList.includes(tagName)) {
    const validTagNames = supportedTagNamesList.join(', ');
    throw new Error(`Invalid release tag: ${tagName}\nValid release tags are: ${validTagNames}`);
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

const getScopeInCommit = (commit: string) => {
  let regex = /\(([\w\s]*)\)/;
  let match = commit.match(regex);

  if (match) {
    const scope = match[0];
    return scope ? `**${scope.replace(/[\(\)]/g, '')}**: ` : '';
  } else {
    return '';
  }
};

const getPullRequestLink = (originUrl: string, pullRequestId: string) => {
  let page = '';
  if (originUrl.includes('github')) {
    return 'pull';
  } else {
    page = 'pullrequest';
  }

  return `${originUrl}/${page}/${pullRequestId}`;
};

const getPullRequestIdFromAzure = (commit: string, originUrl: string) => {
  let regex = /merged pr\s+(\d+)/;
  let match = commit.match(regex);
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

const getPullRequestIdFromGithub = (commit: string, originUrl: string) => {
  let regex = /\(#(\d+)\)/;
  let match = commit.match(regex);
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

const getPullRequestCommit = (commit: string, originUrl: string) => {
  const commitWithGithubId = getPullRequestIdFromGithub(commit, originUrl);

  if (commitWithGithubId != commit) {
    return commitWithGithubId;
  } else {
    return getPullRequestIdFromAzure(commit, originUrl);
  }
};

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
    log.error(Colors.ERROR('no unreleased changes found, please check your commits.'));
    process.exit(1);
  }

  return result;
};

const generateChangelogSectionForTitle = (section: ChangelogSection, commits: string[], originUrl: string) => {
  const normalizedCommits = normalizeCommit(commits, originUrl, section).join('\n');
  return `
### ${section}

${normalizedCommits}
`;
};

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

const determineTypeChange = (commit: string) => {
  const changes: {
    commit: string;
    section: ChangelogSection;
  }[] = [];

  for (let section of CHANGELOG_SECTIONS) {
    // Get the type of the commit
    let regex = new RegExp(`(${section.type})(\\([\\w\\s]*\\))?:\\s*`);
    let match = commit.match(regex);

    // Get the breaking change
    let breakingChangeRegex = new RegExp(`(${section.type})(\\([\\w\\s]*\\))?!:\\s*`);
    let breakingChangeMatch = commit.match(breakingChangeRegex);
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

const determineReleaseType = (changes: { section: ChangelogSection }[]): ReleaseType => {
  const haveBreakingChanges = changes.some((change) => change.section === ChangelogSection.BreakingChanges);
  const haveBugFix = changes.some((change) => change.section === ChangelogSection.BugFixes);
  return haveBreakingChanges ? 'major' : haveBugFix ? 'patch' : 'minor';
};

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
