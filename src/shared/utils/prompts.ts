import * as inquirer from "inquirer";
import { prop } from "ramda";
import { log } from "../logger";

export class PromptsUtils {
  /* The `continuePrompt` function is a method of the `PromptsUtils` class. It takes a `message`
  parameter of type string. */
  continuePrompt = async (message: string) => {
    const promt: any = await inquirer.prompt({
      name: "proceed",
      message,
      type: "confirm",
    });
    const proceed = prop("proceed", promt);

    if (!proceed) {
      log.info("Process finished");
      process.exit();
    }
  };
}
