import { Colors } from '@api';
import { existsSync } from 'fs';
import { log } from '../logger';
const fs = require('fs/promises');

export class FilesUtils {
  createFile = async (dir: string, content: string) => {
    try {
      if (!existsSync(dir)) {
        await fs.writeFile(dir, content);
        log.info(`File ${Colors.ID(dir.split('/').pop() ?? '')} created successfully.`);
      } else {
        log.info(`File ${Colors.ID(dir.split('/').pop() ?? '')} already exists.`);
      }
    } catch (err) {
      log.error('An error occurred while creating the file:', err);
    }
  };

  createDirectory = async (dir: string) => {
    try {
      if (!existsSync(dir)) {
        await fs.mkdir(dir);
        log.info(`Directory ${Colors.ID(dir.split('/').pop() ?? '')} created.`);
        return true;
      } else {
        log.info(`Directory ${Colors.ID(dir.split('/').pop() ?? '')} already exists.`);
        return false;
      }
    } catch (error) {
      log.error('An error occurred while creating the directory:', error);
    }
  };
}
