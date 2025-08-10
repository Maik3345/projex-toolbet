import { resolve } from 'path';
import { log } from '../logger';
import { ContentManifest } from '../models';
const fs = require('fs');
const path = require('path');

let manifests: Array<ContentManifest> = [];

// Método que retorna los archivos en el directorio actual
export const getFilesInCurrentDirectory = (srcpath: string): Promise<Array<string>> => {
  return fs.readdirSync(srcpath).map((file: any) => path.join(srcpath, file));
};

// Método que retorna un array con los directorios encontrados

// Método que permite traer el contenido de todos los directorios indicados
export const getManifestsContent = async (files: Array<string>): Promise<Array<ContentManifest>> => {
  await files.forEach(async (file: any) => {
    await getInformation(resolve(file));
  });

  return manifests;
};

// Método que permite traer el contenido de un solo directorio
export const getManifestContent = async (directory: string): Promise<ContentManifest> => {
  await getInformation(resolve(directory));
  return manifests[0];
};

// Metodo que trae el contenido de un directorio indicado
export const getInformation = async (dir: string) => {
  try {
    if (fs.existsSync(`${dir}/manifest.json`)) {
      let result = await JSON.parse(fs.readFileSync(`${dir}/manifest.json`, 'utf8'));

      if (result) {
        result.path = dir;
        manifests.push(result);
      }
    } else {
      log.debug(`manifest.json not found in directory: ${dir}`);
    }
  } catch {
    log.debug(`Error reading the manifest file in directory: ${dir}. Please check the file content.`);
  }
};
