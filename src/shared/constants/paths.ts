import { homedir } from "os";
import { join } from "path";
const os_1 = require("os");
const path_1 = require("path");

export class PathConstants {
  private static readonly PCO_FOLDER = join(homedir(), ".puntoscolombia");

  public static readonly PRETASKS_FOLDER = join(
    PathConstants.PCO_FOLDER,
    "pretasks"
  );
  public static readonly TELEMETRY_FOLDER = join(
    PathConstants.PCO_FOLDER,
    "telemetry"
  );
  public static readonly LOGS_FOLDER = join(PathConstants.PCO_FOLDER, "logs");
  public static readonly SESSION_FOLDER = join(
    PathConstants.PCO_FOLDER,
    "session"
  );
}

export const PC_FOLDER = path_1.join(os_1.homedir(), ".puntoscolombia");
export const LOGS_FOLDER = path_1.join(PC_FOLDER, "logs");
