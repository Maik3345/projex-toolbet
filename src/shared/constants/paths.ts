import { CLI_NAME } from '@shared';
import { homedir } from 'os';
import { join } from 'path';

export class PathConstants {
  private static readonly PCO_FOLDER = join(homedir(), `.${CLI_NAME}`);

  public static readonly PRETASKS_FOLDER = join(PathConstants.PCO_FOLDER, 'pretasks');
  public static readonly TELEMETRY_FOLDER = join(PathConstants.PCO_FOLDER, 'telemetry');
  public static readonly LOGS_FOLDER = join(PathConstants.PCO_FOLDER, 'logs');
  public static readonly SESSION_FOLDER = join(PathConstants.PCO_FOLDER, 'session');
}

export const PC_FOLDER = join(homedir(), `.${CLI_NAME}`);
export const LOGS_FOLDER = join(PC_FOLDER, 'logs');
