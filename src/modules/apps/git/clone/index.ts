import { ColorifyConstants } from "../../../../api";
import { log } from "../../../../shared";
import { CloneUtils } from "./utils";

export const clone = async (repositoryUrl: string, repositoryList: string) => {
  const utils = new CloneUtils(repositoryUrl);

  const clone = repositoryList.split(",").map(async (repository) => {
    const name = repository.replace(/\s/g, "");
    const exist = await utils.checkDirectory(name);

    if (!exist) {
      await utils.cloneRepository(name);
    } else {
      log.info(
        `The repository ${ColorifyConstants.COMMAND_OR_RELEASE_REF(
          name
        )} already exists`
      );
    }
  });

  await Promise.all(clone);
};
