import { CLI_NAME } from '@shared';
import { homedir } from 'os';
import { join } from 'path';

export class PathConstants {
  private static readonly PROJECT_FOLDER = join(homedir(), `.${CLI_NAME}`);

  public static readonly PRETASKS_FOLDER = join(PathConstants.PROJECT_FOLDER, 'pretasks');
  public static readonly TELEMETRY_FOLDER = join(PathConstants.PROJECT_FOLDER, 'telemetry');
  public static readonly LOGS_FOLDER = join(PathConstants.PROJECT_FOLDER, 'logs');
  public static readonly SESSION_FOLDER = join(PathConstants.PROJECT_FOLDER, 'session');
}

export const LOGS_FOLDER = join(homedir(), `.${CLI_NAME}`, 'logs');
