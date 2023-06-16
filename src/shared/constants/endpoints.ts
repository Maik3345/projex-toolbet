const UPLOAD_FILE = (account: string, file: string, site: string) =>
  `https://${account}.myvtex.com/api/portal/pvt/sites/${site}/files/${file}`;
const GET_DIRECTORY_FILES = (account: string, site: string) =>
  `https://${account}.myvtex.com/api/portal/pvt/sites/${site}/files`;
const GET_CONTENT_FILES = (account: string, file: string) =>
  `https://${account}.myvtex.com/files/${file}`;

export const Endpoints = {
  UPLOAD_FILE,
  GET_CONTENT_FILES,
  GET_DIRECTORY_FILES,
};

export const DEFAULT_SITE_TO_UPLOAD = "default";
