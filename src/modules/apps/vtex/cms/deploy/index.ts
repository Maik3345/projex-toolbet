import { VTEX_CMS_DEFAULT_SITE } from '@shared';
import { DeployUtils } from './utils';

/**
 * Deploys a VTEX CMS extension by preparing and uploading the necessary files.
 *
 * @param extension - The name of the extension to deploy, or `undefined` to deploy all extensions.
 * @param options - Deployment options.
 * @param options.y - Optional flag to auto-confirm prompts.
 * @param options.yes - Flag to auto-confirm prompts.
 * @param site - The VTEX CMS site identifier. Defaults to `VTEX_CMS_DEFAULT_SITE`.
 * @returns A promise that resolves when the deployment process is complete.
 */
export const deploy = async (
  extension: string | undefined,
  options: {
    y?: boolean;
    yes: boolean;
  },
  site = VTEX_CMS_DEFAULT_SITE,
) => {
  const preConfirm = options.y || options.yes;
  const deployUtils = new DeployUtils(site, preConfirm);
  const files = await deployUtils.getFilesToUpload(extension, preConfirm);
  await deployUtils.getLocalInformation();
  // 4 Browse the files and use the endpoint
  deployUtils.prepare(files);
};
