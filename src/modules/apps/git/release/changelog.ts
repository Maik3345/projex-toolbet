import { getAppRoot } from "../../../../api";
import { resolve } from "path";
import { log, runCommand, unreleased } from "../../../../shared";
import { close, existsSync, openSync, readFileSync, writeSync } from "fs-extra";
import chalk from "chalk";

export class ChangelogUtils {
  public root: string;
  private changelogPath: string;
  private changeLogReleaseType: string;

  constructor(changeLogReleaseType: string) {
    this.changeLogReleaseType = changeLogReleaseType;
    this.root = getAppRoot();
    this.changelogPath = resolve(this.root, "CHANGELOG.md");
  }

  private gitLog = () => {
    return runCommand(
      `git rev-list origin..HEAD --format=short --pretty=oneline --abbrev-commit`,
      this.root,
      "",
      true
    );
  };

  public writeGitLogCommits = () => {
    const commitList: string[] = this.gitLog()
      .toString()
      .split("\n")
      .filter((commit) => commit !== "")
      .map((commit) => `- ${commit.slice(8)}`)
      .reverse();

    const newCommitsListMessages = commitList.join("\n");

    const changelogContent = this.getChangelogContent();
    const haveUnReleasedContent =
      this.checkIfHaveUnReleasedChanges(changelogContent);

    if (!haveUnReleasedContent) {
      log.info(chalk.blue("pass to add the changes make by the developer"));
      const unReleasedContent = this.getNewUnReleasedText(commitList);

      this.writeChangelogToAddUnReleasedChanges(
        changelogContent,
        unReleasedContent
      );
      return;
    }

    const currentChanges = this.getCurrentChangesInChangelog(changelogContent);
    const unReleasedChanges = currentChanges[0].text;
    const newChanges = this.checkNewChangesToAdd(changelogContent, commitList);

    if (newChanges.length) {
      log.info(
        chalk.blue(
          `pass to add the new changes make by the developer, total changes to add ${newChanges.length}`
        )
      );
      this.writeChangelogToUpdateUnReleasedChanges(
        changelogContent,
        unReleasedChanges,
        newCommitsListMessages
      );
    } else {
      log.info(chalk.green("No have new changes to add to CHANGELOG"));
    }

    return;
  };

  private getNewUnReleasedText = (commitList: string[]) => {
    const unReleasedContent = `

## ${this.changeLogReleaseType}

${commitList.map((commit) => `${commit}`).join("\n")}`;
    return unReleasedContent;
  };

  private checkIfHaveUnReleasedChanges = (changelogText: string) => {
    const regexCheckApplyContent =
      /## \[Unreleased\]\n\n(?:## |### )(Added|Changed|Fixed|Major)/;
    return changelogText.match(regexCheckApplyContent);
  };

  private writeChangelogToAddUnReleasedChanges = (
    changelogContent: string,
    unReleasedChanges: string
  ) => {
    const position = changelogContent.indexOf(unreleased) + unreleased.length;
    const bufferedText = Buffer.from(
      `${unReleasedChanges}${changelogContent.substring(position)}`
    );
    const file = openSync(this.changelogPath, "r+");
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
    newCommitsListMessages: string
  ) => {
    const newChangelog = changelogContent.replace(
      unReleasedChanges,
      newCommitsListMessages
    );

    const bufferedText = Buffer.from(newChangelog);
    const file = openSync(this.changelogPath, "r+");
    try {
      writeSync(file, bufferedText, 0, bufferedText.length, 0);
      close(file);
      log.info(`updated CHANGELOG with commits messages`);
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

  private checkNewChangesToAdd = (
    changelogText: string,
    newChanges: string[]
  ) => {
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
      (matchUnReleasedContent =
        regexCheckTheLasMessagesUnreleased.exec(changelogText)) !== null &&
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
