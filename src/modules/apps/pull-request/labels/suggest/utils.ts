import { Colors } from '@api';
import { log, runCommand } from '@shared';
import { AnalysisContext, CommitInfo } from './types';

/**
 * Gets the current branch name
 */
export const getCurrentBranch = (cwd: string): string => {
  try {
    const output = runCommand('git rev-parse --abbrev-ref HEAD', cwd, '', true, 0, true);
    log.info(Colors.BLUE(`🌿 Current branch: ${output.toString().trim()}`));
    return output.toString().trim();
  } catch (error) {
    log.error(Colors.ERROR('❌ Failed to get current branch'));
    throw error;
  }
};

/**
 * Detects the default/main branch of the repository
 * Checks for common main branch names and returns the first one found
 */
export const getDefaultBranch = (cwd: string): string => {
  const commonMainBranches = ['main', 'master', 'develop', 'dev'];

  for (const branch of commonMainBranches) {
    try {
      // Check if the branch exists locally
      runCommand(`git show-ref --verify --quiet refs/heads/${branch}`, cwd, '', true, 0, true);
      return branch;
    } catch {
      // Branch doesn't exist locally, try remote
      try {
        runCommand(`git show-ref --verify --quiet refs/remotes/origin/${branch}`, cwd, '', true, 0, true);
        return branch;
      } catch {
        // Branch doesn't exist in remote either, continue to next
        continue;
      }
    }
  }

  // If no common branches found, try to get the default branch from remote
  try {
    const output = runCommand('git symbolic-ref refs/remotes/origin/HEAD', cwd, '', true, 0, true);
    const defaultRef = output.toString().trim();
    const match = defaultRef.match(/refs\/remotes\/origin\/(.+)/);
    if (match) {
      return match[1];
    }
  } catch {
    // Ignore error and fallback
  }

  // Last resort: return 'main' as default
  log.warn(Colors.WARNING('⚠️ Could not detect default branch, using "main" as fallback'));
  log.info(Colors.YELLOW('💡 Tip: Make sure your repository has a recognizable main branch.'));
  return 'main';
};

/**
 * Ensures the target branch is available locally for comparison
 * Fetches from remote if the branch doesn't exist locally (unless noFetch is true)
 */
export const ensureBranchAvailable = (
  branch: string,
  cwd: string,
  noFetch: boolean = false,
  verbose: boolean = false,
): void => {
  try {
    // First check if branch exists locally
    runCommand(`git show-ref --verify --quiet refs/heads/${branch}`, cwd, '', true, 0, true);
    if (verbose) {
      log.info(Colors.BLUE(`Branch ${Colors.WARNING(branch)} is available locally`));
    }
    return;
  } catch {
    // Branch doesn't exist locally, check if it exists in remote
    try {
      runCommand(`git show-ref --verify --quiet refs/remotes/origin/${branch}`, cwd, '', true, 0, true);
      if (verbose) {
        log.info(Colors.BLUE(`Branch ${Colors.WARNING(branch)} found in remote, already tracked`));
      }
      return;
    } catch {
      if (noFetch) {
        throw new Error(`Branch '${branch}' not found locally and --no-fetch flag is set`);
      }

      // Branch doesn't exist in remote tracking, try to fetch it
      if (verbose) {
        log.info(Colors.BLUE(`Fetching branch ${Colors.WARNING(branch)} from remote...`));
      }
      try {
        runCommand(`git fetch origin ${branch}:${branch}`, cwd, '', false, 0, false);
        if (verbose) {
          log.info(Colors.BLUE(`✓ Successfully fetched branch ${Colors.WARNING(branch)}`));
        }
        return;
      } catch (fetchError) {
        // If direct fetch fails, try fetching all branches
        if (verbose) {
          log.warn(Colors.WARNING(`Direct fetch failed, trying to fetch all references...`));
          log.warn(
            Colors.WARNING(`Fetch error: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`),
          );
        }
        try {
          runCommand('git fetch origin', cwd, '', false, 0, false);
          if (verbose) {
            log.info(Colors.BLUE(`✓ Fetched all references from origin`));
          }

          // Check again if branch is now available
          try {
            runCommand(`git show-ref --verify --quiet refs/remotes/origin/${branch}`, cwd, '', true, 0, true);
            if (verbose) {
              log.info(Colors.BLUE(`✓ Branch ${Colors.WARNING(branch)} is now available`));
            }
            return;
          } catch {
            throw new Error(`Branch '${branch}' not found in remote repository`);
          }
        } catch (generalFetchError) {
          throw new Error(
            `Failed to fetch from remote: ${
              generalFetchError instanceof Error ? generalFetchError.message : String(generalFetchError)
            }`,
          );
        }
      }
    }
  }
};

/**
 * Gets the list of changed files between two branches
 * Automatically handles remote references if local branches are not available
 */
