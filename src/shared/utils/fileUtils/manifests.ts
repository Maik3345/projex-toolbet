import fs from 'fs';
import { join, resolve } from 'path';
import { log } from '../../logger';
import { ContentManifest } from '../../models';

let manifests: Array<ContentManifest> = [];

export const getFilesInCurrentDirectory = async (srcpath: string): Promise<Array<string>> => {
  return fs.readdirSync(srcpath).map((file: any) => join(srcpath, file));
};

export const getManifestsContent = async (files: Array<string>): Promise<Array<ContentManifest>> => {
  for (const file of files) {
    await getInformation(resolve(file));
  }

  return manifests;
};

export const getManifestContent = async (directory: string): Promise<ContentManifest> => {
  await getInformation(resolve(directory));
  return manifests[0];
};

export const getInformation = async (dir: string) => {
  try {
    if (fs.existsSync(`${dir}/manifest.json`)) {
      let result = await JSON.parse(fs.readFileSync(`${dir}/manifest.json`, 'utf8'));

      if (result) {
        result.path = dir;
        manifests.push(result);
      }
    } else {
      log.debug(`⚠️ manifest.json not found in directory: ${dir}`);
      log.info('💡 Tip: Make sure each directory contains a manifest.json file.');
    }
  } catch {
    log.debug(`❌ Error reading the manifest file in directory: ${dir}. Please check the file content.`);
    log.info('💡 Tip: Ensure the manifest.json is valid JSON and readable.');
  }
};
