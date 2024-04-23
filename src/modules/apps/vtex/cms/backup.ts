import { Commands, Endpoints, getAccountName, log, runOnlyCommand } from '@shared';
import axios from 'axios';
const ora = require('ora');
var fs = require('fs');

// variable indicating where files are found to employees
let directory: string = '';

export const backup = async (site: string | undefined) => {
  if (!site) {
    log.error('You must specify the site to make the backup');
    process.exit(1);
  }

  const spinner = ora('Creating backup files').start();
  // Selected the current directory to create the backup folder
  directory = process.cwd() + '/';
  // I create the backup directory
  spinner.text = 'Creating directory for make the backup';
  await createDirectory(directory);
  // 3 Get the vtex and account tocket. put together the url to be used
  spinner.text = 'Obtaining the token and the account to use \n';
  const token = await runOnlyCommand(Commands.GET_TOKEN);
  const userInfo = await runOnlyCommand(Commands.GET_ACCOUNT);
  const account = getAccountName(userInfo);
  log.debug(`Use the account ${account}`);

  const url = Endpoints.GET_DIRECTORY_FILES(account.replace(/\s/g, ''), site);
  // I get the files that are in the vtex cms files
  spinner.text = 'Obtaining the current directories on vtex';
  const allDirectories = await getDirectoryFiles({
    token: token.replace(/\s/g, ''),
    url,
  });
  log.verbose('All directories found in vtex');
  log.verbose(allDirectories);
  if (allDirectories.length) {
    const filterDirectory = allDirectories.filter((item) => {
      if ((!item.endsWith('.map') && item.endsWith('.css')) || item.endsWith('.js')) return item;
    });
    log.verbose(
      'We removed all the directories that cannot be downloaded, Only download files with the extensión .css and js',
    );
    log.verbose(filterDirectory);
    await downloadFiles(filterDirectory, account.replace(/\s/g, ''));
    spinner.succeed();
  } else log.error('No files found');
};

const downloadFiles = async (directories: string[], account: string) => {
  const spinner = ora('Creating backup files').start();

  const response = directories.map(async (item) => {
    const urlGetFiles = Endpoints.GET_CONTENT_FILES(account, item);
    spinner.text = `Downloading ${item}`;

    const request = await axios({
      method: 'GET',
      url: urlGetFiles,
      responseType: 'stream',
    });
    if (request.data) {
      request.data.pipe(fs.createWriteStream('./backup/' + item));
    } else {
      log.error(`Error on download the file ${item} with the url ${urlGetFiles}`);
    }
  });

  return Promise.all(response).then((response) => {
    spinner.text = `Finished`;
    spinner.succeed();
    return response;
  });
};

const createDirectory = async (directory: string) => {
  const existDirectory = await fs.existsSync(directory + 'backup');
  if (!existDirectory) {
    fs.mkdirSync(directory + 'backup');
    return true;
  } else {
    return false;
  }
};

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
