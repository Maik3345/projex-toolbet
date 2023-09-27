import { existsSync } from "fs";
import { ColorifyConstants } from "../../api";
import { log } from "../logger";
const fs = require("fs/promises");

export class FilesUtils {
  createFile = async (dir: string, content: string) => {
    try {
      if (!existsSync(dir)) {
        await fs.writeFile(dir, content);
        log.info(`file ${ColorifyConstants.ID(dir.split("/").pop())} created`);
      } else {
        log.info(
          `file ${ColorifyConstants.ID(dir.split("/").pop())} already exists`
        );
      }
    } catch (err) {
      log.error("error on create the file:", err);
    }
  };

  createDirectory = async (dir: string) => {
    try {
      if (!existsSync(dir)) {
        await fs.mkdir(dir);
        log.info(
          `directory ${ColorifyConstants.ID(dir.split("/").pop())} created`
        );
        return true;
      } else {
        log.info(
          `directory ${ColorifyConstants.ID(
            dir.split("/").pop()
          )} already exists`
        );
        return false;
      }
    } catch (error) {
      log.error("error on create the directory:", error);
    }
  };
}