export const getChangedFiles = (branch: string, target: string, cwd: string, verbose: boolean = false): string[] => {
  const attempts = [
    `git diff --name-only ${target}...${branch}`,
    `git diff --name-only origin/${target}...${branch}`,
    `git diff --name-only ${target}...HEAD`,
    `git diff --name-only origin/${target}...HEAD`,
  ];

  for (let i = 0; i < attempts.length; i++) {
    try {
      const output = runCommand(attempts[i], cwd, '', true, 0, true);
      const files = output
        .toString()
        .trim()
        .split('\n')
        .filter((file: string) => file.length > 0);

      if (i > 0 && verbose) {
        log.info(Colors.BLUE(`✓ Used ${Colors.WARNING(attempts[i])} for comparison`));
      }

      return files;
    } catch (error) {
      if (i === attempts.length - 1) {
        // Last attempt failed
        log.error(Colors.ERROR(`Failed to get changed files between ${target} and ${branch}`));
        log.error(Colors.ERROR('Make sure both branches exist and are accessible'));
        if (verbose) {
          log.error(Colors.ERROR(`Tried commands: ${attempts.join(', ')}`));
        }
        throw error;
      }
      // Continue to next attempt
    }
  }

  return [];
};

/**
 * Gets the number of added and deleted lines between two branches
 * Automatically handles remote references if local branches are not available
 */
export const getLineChanges = (branch: string, target: string, cwd: string): { added: number; deleted: number } => {
  const attempts = [
    `git diff --stat ${target}...${branch}`,
    `git diff --stat origin/${target}...${branch}`,
    `git diff --stat ${target}...HEAD`,
    `git diff --stat origin/${target}...HEAD`,
  ];

  for (const command of attempts) {
    try {
      const output = runCommand(command, cwd, '', true, 0, true);
      const statsLine = output
        .toString()
        .split('\n')
        .find((line: string) => line.includes('insertion') || line.includes('deletion'));

      if (!statsLine) {
        return { added: 0, deleted: 0 };
      }

      const addedMatch = statsLine.match(/(\d+) insertion/);
      const deletedMatch = statsLine.match(/(\d+) deletion/);

      return {
        added: addedMatch ? parseInt(addedMatch[1]) : 0,
        deleted: deletedMatch ? parseInt(deletedMatch[1]) : 0,
      };
    } catch (error) {
      log.error(
        Colors.ERROR(`Error executing command "${command}": ${error instanceof Error ? error.message : String(error)}`),
      );
      continue;
    }
  }

  log.error(Colors.ERROR('Failed to get line changes'));
  return { added: 0, deleted: 0 };
};

/**
 * Gets commit messages between two branches
 * Automatically handles remote references if local branches are not available
 */
export const getCommitMessages = (branch: string, target: string, cwd: string): string[] => {
  const attempts = [
    `git log ${target}..${branch} --pretty=format:"%s"`,
    `git log origin/${target}..${branch} --pretty=format:"%s"`,
    `git log ${target}..HEAD --pretty=format:"%s"`,
    `git log origin/${target}..HEAD --pretty=format:"%s"`,
  ];

  for (const command of attempts) {
    try {
      const output = runCommand(command, cwd, '', true, 0, true);
      const messages = output
        .toString()
        .trim()
        .split('\n')
        .filter((msg: string) => msg.length > 0);
      return messages;
    } catch (error) {
      log.error(
        Colors.ERROR(`Error executing command "${command}": ${error instanceof Error ? error.message : String(error)}`),
      );
      continue;
    }
  }

  log.error(Colors.ERROR('Failed to get commit messages'));
  return [];
};

/**
 * Gets detailed commit information between two branches
 * Returns commits with ID, short message, and full message
 */
export const getDetailedCommits = (branch: string, target: string, cwd: string): CommitInfo[] => {
  const attempts = [
    `git log ${target}..${branch} --pretty=format:"%h|%s|%B" --no-merges`,
    `git log origin/${target}..${branch} --pretty=format:"%h|%s|%B" --no-merges`,
    `git log ${target}..HEAD --pretty=format:"%h|%s|%B" --no-merges`,
    `git log origin/${target}..HEAD --pretty=format:"%h|%s|%B" --no-merges`,
  ];

  for (const command of attempts) {
    try {
      const output = runCommand(command, cwd, '', true, 0, true);
      const commitBlocks = output
        .toString()
        .trim()
        .split('\n\n')
        .filter((block: string) => block.length > 0);

      const commits: CommitInfo[] = [];
      for (const block of commitBlocks) {
        const lines = block.split('\n');
        if (lines.length > 0) {
          const firstLine = lines[0];
          const parts = firstLine.split('|');
          if (parts.length >= 2) {
            const id = parts[0];
            const message = parts[1];
            const fullMessage = lines.slice(1).join('\n').trim() || message;

            commits.push({
              id,
              message,
              fullMessage,
            });
          }
        }
      }

      return commits;
    } catch (error) {
      log.error(
        Colors.ERROR(`Error executing command "${command}": ${error instanceof Error ? error.message : String(error)}`),
      );
      continue;
    }
  }

  log.error(Colors.ERROR('Failed to get detailed commit information'));
  return [];
};

/**
 * Builds the complete analysis context
 */
export const buildAnalysisContext = (
  branch: string,
  target: string,
  cwd: string,
  verbose: boolean = false,
): AnalysisContext => {
  const changedFiles = getChangedFiles(branch, target, cwd, verbose);
  const lineChanges = getLineChanges(branch, target, cwd);
  const commitMessages = getCommitMessages(branch, target, cwd);
  const commits = getDetailedCommits(branch, target, cwd);

  return {
    changedFiles,
    addedLines: lineChanges.added,
    deletedLines: lineChanges.deleted,
    commitMessages,
    commits,
    branch,
    target,
  };
};
