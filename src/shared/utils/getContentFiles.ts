import fs from 'fs';
import { join, resolve } from 'path';
import { log } from '../logger';
import { ContentManifest } from '../models';

/**
 * An array that stores content manifest objects.
 *
 * @remarks
 * Each element in the array represents a content manifest, which may include metadata
 * and configuration details for content files used within the application.
 *
 * @type {Array<ContentManifest>}
 */
let manifests: Array<ContentManifest> = [];

/**
 * Retrieves the list of file paths in the specified directory.
 *
 * @param srcpath - The path to the directory whose files should be listed.
 * @returns A promise that resolves to an array of absolute file paths in the given directory.
 */
export const getFilesInCurrentDirectory = async (srcpath: string): Promise<Array<string>> => {
  return fs.readdirSync(srcpath).map((file: any) => join(srcpath, file));
};

/**
 * Asynchronously processes an array of file paths to retrieve their content manifests.
 *
 * @param files - An array of file paths to process.
 * @returns A promise that resolves to an array of `ContentManifest` objects.
 */
export const getManifestsContent = async (files: Array<string>): Promise<Array<ContentManifest>> => {
  for (const file of files) {
    await getInformation(resolve(file));
  }

  return manifests;
};

/**
 * Asynchronously retrieves the content manifest from the specified directory.
 *
 * @param directory - The path to the directory containing the content files.
 * @returns A promise that resolves to the first `ContentManifest` found in the directory.
 */
export const getManifestContent = async (directory: string): Promise<ContentManifest> => {
  await getInformation(resolve(directory));
  return manifests[0];
};

/**
 * Asynchronously reads the `manifest.json` file from the specified directory, parses its content,
 * and adds the resulting object to the `manifests` array with an additional `path` property.
 * If the manifest file does not exist, logs a warning and a tip.
 * If an error occurs during reading or parsing, logs an error and a tip.
 *
 * @param dir - The directory path where the `manifest.json` file is expected to be located.
 * @returns A promise that resolves when the operation is complete.
 */
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
