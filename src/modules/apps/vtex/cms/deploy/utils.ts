import { Colors } from '@api';
import {
  Commands,
  DirectoryUtils,
  Endpoints,
  IFile,
  PromptsUtils,
  log,
  extractAccountName,
  runOnlyCommand,
} from '@shared';
import axios from 'axios';
import fs from 'fs';

/**
 * Utility class for handling deployment operations in the VTEX CMS context.
 *
 * The `DeployUtils` class provides methods to:
 * - Retrieve local VTEX account and token information.
 * - Prepare and upload files to a specified VTEX site, with optional user confirmation.
 * - Select files from the local directory for upload, with interactive prompts if required.
 * - Upload individual files to the VTEX CMS using authenticated HTTP requests.
 *
 * @remarks
 * This class depends on several utility classes (`DirectoryUtils`, `PromptsUtils`) and external modules
 * such as `axios` for HTTP requests and `fs` for file system operations.
 *
 * @example
 * ```typescript
 * const deployUtils = new DeployUtils('mysite', false);
 * await deployUtils.getLocalInformation();
 * const files = await deployUtils.getFilesToUpload('.json', false);
 * await deployUtils.prepare(files);
 * ```
 *
 * @public
 */
export class DeployUtils {
  private readonly directoryUtils = new DirectoryUtils();
  private readonly promptUtils = new PromptsUtils();

  private token: string;
  private account: string;
  private userInfo: string;
  private readonly site: string;
  private readonly preConfirm: boolean;

  constructor(site: string, preConfirm: boolean) {
    this.site = site;
    this.preConfirm = preConfirm;
    this.token = '';
    this.account = '';
    this.userInfo = '';
  }

  /**
   * Retrieves and sets local VTEX account information and authentication token.
   *
   * This method performs the following actions:
   * 1. Obtains an authentication token using the `GET_TOKEN` command.
   * 2. Retrieves user account information using the `GET_ACCOUNT` command.
   * 3. Extracts and sets the account name from the user information.
   * 4. Logs the account name for debugging purposes.
   *
   * @returns {Promise<void>} A promise that resolves when the local information has been retrieved and set.
   */
  public getLocalInformation = async () => {
    // 3 Get the vtex and account tocket. put together the url to be used
    this.token = await runOnlyCommand(Commands.GET_TOKEN);
    this.userInfo = await runOnlyCommand(Commands.GET_ACCOUNT);
    const extractedAccount = extractAccountName(this.userInfo);
    if (!extractedAccount) {
      throw new Error('Failed to extract account name from user info');
    }
    this.account = extractedAccount;
    log.debug(`Use the account  ${Colors.PINK(this.account)}`);
  };

  /**
   * Prepares and uploads a list of files to a remote server for the specified account and site configuration.
   *
   * If the `preConfirm` flag is not set, prompts the user for confirmation before proceeding with the upload.
   * For each file, reads its contents and uploads it using the provided upload endpoint and authentication token.
   * Logs the progress and completion of the upload process.
   *
   * @param files - An array of file objects to be uploaded. Each file should conform to the `IFile` interface.
   * @returns A Promise that resolves when all files have been uploaded.
   */
  public prepare = async (files: IFile[]) => {
    !this.preConfirm &&
      (await this.promptUtils.continuePrompt(
        `you are about to upload the files in the account ${Colors.WARNING(
          this.account,
        )} with de site configuration ${Colors.WARNING(this.site)}. Do you want to continue?`,
      ));

    log.info('🚀 Uploading files...');
    const results = files.map(async (item) => {
      const url = Endpoints.UPLOAD_FILE(this.account.replace(/\s/g, ''), item.name, this.site);
      const data = fs.readFileSync(item.path, 'utf8');
      log.info(`⬆️ Uploading the file ${item.name}`);
      await this.uploadFile({
        data,
        url,
        token: this.token.replace(/\s/g, ''),
        name: item.name,
      });
    });

    Promise.all(results).then(() => {
      log.info(`✅ Files uploaded successfully to the account ${this.account}`);
    });
  };

  /**
   * Retrieves a list of files from the current directory, optionally filtered by extension,
   * and allows the user to select which files to upload unless pre-confirmed.
   *
   * @param extension - The file extension to filter files by (e.g., 'js', 'ts'). If undefined, all files are considered.
   * @param preConfirm - If true, skips the file selection prompt and uploads all found files. If false, prompts the user to select files.
   * @returns A promise that resolves to an array of selected file objects to upload.
   * @throws Will throw an error if no files are found in the directory.
   */
  public getFilesToUpload = async (extension: string | undefined, preConfirm: boolean) => {
    // 1 Get the files from the current directory.
    let files = await this.directoryUtils.getFilesInDirectory(extension);

    if (!files.length) {
      log.error(Colors.ERROR('❌ No files found to upload.'));
      log.info('💡 Tip: Make sure your directory contains files with the correct extension.');
      throw new Error('No files found');
    }

    // 2 Select the files to use
    if (!preConfirm) {
      const selected = await this.directoryUtils.promptSelectElements(
        Object.assign([], files),
        'Select the files to upload',
      );
      files = this.directoryUtils.getSelectedElements(files, selected);
    }

    log.info(
      '📦 Files to upload:',
      files.map((item) => item.name),
    );

    return files;
  };

  /**
   * Uploads a file to a specified URL using an HTTP PUT request.
   *
   * @param params - The parameters for the file upload.
   * @param params.token - The authentication token to be sent as a cookie.
   * @param params.url - The destination URL for the file upload.
   * @param params.data - The file content as a string.
   * @param params.name - The name or path of the file to be uploaded.
   * @returns A Promise resolving to the Axios response of the upload request.
   */
  public uploadFile = ({ token, url, data, name }: { token: string; url: string; data: string; name: string }) => {
    const cookie = String(`VtexIdclientAutCookie=${token}`);
    return axios({
      method: 'put',
      url,
      data: {
        path: name,
        text: data,
      },
      headers: {
        Cookie: cookie,
      },
    });
  };
}
