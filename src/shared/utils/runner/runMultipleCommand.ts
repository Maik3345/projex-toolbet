import { log } from '../../../shared/logger';
import { spawn } from 'child_process';

export const runMultipleCommand = (command: string, errors?: Array<string>): Promise<string> => {
  const task = spawn(`${command}`, [], {
    shell: true,
  });
  return new Promise(function (resolve) {
    task.stdout.on('data', (data: string) => {
      log.info(`ℹ️ ${data.toString()}`);
    });

    task.on('exit', () => {
      resolve('exit');
    });

    task.stderr.on('data', (data: string) => {
      log.warn(`⚠️ ${data.toString()}`);

      if (errors) {
        errors.forEach((item: string) => {
          if (data.toString().includes(item)) {
            log.error('❌ Critical error detected.');
            log.info('💡 Tip: Review the error message above and check your command or environment.');
            process.exit(1);
          }
        });
      }
    });
  });
};
