import { log, VersionFileUtils } from '@shared';

/**
 * Executes a specified script using the VTEX environment.
 *
 * If no script is provided, logs an error message and exits early.
 * Otherwise, attempts to find and run the given script, logging the process.
 *
 * @param script - The name of the script to execute. If undefined, no action is taken.
 * @returns A promise that resolves when the script execution process completes.
 */
export const vtexRunScript = async function (script: string | undefined) {
  if (script === undefined) {
    log.error('❌ No script command provided. Please specify a script to run.');
    log.info('💡 Tip: Example usage: projex vtex run-script "build"');
    return;
  }

  const { runFindScript } = new VersionFileUtils();

  runFindScript(script, 'running script');
};
