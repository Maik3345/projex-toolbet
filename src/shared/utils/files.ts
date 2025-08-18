import { Colors } from '@api';
import { existsSync } from 'fs';
import { log } from '../logger';
const fs = require('fs/promises');

export class FilesUtils {
  createFile = async (dir: string, content: string) => {
    try {
      if (!existsSync(dir)) {
        await fs.writeFile(dir, content);
        log.info(`file ${Colors.GREEN(dir.split('/').pop() ?? '')} created successfully.`);
      } else {
        log.info(`file ${Colors.GREEN(dir.split('/').pop() ?? '')} already exists.`);
      }
    } catch (err) {
      log.error(Colors.ERROR('Failed to create file: ') + dir);
      log.error(Colors.WARNING('Tip: Check file permissions and disk space.'));
      log.error(err);
    }
  };

  createDirectory = async (dir: string) => {
    try {
      if (!existsSync(dir)) {
        await fs.mkdir(dir);
        log.info(`directory ${Colors.GREEN(dir.split('/').pop() ?? '')} created.`);
        return true;
      } else {
        log.info(`directory ${Colors.GREEN(dir.split('/').pop() ?? '')} already exists.`);
        return false;
      }
    } catch (error) {
      log.error(Colors.ERROR('Failed to create directory: ') + dir);
      log.error(Colors.WARNING('Tip: Check directory permissions and disk space.'));
      log.error(error);
    }
  };
}
