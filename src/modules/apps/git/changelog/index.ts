import { log } from "../../../../shared";
import { ChangelogUtils } from "./changelog";

export const changelogUpdate = async (
  changeLogReleaseType = "Changed",
  changelogContent = ""
) => {
  const changelogUtils = new ChangelogUtils(
    changeLogReleaseType,
    changelogContent
  );

  try {
    await changelogUtils.writeGitLogCommits();
  } catch (e) {
    log.error(`Failed to update changelog file \n${e}`);
  }
};
