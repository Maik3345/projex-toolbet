import { Colors, getAppRoot, renderTableOfCommits } from '@api';
import { log, runCommand, unreleased } from '@shared';
import { close, existsSync, openSync, readFileSync, truncateSync, writeSync } from 'fs-extra';
import { resolve } from 'path';

const chalk = require('chalk');

export class ChangelogUtils {
  public root: string;
  private changelogPath: string;
  private changeLogReleaseType: string;
  private changelogContent: string;
  private originUrl: string;

  constructor(changeLogReleaseType: string, changelogContent: string) {
    this.changeLogReleaseType = changeLogReleaseType;
    this.changelogContent = changelogContent;
    this.root = getAppRoot();
    this.changelogPath = resolve(this.root, 'CHANGELOG.md');
    this.originUrl = this.getOriginUrl();
  }

  public writeGitLogCommits = () => {
    const comments = this.changelogContent && this.changelogContent !== '' ? this.changelogContent : null;

    let commitList: string[] = [];
    let newCommitsListMessages = '';

    if (!comments) {
      commitList = this.gitLog()
        .toString()
        .split('\n')
        .filter((commit) => commit !== '')
        .map((commit) => this.removeBranchNameInText(commit))
        .reverse();
    } else {
      commitList = comments
        .split('\\n')
        .filter((commit) => commit !== '')
        .reverse();
    }

    if (!commitList.length) {
      log.error(Colors.ERROR('no commits found in the current branch'));
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
      log.error(Colors.ERROR('no have CHANGELOG.md file in the project'));
      return;
    }

    const haveUnReleasedContent = this.checkIfHaveUnReleasedChanges(changelogContent);

    if (!haveUnReleasedContent) {
      const unReleasedChanges = this.getNewUnReleasedText(this.addCommitIdInText(commitList));

      this.writeChangelogToAddUnReleasedChanges(changelogContent, unReleasedChanges);
      return;
    }

    const currentChanges = this.getCurrentChangesInChangelog(changelogContent);

    if (!currentChanges) {
      log.error(Colors.ERROR('no have Unreleased changes in the CHANGELOG.md file'));
      return;
    }

    const unReleasedChanges = currentChanges?.replace(/\n+$/, '');

    // Check if the new changes are already in the changelog
    const newChanges = this.checkNewChangesToAdd(unReleasedChanges, commitList);
    // Join the new changes to add to the changelog
    newCommitsListMessages = newChanges.map((change) => `- ${change}`).join('\n');

    // Join the new changes with the current changes in the changelog
    const newChangelogContent = `${unReleasedChanges}\n${newCommitsListMessages}`;
    if (newChanges.length) {
      log.info(`pass to add the new changes make by the developer, total changes to add ${newChanges.length}`);
      renderTableOfCommits({
        title: 'New changes to add',
        emptyMessage: 'No commits found to add',
        listArray: newChanges.map((commit) => [commit]),
      });

      this.writeChangelogToUpdateUnReleasedChanges(changelogContent, unReleasedChanges, newChangelogContent);
    } else {
      log.warn('No have new changes to add to CHANGELOG');
    }

    return;
  };

  private addCommitIdInText = (commitList: string[]) => {
    return commitList.map((commit) => {
      const commitId = commit.slice(0, 40);
      const commitMessage = commit.slice(41);
      return `${commitMessage} ([${commitId.slice(0, 8)}](${this.originUrl}/commit/${commitId}))`;
    });
  };

  private removeBranchNameInText = (text: string) => {
    const ramas = ['master', 'main', 'dev', 'uat', 'develop', 'feature/', 'hotfix/', 'release/', 'bugfix/', 'support/'];
    // Crear la expresión regular para buscar los nombres de las ramas
    const regexRamas = new RegExp(ramas.map((r) => `(${r}.*?):\\s*`).join('|'), 'g');
    // Reemplazar los textos que coinciden con los nombres de las ramas por una cadena vacía
    return text.replace(regexRamas, '');
  };

  private getOriginBranchName = () => {
    return runCommand(`git remote show origin | grep "HEAD branch" | cut -d ":" -f 2 | xargs`, this.root, '', true);
  };

  private getOriginUrl = () => {
    const url = runCommand(`git config --get remote.origin.url`, this.root, '', true)
      ?.toString()
      .replace('\n', '')
      .replace('.git', '');

    return url.replace(/https?:\/\/[^@]*@/, 'https://');
  };

  private gitLog = (): string => {
    const originBranch = this.getOriginBranchName().toString().trim();
    return runCommand(`git rev-list HEAD --not ${originBranch} --pretty=oneline`, this.root, '', true);
  };

  private getNewUnReleasedText = (commitList: string[]) => {
    const unReleasedContent = `

### ${this.changeLogReleaseType}

${commitList.map((commit) => `- ${commit}`).join('\n')}`;
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
      log.info(`successfully added the new changes to the CHANGELOG.md file.`);
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
      log.info('successfully updated the CHANGELOG with commit messages.');
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
    const regex = /## \[\d+\.\d+\.\d+\] - \d{4}-\d{2}-\d{2}/;
    const match = changelogText.match(regex);
    const changelogUnReleasedText = match ? changelogText.substring(0, match.index) : changelogText;
    const changesToAdd: string[] = [];
    newChanges.forEach((change) => {
      if (!changelogUnReleasedText.includes(change.substring(41))) {
        changesToAdd.push(change);
      }
    });
    return this.addCommitIdInText(changesToAdd);
  };

  private getCurrentChangesInChangelog = (changelogText: string) => {
    // Expresión regular para buscar el texto que sigue después de las secciones de cambio específicas
    const regexCheckTheLasMessagesUnreleased = /.*?(?=## \[\d+\.\d+\.\d+\] - \d{4}-\d{2}-\d{2})/s;
    const result = regexCheckTheLasMessagesUnreleased.exec(changelogText);
    if (!result) {
      return null;
    }

    return result[0];
  };
}
