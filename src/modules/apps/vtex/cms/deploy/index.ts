import { DEFAULT_SITE_TO_UPLOAD } from "../../../../../shared";
import { DeployUtils } from "./utils";

export const deploy = async (
  extension: string,
  site = DEFAULT_SITE_TO_UPLOAD,
  options
) => {
  const preConfirm = options.y || options.yes;
  const deployUtils = new DeployUtils(site, preConfirm);
  const files = await deployUtils.getFilesToUpload(extension, preConfirm);
  await deployUtils.getLocalInformation();
  // 4 Browse the files and use the endpoint
  deployUtils.prepare(files);
};
