import { log, VersionFileUtils } from '@shared';

export const vtexRunScript = async function (script: string | undefined) {
  if (script === undefined) {
    return log.error('no script to execute');
  }

  const { runFindScript } = new VersionFileUtils();

  runFindScript(script, 'running script');
};
