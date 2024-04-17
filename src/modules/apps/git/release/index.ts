import chalk from "chalk";
import { prop } from "ramda";
import { log, renderTableOfReleaseVersions } from "../../../../shared";
import { getNewAndOldVersions, shouldUpdateChangelog } from "./changelog";
import { releaseTypeAliases } from "./constants";
import { ReleaseUtils } from "./utils";

export const release = async (
  releaseType = "patch", // This arg. can also be a valid (semver) version.
  tagName = "beta",
  options
) => {
  const preConfirm = options.y || options.yes;
  const pushAutomatic = options.noPush;
  const automaticDeploy = options.noDeploy;
  const checkPreRelease = options.noCheckRelease;
  const noTag = options.noTag;
  const getVersion = options.getVersion;

  const utils = new ReleaseUtils();

  utils.checkGit();
  utils.checkIfInGitRepo();

  const normalizedReleaseType =
    prop<string>(releaseType, releaseTypeAliases) || releaseType;
  const [oldVersion, newVersion] = getNewAndOldVersions(
    utils,
    normalizedReleaseType,
    tagName
  );
  // Pachamama v2 requires that version tags start with a 'v' character.
  const tagText = `v${newVersion}`;

  if (getVersion) {
    return console.log(
      `old_version:${oldVersion},new_version:${newVersion},app_name:${utils.readAppName()},push:${utils.pushCommand(
        tagText,
        noTag
      )}`
    );
  } else {
    renderTableOfReleaseVersions({
      emptyMessage: "No commits found",
      listArray: [
        {
          text: "Old version",
          value: oldVersion,
        },
        {
          text: "New version",
          value: chalk.yellow(newVersion),
        },
      ],
    });
  }

  const [month, day, year] = new Date()
    .toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .split("/");

  const changelogVersion = `\n\n## [${newVersion}] - ${year}-${month}-${day}`;

  if (!preConfirm && !(await utils.confirmRelease(newVersion))) {
    // Abort release.
    return;
  }

  try {
    log.info(
      `To push the commit and tag manually, use: ${chalk.bold.blue(
        utils.pushCommand(tagText, noTag)
      )}`
    );
    !checkPreRelease && (await utils.preRelease());
    await utils.bump(newVersion);
    if (shouldUpdateChangelog(normalizedReleaseType, tagName)) {
      utils.updateChangelog(changelogVersion);
    }
    !pushAutomatic && (await utils.add());
    !noTag && (await utils.tag(tagText));
    !pushAutomatic && (await utils.commit(tagText, releaseType));
    !pushAutomatic && (await utils.push(tagText, noTag));
    !automaticDeploy && (await utils.postRelease());

    if (pushAutomatic && automaticDeploy) {
      log.info(
        `you can push all changes with:git push && git push origin ${tagText}`
      );
    }
  } catch (e) {
    log.error(`Failed to release \n${e}`);
  }
};
