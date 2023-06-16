import {
  log,
  getFilesInDirectory,
  selectFiles,
  runOnlyCommand,
  IFile,
  DEFAULT_SITE_TO_UPLOAD,
  Commands,
  getAccountName,
} from "../../../../shared";
import * as inquirer from "inquirer";
import axios from "axios";
const fs = require("fs");
import ora from "ora";
import { prop } from "ramda";
import { Endpoints } from "../../../../shared/constants/endpoints";

// variable indicating where files are found to employees
let directory: string = "";

export default async (
  extension: string,
  site = DEFAULT_SITE_TO_UPLOAD,
  options
) => {
  const preConfirm = options.y || options.yes;
  log.info("settings", { extension, site });
  // I indicate which command is going to be executed and which directory is going to be used
  directory = process.cwd() + "/";
  // 1 Get the files from the current directory.
  let files: IFile[] = await getFilesInDirectory(directory, extension);
  // 2 Select the files to use
  if (files.length) {
    let toUpload: IFile[] = [];

    if (!preConfirm) {
      const selected = await selectFiles(Object.assign([], files));
      toUpload = await getSelected(files, selected);
    } else {
      log.info(
        "All files will be uploaded",
        files.map((item) => item.name)
      );
      toUpload = files;
    }

    // 4 Browse the files and use the endpoint
    prepare(toUpload, site, preConfirm);
  }
};

// Filter the original array with the string array and get only the element selected
const getSelected = (files: IFile[], selected: string[]) => {
  let toUpload: IFile[] = [];
  files.map((item) => {
    selected.map((sItem) => {
      if (item.name == sItem) {
        toUpload.push(item);
      }
    });
  });
  return toUpload;
};

export const prepare = async (
  files: IFile[],
  site: string,
  preConfirm: boolean
) => {
  // 3 Get the vtex and account tocket. put together the url to be used
  const token = await runOnlyCommand(Commands.GET_TOKEN);
  const userInfo = await runOnlyCommand(Commands.GET_ACCOUNT);
  const account = getAccountName(userInfo);
  log.debug(`Use the account ${account}`);
  !preConfirm && (await promptContinue(account, site));

  const spinner = ora("Uploading files start").start();
  const results = files.map(async (item) => {
    const url = Endpoints.UPLOAD_FILE(
      account.replace(/\s/g, ""),
      item.name,
      site
    );
    const data = await fs.readFileSync(item.path, "utf8");
    spinner.text = `Uploading ${item.name}`;
    await uploadFile({
      data,
      url,
      token: token.replace(/\s/g, ""),
      name: item.name,
    });
  });

  Promise.all(results).then(() => {
    log.info("Charge finished");
    spinner.stop();
  });
};

export const uploadFile = ({
  token,
  url,
  data,
  name,
}: {
  token: string;
  url: string;
  data: string;
  name: string;
}) => {
  const cookie = String(`VtexIdclientAutCookie=${token}`);
  return axios({
    method: "put",
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

const promptContinue = async (account: string, site: string) => {
  const promt: any = await inquirer.prompt({
    name: "proceed",
    message: `You are about to upload the files in the account ${account} with de site configuration ${site}. Do you want to continue?`,
    type: "confirm",
  });
  const proceed = prop("proceed", promt);

  if (!proceed) {
    log.info("Process finished");
    process.exit();
  }
};
