import help from "@oclif/plugin-help";
import os from "os";

import * as Config from "@oclif/config";
import { error } from "@oclif/errors";
import { sortBy, uniqBy } from "ramda";
import * as pkg from "../../../package.json";
import log from "../../api/logger";
import { FeatureFlag } from "../../modules/featureFlag";
import { updateNotify } from "../../update";
import { CommandI, getHelpSubject, renderCommands } from "./utils";

let loginPending = false;

const logToolbeltVersion = () => {
  log.debug(`Toolbelt version: ${pkg.version}`);
};

const main = async () => {
  // Show update notification if newer version is available
  updateNotify();

  const args = process.argv.slice(2);

  logToolbeltVersion();
  log.debug("node %s - %s %s", process.version, os.platform(), os.release());
  log.debug(args);
};

export const onError = async (e: any) => {
  const status = e?.response?.status;
  const statusText = e?.response?.statusText;
  const headers = e?.response?.headers;
  const data = e?.response?.data;
  const code = e?.code || null;

  if (headers) {
    log.debug("Failed request headers:", headers);
  }

  if (status === 401) {
    if (!loginPending) {
      log.error("There was an authentication error. Please login again");
      // Try to login and re-issue the command.
      loginPending = true;
    }
    return; // Prevent multiple login attempts
  }

  if (status) {
    if (status >= 400) {
      const message = data ? data.message : null;
      const source = e.config.url;
      log.error("API:", status, statusText);
      log.error("Source:", source);
      if (e.config?.method) {
        log.error("Method:", e.config.method);
      }

      if (message) {
        log.error("Message:", message);
        log.debug("Raw error:", data);
      } else {
        log.error("Raw error:", {
          data,
          source,
        });
      }
    } else {
      log.error("Oops! There was an unexpected error:");
      log.error(e.read ? e.read().toString("utf8") : data);
    }
  } else if (code) {
    switch (code) {
      case "ENOTFOUND":
        log.error("Connection failure :(");
        log.error("Please check your internet");
        break;
      case "EAI_AGAIN":
        log.error("A temporary failure in name resolution occurred :(");
        break;
      default:
        log.error("Unhandled exception");
        log.error("Please report the issue");
        if (e.config?.url && e.config?.method) {
          log.error(`${e.config.method} ${e.config.url}`);
        }
        log.debug(e);
    }
  } else {
    log.error("Unhandled exception");
    log.error("Please report the issue");
    log.error("Raw error: ", e);
  }

  process.removeListener("unhandledRejection", onError);

  process.exit(1);
};

export default async function () {
  // overwrite Help#showCommandHelp to customize help formating
  help.prototype.showHelp = function showHelp(_argv: string[]) {
    const sortedTopics = () => {
      let { topics } = this.config;

      topics = topics.filter((t) => this.opts.all || !t.hidden);
      topics = sortBy((t: any) => t.name, topics);
      topics = uniqBy((t: any) => t.name, topics);
      return topics;
    };

    const showTopicHelp = (topic: Config.Topic) => {
      const { name } = topic;
      const depth = name.split(":").length;
      const subTopics = sortedTopics().filter(
        (t) =>
          t.name.startsWith(name + ":") &&
          t.name.split(":").length === depth + 1
      );

      console.log(this.topic(topic));
      if (subTopics.length > 0) {
        console.log(this.topics(subTopics));
        console.log("");
      }
    };

    const showCommandHelp = (command: Config.Command) => {
      const name = command.id;
      const depth = name.split(":").length;

      const subTopics = sortedTopics().filter(
        (t) =>
          t.name.startsWith(name + ":") &&
          t.name.split(":").length === depth + 1
      );

      const title =
        command.description && this.render(command.description).split("\n")[0];
      if (title) console.log(`${title}\n`);
      console.log(this.command(command));
      console.log("");

      if (subTopics.length > 0) {
        console.log(this.topics(subTopics));
        console.log("");
      }
    };

    const subject = getHelpSubject(_argv);
    if (subject) {
      const command = this.config.findCommand(subject);
      if (command) {
        showCommandHelp(command);
        return;
      }

      const topic = this.config.findTopic(subject);
      if (topic) {
        showTopicHelp(topic);
        return;
      }

      error(`command ${subject} not found`);
    }

    const commandsGroup: Record<string, number> =
      FeatureFlag.getSingleton().getFeatureFlagInfo<Record<string, number>>(
        "COMMANDS_GROUP"
      );
    const commandsId: Record<number, string> =
      FeatureFlag.getSingleton().getFeatureFlagInfo<Record<number, string>>(
        "COMMANDS_GROUP_ID"
      );
    const commandsGroupLength: number = Object.keys(commandsId).length;

    const commands = this.config.commands
      .filter((c) => !c.id.includes(":"))
      .map((c) => {
        return { name: c.id, description: c.description };
      });
    const topics = this.config.topics
      .filter((t) => !t.name.includes(":"))
      .map((c) => {
        return { name: c.name, description: c.description };
      });
    const allCommands = commands.concat(topics);

    const groups: CommandI[][] = Object.keys(commandsId).map((_) => []);

    const cachedObject: Map<string, boolean> = new Map<string, boolean>();

    allCommands.forEach((command: CommandI) => {
      if (cachedObject.has(command.name)) return;
      cachedObject.set(command.name, true);

      const commandGroupId = commandsGroup[command.name];

      if (commandGroupId) {
        groups[commandGroupId].push(command);
      } else {
        groups[commandsGroupLength - 1].push(command);
      }
    });

    const renderedCommands = renderCommands(commandsId, groups, {
      render: this.render,
      opts: this.opts,
      config: this.config,
    });

    console.log(renderedCommands);
  };

  process.on("unhandledRejection", onError);

  process.on("exit", () => {});

  await main();
}
