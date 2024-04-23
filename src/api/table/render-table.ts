const chalk = require('chalk');
import { createTable } from "./table";

export const renderTableOfCommits = ({
  title,
  emptyMessage,
  listArray,
}: {
  title: string;
  emptyMessage: string;
  listArray: any;
}): void => {
  if (listArray.length === 0) {
    return console.log(`${chalk.red(emptyMessage)}\n`);
  }

  const table = createTable({
    head: ["#", title],
  });

  listArray.forEach((text: string, index: number) => {
    table.push([`${index + 1}`, `${chalk.blue(text)}`]);
  });

  console.log(`${table.toString()}\n`);
};

export const renderTableOfReleaseVersions = ({
  emptyMessage,
  listArray,
}: {
  emptyMessage: string;
  listArray: { text: string; value: string }[];
}): void => {
  if (listArray.length === 0) {
    return console.log(`${chalk.red(emptyMessage)}\n`);
  }

  const table = createTable({
    head: ["Version", "Value"],
  });

  listArray.forEach((item) => {
    table.push([item.text, item.value]);
  });

  console.log(`${table.toString()}\n`);
};
