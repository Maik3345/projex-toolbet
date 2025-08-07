import { runCommand } from '@shared';
import { AnalysisContext } from './types';
import { Colors } from '@api';
import { log } from '@shared';

/**
 * Gets the current branch name
 */
export const getCurrentBranch = (cwd: string): string => {
  try {
    const output = runCommand('git rev-parse --abbrev-ref HEAD', cwd, '', true, 0, true);
    return output.toString().trim();
  } catch (error) {
    log.error(Colors.ERROR('Failed to get current branch'));
    throw error;
  }
};

/**
 * Gets the list of changed files between two branches
 */
export const getChangedFiles = (branch: string, target: string, cwd: string): string[] => {
  try {
    const output = runCommand(
      `git diff --name-only ${target}...${branch}`,
      cwd,
      '',
      true,
      0,
      true
    );
    const files = output.toString().trim().split('\n').filter((file: string) => file.length > 0);
    return files;
  } catch (error) {
    log.error(Colors.ERROR('Failed to get changed files'));
    throw error;
  }
};

/**
 * Gets the number of added and deleted lines between two branches
 */
export const getLineChanges = (branch: string, target: string, cwd: string): { added: number; deleted: number } => {
  try {
    const output = runCommand(
      `git diff --stat ${target}...${branch}`,
      cwd,
      '',
      true,
      0,
      true
    );
    const statsLine = output.toString().split('\n').find((line: string) => line.includes('insertion') || line.includes('deletion'));
    
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
    log.error(Colors.ERROR('Failed to get line changes'));
    return { added: 0, deleted: 0 };
  }
};

/**
 * Gets commit messages between two branches
 */
export const getCommitMessages = (branch: string, target: string, cwd: string): string[] => {
  try {
    const output = runCommand(
      `git log ${target}..${branch} --pretty=format:"%s"`,
      cwd,
      '',
      true,
      0,
      true
    );
    const messages = output.toString().trim().split('\n').filter((msg: string) => msg.length > 0);
    return messages;
  } catch (error) {
    log.error(Colors.ERROR('Failed to get commit messages'));
    throw error;
  }
};

/**
 * Builds the complete analysis context
 */
export const buildAnalysisContext = (
  branch: string,
  target: string,
  cwd: string
): AnalysisContext => {
  const changedFiles = getChangedFiles(branch, target, cwd);
  const lineChanges = getLineChanges(branch, target, cwd);
  const commitMessages = getCommitMessages(branch, target, cwd);

  return {
    changedFiles,
    addedLines: lineChanges.added,
    deletedLines: lineChanges.deleted,
    commitMessages,
    branch,
    target,
  };
};
