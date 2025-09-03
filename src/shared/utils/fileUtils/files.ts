import { Colors } from '@api';
import { existsSync } from 'fs';
import fs from 'fs/promises';
import { log } from '../../logger';

export class FilesUtils {
  createFile = async (dir: string, content: string) => {
    try {
      if (!existsSync(dir)) {
        await fs.writeFile(dir, content);
        log.info(`${Colors.GREEN('✅ File created:')} ${Colors.GREEN(dir.split('/').pop() ?? '')}`);
      } else {
        log.info(`${Colors.YELLOW('⚠️ File already exists:')} ${Colors.GREEN(dir.split('/').pop() ?? '')}`);
      }
    } catch (err) {
      log.error(`${Colors.ERROR('❌ Failed to create file:')} ${dir}`);
      log.info(Colors.YELLOW('💡 Tip: Check file permissions and disk space.'));
      log.error(err);
    }
  };

  createDirectory = async (dir: string) => {
    try {
      if (!existsSync(dir)) {
        await fs.mkdir(dir);
        log.info(`${Colors.GREEN('✅ Directory created:')} ${Colors.GREEN(dir.split('/').pop() ?? '')}`);
        return true;
      } else {
        log.info(`${Colors.YELLOW('⚠️ Directory already exists:')} ${Colors.GREEN(dir.split('/').pop() ?? '')}`);
        return false;
      }
    } catch (error) {
      log.error(`${Colors.ERROR('❌ Failed to create directory:')} ${dir}`);
      log.info(Colors.YELLOW('💡 Tip: Check directory permissions and disk space.'));
      log.error(error);
    }
  };
}
