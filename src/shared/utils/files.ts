import { Colors } from '@api';
import { existsSync } from 'fs';
import fs from 'fs/promises';
import { log } from '../logger';

/**
 * Utility class for file and directory operations.
 *
 * Provides asynchronous methods to create files and directories,
 * with logging for success, warnings, and errors.
 *
 * @example
 * const utils = new FilesUtils();
 * await utils.createFile('/path/to/file.txt', 'Hello, world!');
 * await utils.createDirectory('/path/to/directory');
 */
export class FilesUtils {
  /**
   * Asynchronously creates a file with the specified content at the given path if it does not already exist.
   *
   * @param dir - The path where the file should be created.
   * @param content - The content to write into the file.
   * @returns A promise that resolves when the file is created or already exists.
   *
   * @remarks
   * - If the file already exists at the specified path, no action is taken and a warning is logged.
   * - Logs informative messages for success, warnings, and errors.
   * - In case of an error, logs the error and provides a tip to check file permissions and disk space.
   */
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

  /**
   * Asynchronously creates a directory if it does not already exist.
   *
   * If the directory is created successfully, logs a success message and returns `true`.
   * If the directory already exists, logs a warning message and returns `false`.
   * If an error occurs during creation, logs an error message and a helpful tip.
   *
   * @param dir - The path of the directory to create.
   * @returns A promise that resolves to `true` if the directory was created, `false` if it already exists, or `undefined` if an error occurred.
   */
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
