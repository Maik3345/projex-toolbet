import { ReleaseType, valid, parse, gt } from 'semver';
import {
  releaseTypesToUpdateChangelogList,
  supportedReleaseTypesList,
  supportedTagNamesList,
  tagNamesToUpdateChangelog,
} from './constants';
import { ReleaseUtils } from './utils';
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

const normalizeCommit = (commits: string[], originUrl: string) => {
  return commits.map((commit) => {
    const commitId = commit.slice(0, 40);
    const commitMessage = commit.slice(41);
    return `* ${commitMessage} ([${commitId.slice(0, 8)}](${originUrl}/commit/${commitId}))`;
  });
};

const getScopeInCommit = (commit: string) => {
  let regex = /\(([\w\s]*)\)/;
  let match = commit.match(regex);

  if (match) {
    const scope = match[0];
    return scope ? `**${scope.replace(/[\(\)]/g, '')}**:` : '';
  } else {
    return '';
  }
};

const getPullRequestId = (commit: string, originUrl: string) => {
  let regex = /\(#(\d+)\)/;
  let match = commit.match(regex);
  if (match) {
    const text = match[0];
    // remove parentheses
    const withoutParentheses = text.replace(/[\(\)]/g, '');
    // remove # symbol
    const pullRequestId = withoutParentheses.replace('#', '');
    const page = originUrl.startsWith('https://github.com') ? 'pull' : 'pullrequest';
    const path = `${originUrl}/${page}/${pullRequestId}`;
    return commit.replace(text, `([${withoutParentheses}](${path}))`);
  } else {
    return commit;
  }
};

const getUnReleasedChanges = (changelogContent: string) => {
  let regex = /chore\(main\):|master: build:|build:|main: chore\(main\)|master: chore\(main\)|main: build/;
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

export const organizeCommitsToChangelog = (commits: string, originUrl: string) => {
  const unReleasedCommits = getUnReleasedChanges(commits);
  const features: string[] = [];
  const fixes: string[] = [];
  const breakingChanges: string[] = [];

  // Split commits by line and group them by type
  unReleasedCommits.split('\n').forEach((commit) => {
    if (commit === '') return;

    const typeFixed = () => {
      let regex = /(fix)(\([\w\s]*\))?:\s*/;
      let match = commit.match(regex);

      if (match) {
        const scope = getScopeInCommit(commit);
        const commitWithPullRequestId = getPullRequestId(commit, originUrl);
        fixes.push(commitWithPullRequestId.replace(match[0], scope));
        return true;
      }
      return false;
    };

    const typeFeature = () => {
      let regex = /(feat|build|ci|chore|docs|style|refactor|perf|test)(\([\w\s]*\))?:\s*/;
      let match = commit.match(regex);

      if (match) {
        const scope = getScopeInCommit(commit);
        const commitWithPullRequestId = getPullRequestId(commit, originUrl);
        features.push(commitWithPullRequestId.replace(match[0], scope));
        return true;
      }
      return false;
    };

    const typeBreakingChange = () => {
      let regex = /(fix|feat|build|ci|chore|docs|style|refactor|perf|test)(\([\w\s]*\))(!):\s*/;
      let match = commit.match(regex);

      if (match) {
        const type = match[0];
        const scope = getScopeInCommit(commit);
        const commitWithPullRequestId = getPullRequestId(commit, originUrl);
        breakingChanges.push(commitWithPullRequestId.replace(type, scope));
        if (type.includes('fix')) {
          fixes.push(commitWithPullRequestId.replace(type, scope));
        } else {
          features.push(commitWithPullRequestId.replace(type, scope));
        }
        return true;
      }
      return false;
    };

    if (!typeBreakingChange() && !typeFeature() && !typeFixed()) {
      features.push(commit);
    }
  });

  // Normalize commits
  const featuresChanges =
    features.length === 0
      ? ''
      : `
### Features

${normalizeCommit(features, originUrl).join('\n')}
`;

  const fixesChanges =
    fixes.length === 0
      ? ''
      : `
### Bug Fixes

${normalizeCommit(fixes, originUrl).join('\n')}
`;

  const breakingChangesChanges =
    breakingChanges.length === 0
      ? ''
      : `
### ⚠ BREAKING CHANGES

${normalizeCommit(breakingChanges, originUrl).join('\n')}
  `;

  const changelog = `${featuresChanges}${fixesChanges}${breakingChangesChanges}`;
  const releaseType: ReleaseType = breakingChanges.length > 0 ? 'major' : features.length > 0 ? 'minor' : 'patch';

  return {
    changelog,
    releaseType,
  };
};
