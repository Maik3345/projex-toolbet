import { getAppRoot, renderTableOfCommits } from '@api';
import { log, runCommand, unreleased } from '@shared';
import { close, existsSync, openSync, readFileSync, truncateSync, writeSync } from 'fs-extra';
import { resolve } from 'path';

const chalk = require('chalk');

export class ChangelogUtils {
  public root: string;
  private changelogPath: string;
  private changeLogReleaseType: string;
  private changelogContent: string;

  constructor(changeLogReleaseType: string, changelogContent: string) {
    this.changeLogReleaseType = changeLogReleaseType;
    this.changelogContent = changelogContent;
    this.root = getAppRoot();
    this.changelogPath = resolve(this.root, 'CHANGELOG.md');
  }

  private getOriginBranchName = () => {
    return runCommand(`git remote show origin | grep "HEAD branch" | cut -d ":" -f 2 | xargs`, this.root, '', true);
  };

  private gitLog = (): string => {
    const originBranch = this.getOriginBranchName().toString().trim();
    return runCommand(
      `git rev-list --abbrev-commit HEAD --not ${originBranch} --format=short --pretty=oneline`,
      this.root,
      '',
      true,
    );
  };

  public writeGitLogCommits = () => {
    const comments = this.changelogContent && this.changelogContent !== '' ? this.changelogContent : null;

    let commitList: string[] = [];
    let newCommitsListMessages = '';

    if (!comments) {
      commitList = this.gitLog()
        .toString()
        .split('\n')
        .filter((commit) => commit !== '')
        .map((commit) => `- ${commit.slice(8)}`)
        .reverse();
    } else {
      commitList = comments
        .split('\\n')
        .filter((commit) => commit !== '')
        .map((commit) => `- ${commit}`)
        .reverse();
    }

    if (!commitList.length) {
      log.info(chalk.red('No commits found'));
      return;
    }

    newCommitsListMessages = commitList.join('\n');

    renderTableOfCommits({
      title: 'Commit messages in the current branch',
      emptyMessage: 'No commits found',
      listArray: commitList.map((commit) => [commit]),
    });

    const changelogContent = this.getChangelogContent();
    if (!changelogContent) {
      log.info(chalk.red('No CHANGELOG.md found'));
      return;
    }

    const haveUnReleasedContent = this.checkIfHaveUnReleasedChanges(changelogContent);

    if (!haveUnReleasedContent) {
      const unReleasedContent = this.getNewUnReleasedText(commitList);

      this.writeChangelogToAddUnReleasedChanges(changelogContent, unReleasedContent);
      return;
    }

    const currentChanges = this.getCurrentChangesInChangelog(changelogContent);
    const unReleasedChanges = currentChanges[0].text;

    // Check if the new changes are already in the changelog
    const newChanges = this.checkNewChangesToAdd(changelogContent, commitList);
    // Join the new changes to add to the changelog
    newCommitsListMessages = newChanges.join('\n');
    // Join the new changes with the current changes in the changelog
    const newChangelogContent = `${unReleasedChanges}\n${newCommitsListMessages}`;

    if (newChanges.length) {
      log.info(
        chalk.blue(`pass to add the new changes make by the developer, total changes to add ${newChanges.length}`),
      );
      renderTableOfCommits({
        title: 'New changes to add',
        emptyMessage: 'No commits found to add',
        listArray: newChanges.map((commit) => [commit]),
      });

      this.writeChangelogToUpdateUnReleasedChanges(changelogContent, unReleasedChanges, newChangelogContent);
    } else {
      log.info(chalk.green('No have new changes to add to CHANGELOG'));
    }

    return;
  };

  private getNewUnReleasedText = (commitList: string[]) => {
    const unReleasedContent = `

### ${this.changeLogReleaseType}

${commitList.map((commit) => `${commit}`).join('\n')}`;
    return unReleasedContent;
  };

  private checkIfHaveUnReleasedChanges = (changelogText: string) => {
    const regexCheckApplyContent = /## \[Unreleased\]\n\n(?:## |### )(Added|Changed|Fixed|Major)/;
    return changelogText.match(regexCheckApplyContent);
  };

  private writeChangelogToAddUnReleasedChanges = (changelogContent: string, unReleasedChanges: string) => {
    const position = changelogContent.indexOf(unreleased) + unreleased.length;
    const bufferedText = Buffer.from(`${unReleasedChanges}${changelogContent.substring(position)}`);
    const file = openSync(this.changelogPath, 'r+');
    try {
      writeSync(file, bufferedText, 0, bufferedText.length, position);
      close(file);
      log.info(`updated CHANGELOG`);
    } catch (e) {
      throw new Error(`Error writing file: ${e}`);
    }
  };

  private writeChangelogToUpdateUnReleasedChanges = (
    changelogContent: string,
    unReleasedChanges: string,
    newCommitsListMessages: string,
  ) => {
    const position = changelogContent.indexOf(unReleasedChanges) + unReleasedChanges.length;
    const bufferedText = Buffer.from(
      `${changelogContent.substring(
        0,
        changelogContent.indexOf(unReleasedChanges),
      )}${newCommitsListMessages}${changelogContent.substring(position)}`,
    );

    // clean the content of the changelog
    truncateSync(this.changelogPath, 0);
    const file = openSync(this.changelogPath, 'r+');
    try {
      writeSync(file, bufferedText, 0, bufferedText.length);
      close(file);
      console.log(chalk.green('Successfully updated the CHANGELOG with commit messages.'));
    } catch (e) {
      throw new Error(`Error writing file: ${e}`);
    }
  };

  private getChangelogContent = () => {
    if (existsSync(this.changelogPath)) {
      let data: string;
      try {
        data = readFileSync(this.changelogPath).toString();
      } catch (e) {
        throw new Error(`Error reading file: ${e}`);
      }

      return data;
    }
  };

  private checkNewChangesToAdd = (changelogText: string, newChanges: string[]) => {
    const changesToAdd: string[] = [];
    newChanges.forEach((change) => {
      if (!changelogText.includes(change)) {
        changesToAdd.push(change);
      }
    });
    return changesToAdd;
  };

  private getCurrentChangesInChangelog = (changelogText: string) => {
    // Expresión regular para buscar el texto que sigue después de las secciones de cambio específicas
    const regexCheckTheLasMessagesUnreleased =
      /#{2,3}\s+(Added|Changed|Fixed|Major)\s+(.+?)(?=\n\n## \[\d+\.\d+\.\d+\] - \d{4}-\d{2}-\d{2}|$)/gs;

    // Buscar todas las coincidencias en el texto del changelog
    let matchUnReleasedContent;
    const currentChanges: {
      type: string;
      text: string;
    }[] = [];
    while (
      (matchUnReleasedContent = regexCheckTheLasMessagesUnreleased.exec(changelogText)) !== null &&
      !currentChanges.length
    ) {
      // match[1] contiene el tipo de cambio (Added, Changed, Fixed, Major)
      // match[2] contiene el texto del cambio
      currentChanges.push({
        type: matchUnReleasedContent[1],
        text: matchUnReleasedContent[2].trim(),
      });
    }
    return currentChanges;
  };
}
