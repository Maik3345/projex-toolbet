import { DirectoryUtils } from "../../../../../../shared";
import { SetupDevopsTemplatesUtils } from "./utils";
export const setupDevopsTemplates = async (options: {
  l?: boolean;
  list?: boolean;
}) => {
  const list = options.l !== undefined ? options.l : options.list;
  const utils = new SetupDevopsTemplatesUtils();
  const directory = await new DirectoryUtils(list);
  const folders = await directory.getFolders();
  await directory.runCommandInFolders(
    folders,
    utils.setupDevopsTemplates.bind(utils)
  );
};
