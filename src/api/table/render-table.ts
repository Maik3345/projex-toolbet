import chalk from 'chalk';

import { createTable } from './table';

/**
 * Renders a table of commits to the console with a given title and list of items.
 *
 * @param params - An object containing the following properties:
 * @param params.title - The title to display as the table header.
 * @param params.emptyMessage - The message to display if the list is empty.
 * @param params.listArray - The array of commit messages or items to display in the table.
 *
 * @remarks
 * - If the list is empty, an error message and a tip are displayed.
 * - Each item in the list is displayed with an index and styled output.
 * - Uses `chalk` for colored console output and `createTable` for table formatting.
 */
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
    return console.log(
      `${chalk.red('❌ ' + emptyMessage)}\n${chalk.yellow('💡 Tip: Make a commit to see it listed here.')}`,
    );
  }

  const table = createTable({
    head: [chalk.green('🔢 #'), chalk.green(title)],
  });

  listArray.forEach((text: string, index: number) => {
    table.push([`${index + 1}`, `${chalk.blue(text)}`]);
  });

  console.log(`${table.toString()}\n`);
  console.log(chalk.green('✅ Table rendered successfully.'));
};

/**
 * Renders a table displaying release versions and their corresponding values to the console.
 *
 * If the provided list is empty, displays an error message and a helpful tip.
 * Otherwise, prints a formatted table with version information and a success message.
 *
 * @param params - The parameters for rendering the table.
 * @param params.emptyMessage - The message to display if the list is empty.
 * @param params.listArray - An array of objects containing the version text and value to display in the table.
 *
 * @returns void
 */
export const renderTableOfReleaseVersions = ({
  emptyMessage,
  listArray,
}: {
  emptyMessage: string;
  listArray: { text: string; value: string }[];
}): void => {
  if (listArray.length === 0) {
    return console.log(
      `${chalk.red('❌ ' + emptyMessage)}\n${chalk.yellow('💡 Tip: Run a release to generate a version entry.')}`,
    );
  }

  const table = createTable({
    head: [chalk.green('🏷️ Version'), chalk.green('Value')],
  });

  listArray.forEach((item) => {
    table.push([item.text, item.value]);
  });

  console.log(`${table.toString()}\n`);
  console.log(chalk.green('✅ Table rendered successfully.'));
};
