import { VTEX_CMS_DEFAULT_SITE } from '@shared';
import { DeployUtils } from './utils';

export const deploy = async (
  extension: string | undefined,
  site = VTEX_CMS_DEFAULT_SITE,
  options: {
    y?: boolean;
    yes: boolean;
  },
) => {
  const preConfirm = options.y || options.yes;
  const deployUtils = new DeployUtils(site, preConfirm);
  const files = await deployUtils.getFilesToUpload(extension, preConfirm);
  await deployUtils.getLocalInformation();
  // 4 Browse the files and use the endpoint
  deployUtils.prepare(files);
};
