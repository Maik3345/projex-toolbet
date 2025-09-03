import { Colors } from '@api';
import { Commands, Endpoints, extractAccountName, log, runOnlyCommand } from '@shared';
import axios from 'axios';
import fs from 'fs';

/**
 * The path to the directory used for backup operations.
 *
 * @remarks
 * This variable should be set to the absolute or relative path of the directory
 * where backup files will be stored or retrieved from.
 */
let directory: string = '';

/**
 * Creates a backup of VTEX CMS files for a specified site.
 *
 * This function performs the following steps:
 * 1. Validates that a site name is provided; exits the process if not.
 * 2. Logs the backup process and sets up the backup directory in the current working directory.
 * 3. Obtains the VTEX authentication token and account information.
 * 4. Retrieves the list of files from the VTEX CMS for the specified site.
 * 5. Filters the files to include only `.css` and `.js` files (excluding `.map` files).
 * 6. Downloads the filtered files into the backup directory.
 *
 * @param site - The name of the site to back up. If undefined, the process will exit with an error.
 * @returns A Promise that resolves when the backup process is complete.
 */
export const backup = async (site: string | undefined) => {
  if (!site) {
    log.error(`${Colors.ERROR('❌ You must specify the site to make the backup.')}`);
    log.info(`${Colors.YELLOW('💡 Tip: Use the --site flag or provide a site name as an argument.')}`);
    process.exit(1);
  }

  log.info(`${Colors.BLUE('📦 Backup files from the site')} ${Colors.PINK(site)}`);
  // Selected the current directory to create the backup folder
  directory = process.cwd() + '/';
  // I create the backup directory
  log.info(`${Colors.BLUE('📁 Backup directory:')} ${Colors.PINK(directory + 'backup')}`);
  await createDirectory(directory);
  // 3 Get the vtex and account tocket. put together the url to be used
  log.info(`${Colors.BLUE('🔑 Obtaining the token and the account to use...')}`);
  const token = await runOnlyCommand(Commands.GET_TOKEN);
  const userInfo = await runOnlyCommand(Commands.GET_ACCOUNT);
  const extractedAccount = extractAccountName(userInfo);
  if (!extractedAccount) {
    throw new Error('Failed to extract account name from user info');
  }
  const account = extractedAccount;
  log.debug(`${Colors.BLUE('👤 Using VTEX account:')} ${Colors.PINK(account)}`);

  const url = Endpoints.GET_DIRECTORY_FILES(account.replace(/\s/g, ''), site);
  // I get the files that are in the vtex cms files
  log.info(`${Colors.BLUE('📂 Obtaining the current directories on VTEX...')}`);
  const allDirectories = await getDirectoryFiles({
    token: token.replace(/\s/g, ''),
    url,
  });
  log.verbose(`${Colors.BLUE('🔍 All directories found in VTEX:')}`);
  log.verbose(allDirectories);
  if (allDirectories.length) {
    const filterDirectory = allDirectories.filter((item) => {
      if ((!item.endsWith('.map') && item.endsWith('.css')) || item.endsWith('.js')) return item;
    });
    log.verbose(
      `${Colors.BLUE('🧹 Filtered out non-downloadable directories. Only .css and .js files will be downloaded.')}`,
    );
    log.verbose(filterDirectory);
    await downloadFiles(filterDirectory, account.replace(/\s/g, ''));
  } else {
    log.error(`${Colors.ERROR('❌ No files found to backup.')}`);
    log.info(
      `${Colors.YELLOW('💡 Tip: Make sure the site name is correct and the VTEX account has files to backup.')}`,
    );
  }
};

/**
 * Downloads files from the specified directories for a given VTEX account.
 *
 * For each directory in the provided list, this function constructs a download URL,
 * fetches the file as a stream, and saves it to the local `./backup/` directory.
 * Logs progress and errors during the download process.
 *
 * @param directories - An array of directory paths (relative or absolute) to download files from.
 * @param account - The VTEX account identifier used to build the download URLs.
 * @returns A promise that resolves when all files have been downloaded.
 */
const downloadFiles = async (directories: string[], account: string) => {
  log.info(`${Colors.BLUE('⬇️ Downloading files...')}`);

  const response = directories.map(async (item) => {
    const urlGetFiles = Endpoints.GET_CONTENT_FILES(account, item);
    log.info(`${Colors.BLUE('📥 Downloading file:')} ${Colors.PINK(item)}`);

    const request = await axios({
      method: 'GET',
      url: urlGetFiles,
      responseType: 'stream',
    });
    if (request.data) {
      request.data.pipe(fs.createWriteStream('./backup/' + item));
    } else {
      log.error(Colors.ERROR(`❌ Error downloading file ${item} from URL: ${urlGetFiles}`));
      log.info(Colors.YELLOW('💡 Tip: Check your network connection and VTEX permissions.'));
    }
  });

  return Promise.all(response).then((response) => {
    log.info(Colors.GREEN('✅ All files downloaded successfully!'));
    return response;
  });
};

/**
 * Creates a 'backup' directory at the specified path if it does not already exist.
 *
 * @param directory - The base directory path where the 'backup' folder should be created.
 * @returns A promise that resolves to `true` if the directory was created, or `false` if it already existed.
 */
const createDirectory = async (directory: string) => {
  const existDirectory = fs.existsSync(directory + 'backup');
  if (!existDirectory) {
    fs.mkdirSync(directory + 'backup');
    return true;
  } else {
    return false;
  }
};

/**
 * Retrieves a list of files from a specified directory URL using a VTEX authentication token.
 *
 * @param params - An object containing the following properties:
 * @param params.token - The VTEX authentication token used for authorization.
 * @param params.url - The URL of the directory to fetch files from.
 * @returns A promise that resolves to an array of file names (strings) if the request is successful, or an empty array otherwise.
 */
export const getDirectoryFiles = async ({ token, url }: { token: string; url: string }) => {
  const cookie = String(`VtexIdclientAutCookie=${token}`);

  const response = await axios({
    method: 'get',
    url,
    headers: {
      Cookie: cookie,
    },
  });

  if (response.status == 200) {
    const directory: string[] = response.data;
    return directory;
  } else {
    return [];
  }
};
