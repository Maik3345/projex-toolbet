import { Colors } from '@api';
import { Commands, DirectoryUtils, Endpoints, IFile, PromptsUtils, getAccountName, log, runOnlyCommand } from '@shared';
import axios from 'axios';
const ora = require('ora');
const fs = require('fs');

export class DeployUtils {
  private directoryUtils = new DirectoryUtils();
  private promptUtils = new PromptsUtils();

  private token: string;
  private account: string;
  private userInfo: string;
  private site: string;
  private preConfirm: boolean;

  constructor(site: string, preConfirm: boolean) {
    this.site = site;
    this.preConfirm = preConfirm;
    this.token = '';
    this.account = '';
    this.userInfo = '';
  }

  public getLocalInformation = async () => {
    // 3 Get the vtex and account tocket. put together the url to be used
    this.token = await runOnlyCommand(Commands.GET_TOKEN);
    this.userInfo = await runOnlyCommand(Commands.GET_ACCOUNT);
    this.account = getAccountName(this.userInfo);
    log.debug(`Use the account  ${Colors.COMMAND_OR_RELEASE_REF(this.account)}`);
  };

  public prepare = async (files: IFile[]) => {
    !this.preConfirm &&
      (await this.promptUtils.continuePrompt(
        `You are about to upload the files in the account ${this.account} with de site configuration ${this.site}. Do you want to continue?`,
      ));

    const spinner = ora('Uploading files start').start();
    const results = files.map(async (item) => {
      const url = Endpoints.UPLOAD_FILE(this.account.replace(/\s/g, ''), item.name, this.site);
      const data = await fs.readFileSync(item.path, 'utf8');
      spinner.text = `Uploading ${item.name}`;
      await this.uploadFile({
        data,
        url,
        token: this.token.replace(/\s/g, ''),
        name: item.name,
      });
    });

    Promise.all(results).then(() => {
      log.info('Charge finished');
      spinner.stop();
    });
  };

  public getFilesToUpload = async (extension: string | undefined, preConfirm: boolean) => {
    // 1 Get the files from the current directory.
    let files = await this.directoryUtils.getFilesInDirectory(extension);

    if (!files.length) {
      log.info('No files found');
      throw new Error('No files found');
    }

    // 2 Select the files to use
    if (!preConfirm) {
      const selected = await this.directoryUtils.promptSelectElements(Object.assign([], files));
      files = await this.directoryUtils.getSelectedElements(files, selected);
    }

    log.info(
      'Files to upload:',
      files.map((item) => item.name),
    );

    return files;
  };

  /* The `uploadFile` function is a method of the `DeployUtils` class. It takes in an object with
  properties `token`, `url`, `data`, and `name`, all of which are of type `string`. */
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
