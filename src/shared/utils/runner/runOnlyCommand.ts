import { spawn } from 'child_process';
import { log } from '../../../../src/shared';

export const runOnlyCommand = (command: string): Promise<string> => {
  const task = spawn(`${command}`, [], {
    shell: true,
  });
  return new Promise(function (resolve) {
    task.stdout.on('data', (data: string) => {
      log.debug(data.toString());
      resolve(data.toString());
    });

    task.stderr.on('data', function (data: string) {
      log.error(`❌ Error running the command: ${command}`);
      log.error(data.toString());
      log.info('💡 Tip: Check the command syntax and your environment variables.');
      process.exit(1);
    });
  });
};
